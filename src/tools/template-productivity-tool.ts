import { parse } from 'yaml';
import { createProjectPatch } from './project-patch-tool.js';
import { createHash } from 'node:crypto';

function normalizeFiles(files: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([path, content]) => [
      path.replace(/\\/g, '/').replace(/^\.\//, ''),
      content,
    ])
  );
}

function overridePaths(files: Record<string, string>): string[] {
  return Object.keys(files).filter(path =>
    /^controllers\/[^/]+\/(?:backend\/)?[^/]+\.tpl\.php$/.test(path)
  );
}

function findSource(files: Record<string, string>, override: string): string | undefined {
  return Object.keys(files).find(path => path === override || path.endsWith(`/${override}`));
}

function applySingleUpstreamDelta(base: string, current: string, incoming: string): string | null {
  let prefix = 0;
  while (prefix < base.length && prefix < incoming.length && base[prefix] === incoming[prefix])
    prefix += 1;
  let suffix = 0;
  while (
    suffix < base.length - prefix &&
    suffix < incoming.length - prefix &&
    base[base.length - 1 - suffix] === incoming[incoming.length - 1 - suffix]
  )
    suffix += 1;
  const removed = base.slice(prefix, base.length - suffix);
  const added = incoming.slice(prefix, incoming.length - suffix);
  if (!removed) return null;
  const first = current.indexOf(removed);
  if (first < 0 || current.indexOf(removed, first + removed.length) >= 0) return null;
  return `${current.slice(0, first)}${added}${current.slice(first + removed.length)}`;
}

export function mergeTemplateOverrides(
  themeFilesInput: Record<string, string>,
  upstreamBeforeInput: Record<string, string>,
  upstreamAfterInput: Record<string, string>
) {
  const themeFiles = normalizeFiles(themeFilesInput);
  const upstreamBefore = normalizeFiles(upstreamBeforeInput);
  const upstreamAfter = normalizeFiles(upstreamAfterInput);
  const mergedFiles = { ...themeFiles };
  const results = overridePaths(themeFiles).map(path => {
    const beforePath = findSource(upstreamBefore, path);
    const afterPath = findSource(upstreamAfter, path);
    if (!beforePath || !afterPath) {
      return { path, status: !afterPath ? 'missing_upstream' : 'missing_base', auto_merged: false };
    }
    const base = upstreamBefore[beforePath];
    const current = themeFiles[path];
    const incoming = upstreamAfter[afterPath];
    if (current === base) {
      mergedFiles[path] = incoming;
      return { path, status: 'updated_from_upstream', auto_merged: true };
    }
    if (incoming === base || current === incoming) {
      return { path, status: 'already_compatible', auto_merged: true };
    }
    const deltaMerged = applySingleUpstreamDelta(base, current, incoming);
    if (deltaMerged !== null) {
      mergedFiles[path] = deltaMerged;
      return { path, status: 'upstream_delta_applied', auto_merged: true };
    }
    return { path, status: 'conflict', auto_merged: false };
  });
  return {
    files: mergedFiles,
    patch: createProjectPatch(themeFiles, mergedFiles),
    summary: {
      checked: results.length,
      auto_merged: results.filter(item => item.auto_merged).length,
      conflicts: results.filter(item => item.status === 'conflict').length,
      missing_upstream: results.filter(item => item.status === 'missing_upstream').length,
    },
    results,
  };
}

export interface FrontendDiagnostic {
  code: string;
  severity: 'error' | 'warning' | 'info';
  path: string;
  message: string;
}

export function auditTemplateFrontend(filesInput: Record<string, string>) {
  const files = normalizeFiles(filesInput);
  const diagnostics: FrontendDiagnostic[] = [];
  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('.tpl.php') || path.endsWith('.html')) {
      for (const match of content.matchAll(/<img\b([^>]*)>/gi)) {
        if (!/\balt\s*=/.test(match[1]))
          diagnostics.push({
            code: 'IMAGE_MISSING_ALT',
            severity: 'warning',
            path,
            message: 'Image is missing an alt attribute.',
          });
      }
      for (const match of content.matchAll(/<a\b([^>]*)>/gi)) {
        if (
          /\btarget\s*=\s*['"]_blank['"]/i.test(match[1]) &&
          !/\brel\s*=\s*['"][^'"]*(?:noopener|noreferrer)/i.test(match[1])
        )
          diagnostics.push({
            code: 'UNSAFE_BLANK_TARGET',
            severity: 'warning',
            path,
            message: 'target="_blank" should use rel="noopener".',
          });
      }
      const ids = [...content.matchAll(/\bid\s*=\s*['"]([^'"?]+)['"]/gi)].map(match => match[1]);
      for (const id of [...new Set(ids.filter((item, index) => ids.indexOf(item) !== index))])
        diagnostics.push({
          code: 'DUPLICATE_HTML_ID',
          severity: 'error',
          path,
          message: `Duplicate HTML id: ${id}`,
        });
      const headings = [...content.matchAll(/<h([1-6])\b/gi)].map(match => Number(match[1]));
      for (let index = 1; index < headings.length; index += 1)
        if (headings[index] - headings[index - 1] > 1)
          diagnostics.push({
            code: 'SKIPPED_HEADING_LEVEL',
            severity: 'warning',
            path,
            message: `Heading level jumps from h${headings[index - 1]} to h${headings[index]}.`,
          });
      if (/\becho\s+\$(?!this\b)[a-z_][a-z0-9_]*(?:\[[^\]]+\])?\s*;/i.test(content))
        diagnostics.push({
          code: 'POSSIBLE_UNESCAPED_OUTPUT',
          severity: 'warning',
          path,
          message: 'Variable output may require context-aware escaping.',
        });
      if (/<html\b(?![^>]*\blang=)/i.test(content))
        diagnostics.push({
          code: 'HTML_LANG_MISSING',
          severity: 'warning',
          path,
          message: 'The html element should declare a language.',
        });
    }
    if (path.endsWith('.css')) {
      const hardcoded = content.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi) ?? [];
      if (hardcoded.length > 12)
        diagnostics.push({
          code: 'MANY_HARDCODED_COLORS',
          severity: 'info',
          path,
          message: `${hardcoded.length} hardcoded colors found; consider design tokens.`,
        });
    }
  }
  return {
    is_valid: !diagnostics.some(item => item.severity === 'error'),
    summary: {
      errors: diagnostics.filter(item => item.severity === 'error').length,
      warnings: diagnostics.filter(item => item.severity === 'warning').length,
      info: diagnostics.filter(item => item.severity === 'info').length,
    },
    diagnostics,
  };
}

export function extractTemplateDesignTokens(filesInput: Record<string, string>) {
  const files = normalizeFiles(filesInput);
  const customProperties: Record<string, string> = {};
  const colors = new Map<string, number>();
  const spacing = new Map<string, number>();
  for (const [path, content] of Object.entries(files)) {
    if (!/\.(?:css|scss)$/.test(path)) continue;
    for (const match of content.matchAll(/(--[a-z0-9_-]+)\s*:\s*([^;}]+)[;}]/gi))
      customProperties[match[1]] = match[2].trim();
    for (const match of content.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi))
      colors.set(match[0].toLowerCase(), (colors.get(match[0].toLowerCase()) ?? 0) + 1);
    for (const match of content.matchAll(
      /(?:margin|padding|gap)(?:-[a-z]+)?\s*:\s*([0-9.]+(?:px|rem|em))/gi
    ))
      spacing.set(match[1], (spacing.get(match[1]) ?? 0) + 1);
  }
  const suggestedColors = [...colors].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const suggestedSpacing = [...spacing].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const css = [
    ':root {',
    ...suggestedColors.map(([value], index) => `  --color-${index + 1}: ${value};`),
    ...suggestedSpacing.map(([value], index) => `  --space-${index + 1}: ${value};`),
    '}',
  ].join('\n');
  return {
    existing_custom_properties: customProperties,
    colors: suggestedColors.map(([value, uses]) => ({ value, uses })),
    spacing: suggestedSpacing.map(([value, uses]) => ({ value, uses })),
    suggested_tokens_css: `${css}\n`,
  };
}

function positionsFromLayout(content: string): string[] {
  try {
    const document = parse(content);
    const found: string[] = [];
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(visit);
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (key === 'position' && typeof child === 'string') found.push(child);
        visit(child);
      }
    };
    visit(document);
    return found;
  } catch {
    return [];
  }
}

export function auditTemplateWidgetPositions(filesInput: Record<string, string>) {
  const files = normalizeFiles(filesInput);
  const rendered = [
    ...new Set(
      Object.values(files).flatMap(content =>
        [...content.matchAll(/\bwidgets\(\s*['"]([^'"]+)['"]/g)].map(match => match[1])
      )
    ),
  ].sort();
  const checked = [
    ...new Set(
      Object.values(files).flatMap(content =>
        [...content.matchAll(/\bhasWidgetsOn\(\s*['"]([^'"]+)['"]/g)].map(match => match[1])
      )
    ),
  ].sort();
  const layout = [
    ...new Set(
      Object.entries(files)
        .filter(([path]) => /\.ya?ml$/i.test(path))
        .flatMap(([, content]) => positionsFromLayout(content))
    ),
  ].sort();
  return {
    rendered_positions: rendered,
    guarded_positions: checked,
    layout_positions: layout,
    layout_not_rendered: layout.filter(position => !rendered.includes(position)),
    rendered_not_in_layout: rendered.filter(position => !layout.includes(position)),
    unguarded_positions: rendered.filter(position => !checked.includes(position)),
  };
}

export function scaffoldTemplateE2eEnvironment(options: { theme: string; base_url?: string }) {
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(options.theme)) throw new Error('Invalid theme name');
  const baseUrl = options.base_url ?? 'http://web';
  return {
    files: {
      'template-e2e/compose.yaml': `services:\n  web:\n    build: ./php\n    ports: ["8080:80"]\n    volumes:\n      - \${INSTANTCMS_SOURCE:-../instantcms}:/var/www/html\n  db:\n    image: mysql:8.0\n    environment:\n      MYSQL_DATABASE: instantcms\n      MYSQL_USER: instantcms\n      MYSQL_PASSWORD: instantcms\n      MYSQL_ROOT_PASSWORD: root\n  visual:\n    image: mcr.microsoft.com/playwright:v1.52.0-noble\n    working_dir: /tests\n    volumes:\n      - ./:/tests\n    environment:\n      BASE_URL: ${baseUrl}\n    command: ["npx", "playwright", "test"]\n    depends_on: [web]\n`,
      'template-e2e/php/Dockerfile': `FROM php:8.2-apache\nRUN apt-get update && apt-get install -y libicu-dev libpng-dev libzip-dev unzip && docker-php-ext-install intl mysqli gd zip && rm -rf /var/lib/apt/lists/*\nRUN a2enmod rewrite\n`,
      'template-e2e/package.json': JSON.stringify(
        {
          private: true,
          devDependencies: { '@playwright/test': '1.52.0' },
          scripts: { test: 'playwright test', update: 'playwright test --update-snapshots' },
        },
        null,
        2
      ),
      'template-e2e/playwright.config.mjs': `import { defineConfig, devices } from '@playwright/test';\nexport default defineConfig({\n  testDir: './tests',\n  outputDir: './artifacts',\n  use: { baseURL: process.env.BASE_URL || 'http://localhost:8080', screenshot: 'only-on-failure' },\n  projects: [\n    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },\n    { name: 'mobile', use: { ...devices['Pixel 7'] } }\n  ]\n});\n`,
      'template-e2e/tests/template.spec.mjs': `import { test, expect } from '@playwright/test';\nconst pages = (process.env.TEST_PATHS || '/').split(',');\nfor (const path of pages) test(\`${options.theme}: \${path}\`, async ({ page }) => {\n  const errors = [];\n  page.on('console', message => message.type() === 'error' && errors.push(message.text()));\n  page.on('pageerror', error => errors.push(error.message));\n  const response = await page.goto(path, { waitUntil: 'networkidle' });\n  expect(response?.ok()).toBeTruthy();\n  await expect(page).toHaveScreenshot(\`${options.theme}-\${path.replace(/\\W+/g, '-') || 'home'}.png\`, { fullPage: true });\n  expect(errors).toEqual([]);\n});\n`,
      'template-e2e/.env.example':
        'INSTANTCMS_SOURCE=../instantcms\nBASE_URL=http://web\nTEST_PATHS=/,/login\n',
      'template-e2e/README.md': `# ${options.theme} visual tests\n\nMount an installed InstantCMS source tree with this theme enabled, then run:\n\n\`\`\`sh\ndocker compose run --rm visual npm install\ndocker compose run --rm visual npx playwright test --update-snapshots\ndocker compose run --rm visual npx playwright test\n\`\`\`\n\nKeep approved snapshots in version control. Configure INSTANTCMS_SOURCE, BASE_URL and TEST_PATHS in .env.\n`,
    },
    notes: [
      'The InstantCMS source must already be configured for the bundled MySQL service or another reachable database.',
      'Commit approved screenshots and review diffs in pull requests.',
      'Run desktop and mobile projects before release.',
    ],
  };
}

export function indexUpstreamTemplateSources(
  filesInput: Record<string, string>,
  source: { repository: string; ref: string }
) {
  const files = normalizeFiles(filesInput);
  const templates = Object.entries(files)
    .filter(([path]) => path.endsWith('.tpl.php'))
    .map(([path, content]) => {
      const match = path.match(/(?:^|\/)controllers\/([^/]+)\/(backend\/)?([^/]+)\.tpl\.php$/);
      return {
        path,
        sha256: createHash('sha256').update(content).digest('hex'),
        bytes: Buffer.byteLength(content),
        controller: match?.[1] ?? null,
        action: match?.[3] ?? null,
        backend: Boolean(match?.[2]),
        source_url: `https://github.com/${source.repository}/blob/${encodeURIComponent(source.ref)}/${path}`,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  return {
    repository: source.repository,
    ref: source.ref,
    files_indexed: templates.length,
    controllers: [...new Set(templates.flatMap(item => item.controller ?? []))].sort(),
    templates,
  };
}

export function scaffoldTemplatePhpQuality(options: { theme: string; php_min?: string }) {
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(options.theme)) throw new Error('Invalid theme name');
  const phpMin = options.php_min ?? '7.2';
  if (!/^\d+\.\d+$/.test(phpMin)) throw new Error('php_min must use major.minor format');
  return {
    files: {
      'composer.quality.json': JSON.stringify(
        {
          require: { php: `>=${phpMin}` },
          'require-dev': {
            'phpstan/phpstan': '^1.12 || ^2.0',
            'squizlabs/php_codesniffer': '^3.10',
            'phpcompatibility/php-compatibility': '^9.3',
            'dealerdirect/phpcodesniffer-composer-installer': '^1.0',
          },
          config: { 'allow-plugins': { 'dealerdirect/phpcodesniffer-composer-installer': true } },
          scripts: {
            'quality:phpstan': 'phpstan analyse -c phpstan.neon',
            'quality:phpcs': 'phpcs --standard=phpcs.xml',
          },
        },
        null,
        2
      ),
      'phpstan.neon': `parameters:\n  level: 1\n  paths:\n    - templates/${options.theme}\n  fileExtensions:\n    - php\n  reportUnmatchedIgnoredErrors: false\n`,
      'phpcs.xml': `<?xml version="1.0"?>\n<ruleset name="InstantCMS template quality">\n  <description>Syntax, style and PHP ${phpMin}+ compatibility for ${options.theme}.</description>\n  <file>templates/${options.theme}</file>\n  <exclude-pattern>*/vendor/*</exclude-pattern>\n  <rule ref="PSR12"/>\n  <rule ref="PHPCompatibility">\n    <properties><property name="testVersion" value="${phpMin}-"/></properties>\n  </rule>\n</ruleset>\n`,
    },
    commands: [
      'COMPOSER=composer.quality.json composer install --no-interaction',
      'vendor/bin/phpstan analyse -c phpstan.neon',
      'vendor/bin/phpcs --standard=phpcs.xml',
    ],
    notes: [
      'Merge require-dev entries into the project composer.json instead of replacing existing dependencies.',
      'Review framework-dependent PHPStan findings before suppressing them.',
    ],
  };
}
