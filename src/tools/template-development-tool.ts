import { parse } from 'yaml';
import { scaffoldTemplate } from './scaffold-tool.js';
import { scaffoldLayoutScheme, type RowDef } from './layout-tool.js';

const safeNamePattern = /^[a-z][a-z0-9_]{1,63}$/;

function normalizeFiles(files: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([path, content]) => [
      path.replace(/\\/g, '/').replace(/^\.\//, ''),
      content,
    ])
  );
}

function assertSafeName(value: string, label: string): void {
  if (!safeNamePattern.test(value)) throw new Error(`${label} must match ${safeNamePattern}`);
}

export function scaffoldCompleteTemplate(options: {
  name: string;
  title: string;
  author?: string;
  inherit?: string[];
  with_layout_scheme?: boolean;
}) {
  assertSafeName(options.name, 'Template name');
  const base = scaffoldTemplate({
    name: options.name,
    title: options.title,
    author: options.author,
  }) as {
    files: Record<string, string>;
    [key: string]: unknown;
  };
  const files = { ...base.files };
  files['manifest.php'] = files['manifest.php'].replace(
    "'has_options'                => true",
    "'has_options'                => false"
  );
  const inherits = (options.inherit ?? []).filter(Boolean);
  if (inherits.length) {
    for (const item of inherits) assertSafeName(item, 'Inherited template name');
    files['manifest.php'] = files['manifest.php'].replace(
      'return [',
      `return [\n    'inherit' => [${inherits.map(item => `'${item}'`).join(', ')}],`
    );
  }
  files['js/main.js'] =
    `(() => {\n    'use strict';\n    document.documentElement.classList.add('js');\n})();\n`;
  files['widgets/wrapper.tpl.php'] =
    `<section class="widget<?= !empty($widget->css_class) ? ' ' . html($widget->css_class) : '' ?>">\n    <?php if (!empty($widget->title)): ?>\n        <h2 class="widget-title"><?= html($widget->title) ?></h2>\n    <?php endif ?>\n    <div class="widget-body"><?= $widget->body ?></div>\n</section>\n`;
  files['main.tpl.php'] = files['main.tpl.php'].replace(
    "<?= $this->linkCSS('css/main.css') ?>",
    "<?= $this->linkCSS('css/main.css') ?>\n    <?= $this->linkJS('js/main.js') ?>"
  );

  const layout =
    options.with_layout_scheme === false
      ? null
      : scaffoldLayoutScheme({
          template: options.name,
          rows: [
            {
              title: 'Header',
              outer_tag: 'header',
              cols: [{ title: 'Header', position: 'header', col_class: 'col-12' }],
            },
            {
              title: 'Content',
              tag: 'main',
              cols: [
                { title: 'Main', position: 'content', col_class: 'col-lg-8' },
                { title: 'Sidebar', position: 'right-top', col_class: 'col-lg-4' },
              ],
            },
            {
              title: 'Footer',
              outer_tag: 'footer',
              cols: [{ title: 'Footer', position: 'footer', col_class: 'col-12' }],
            },
          ],
        });

  return {
    ...base,
    files,
    layout_scheme: layout,
    checklist: [
      `Install files into /templates/${options.name}/.`,
      'Import layout_scheme.yaml through the template layout administration UI if required.',
      'Run analyze_instantcms_template and validate_layout_scheme before packaging.',
    ],
  };
}

export function analyzeInstantCmsTemplate(filesInput: Record<string, string>, theme?: string) {
  const normalized = normalizeFiles(filesInput);
  if (theme) assertSafeName(theme, 'Theme name');
  const discovered = [
    ...new Set(
      Object.keys(normalized).flatMap(
        path => path.match(/(?:^|\/)templates\/([^/]+)\/manifest\.php$/)?.[1] ?? []
      )
    ),
  ];
  const selectedTheme = theme ?? (discovered.length === 1 ? discovered[0] : null);
  const prefix = selectedTheme ? `templates/${selectedTheme}/` : '';
  const files = prefix
    ? Object.fromEntries(
        Object.entries(normalized)
          .filter(([path]) => path.startsWith(prefix))
          .map(([path, content]) => [path.slice(prefix.length), content])
      )
    : normalized;
  const paths = Object.keys(files);
  const diagnostics: Array<{
    code: string;
    severity: 'error' | 'warning';
    path: string;
    message: string;
  }> = [];
  if (!theme && discovered.length > 1) {
    diagnostics.push({
      code: 'MULTIPLE_TEMPLATES_FOUND',
      severity: 'error',
      path: 'templates/',
      message: `Multiple templates found (${discovered.join(', ')}); select one with the theme parameter.`,
    });
  }
  for (const required of ['manifest.php', 'main.tpl.php']) {
    if (!(required in files))
      diagnostics.push({
        code: 'MISSING_TEMPLATE_FILE',
        severity: 'error',
        path: required,
        message: `Required template file ${required} is missing.`,
      });
  }
  if (files['manifest.json'])
    diagnostics.push({
      code: 'INVALID_TEMPLATE_MANIFEST',
      severity: 'error',
      path: 'manifest.json',
      message: 'InstantCMS templates use manifest.php, not manifest.json.',
    });
  if (files['main.tpl.php'] && !files['main.tpl.php'].includes('$this->body()'))
    diagnostics.push({
      code: 'MISSING_TEMPLATE_BODY',
      severity: 'error',
      path: 'main.tpl.php',
      message: 'Main template does not render $this->body().',
    });
  const phpTemplates = paths.filter(path => path.endsWith('.tpl.php'));
  for (const path of phpTemplates) {
    const content = files[path];
    if (/echo\s+\$(?!this\b)[a-z_][a-z0-9_]*(?:\[[^\]]+\])?\s*;/i.test(content))
      diagnostics.push({
        code: 'POSSIBLE_UNESCAPED_TEMPLATE_OUTPUT',
        severity: 'warning',
        path,
        message: 'Variable output may require context-aware escaping.',
      });
  }
  const positions = [
    ...new Set(
      Object.values(files).flatMap(content =>
        [...content.matchAll(/(?:widgets|hasWidgetsOn)\(\s*['"]([^'"]+)['"]/g)].map(
          match => match[1]
        )
      )
    ),
  ].sort();
  const overrides = paths.filter(path =>
    /^controllers\/[^/]+\/(?:backend\/)?[^/]+\.tpl\.php$/.test(path)
  );
  const layoutFiles = paths.filter(path => /(?:^|\/)layout[^/]*\.(?:ya?ml)$/i.test(path));
  return {
    theme: selectedTheme,
    discovered_themes: discovered,
    is_valid: !diagnostics.some(item => item.severity === 'error'),
    summary: {
      files: paths.length,
      php_templates: phpTemplates.length,
      overrides: overrides.length,
      positions: positions.length,
      layouts: layoutFiles.length,
    },
    widget_positions: positions,
    overrides,
    layout_files: layoutFiles,
    diagnostics,
  };
}

export function scaffoldTemplateOverride(options: {
  theme: string;
  source_path: string;
  source_content: string;
  controller?: string;
  action?: string;
  backend?: boolean;
}) {
  assertSafeName(options.theme, 'Theme name');
  const source = options.source_path.replace(/\\/g, '/').replace(/^\.\//, '');
  const match = source.match(
    /(?:^|\/)(?:templates\/[^/]+\/)?controllers\/([^/]+)\/(backend\/)?([^/]+\.tpl\.php)$/
  );
  const controller = options.controller ?? match?.[1];
  const actionFile = options.action ? `${options.action}.tpl.php` : match?.[3];
  const backend = options.backend ?? Boolean(match?.[2]);
  if (!controller || !actionFile)
    throw new Error('Controller and action could not be derived from source_path');
  assertSafeName(controller, 'Controller name');
  if (!/^[a-z][a-z0-9_]{0,63}\.tpl\.php$/.test(actionFile))
    throw new Error('Invalid template action');
  const relative = `controllers/${controller}/${backend ? 'backend/' : ''}${actionFile}`;
  return {
    theme: options.theme,
    source_path: source,
    target_path: `templates/${options.theme}/${relative}`,
    files: { [relative]: options.source_content },
    review_notes: [
      'Keep the override as small as possible.',
      'Record the upstream InstantCMS version or commit used as the source.',
      'Recheck this override when the upstream source template changes.',
    ],
  };
}

function collectLayoutPositions(value: unknown, positions: string[]): void {
  if (Array.isArray(value)) return value.forEach(item => collectLayoutPositions(item, positions));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'position' && typeof child === 'string') positions.push(child);
    collectLayoutPositions(child, positions);
  }
}

export function validateLayoutScheme(yaml: string) {
  const diagnostics: Array<{ code: string; severity: 'error' | 'warning'; message: string }> = [];
  let document: unknown;
  try {
    document = parse(yaml);
  } catch (error) {
    return {
      is_valid: false,
      positions: [],
      diagnostics: [
        {
          code: 'INVALID_LAYOUT_YAML',
          severity: 'error' as const,
          message: error instanceof Error ? error.message : 'Invalid YAML',
        },
      ],
    };
  }
  if (!document || typeof document !== 'object' || !('layout' in document))
    diagnostics.push({
      code: 'MISSING_LAYOUT_ROOT',
      severity: 'error',
      message: 'Layout YAML must contain a layout root.',
    });
  const positions: string[] = [];
  collectLayoutPositions(document, positions);
  const duplicates = [
    ...new Set(positions.filter((item, index) => positions.indexOf(item) !== index)),
  ];
  if (duplicates.length)
    diagnostics.push({
      code: 'DUPLICATE_LAYOUT_POSITION',
      severity: 'warning',
      message: `Duplicate positions: ${duplicates.join(', ')}`,
    });
  if (!positions.length)
    diagnostics.push({
      code: 'MISSING_LAYOUT_POSITIONS',
      severity: 'warning',
      message: 'No widget positions were found.',
    });
  return {
    is_valid: !diagnostics.some(item => item.severity === 'error'),
    positions: [...new Set(positions)],
    diagnostics,
  };
}

export function checkTemplateOverrideCompatibility(
  themeFilesInput: Record<string, string>,
  upstreamBeforeInput: Record<string, string>,
  upstreamAfterInput: Record<string, string>
) {
  const themeFiles = normalizeFiles(themeFilesInput);
  const before = normalizeFiles(upstreamBeforeInput);
  const after = normalizeFiles(upstreamAfterInput);
  const overrides = Object.keys(themeFiles).filter(path =>
    /^controllers\/[^/]+\/(?:backend\/)?[^/]+\.tpl\.php$/.test(path)
  );
  const findSource = (files: Record<string, string>, override: string) =>
    Object.keys(files).find(path => path === override || path.endsWith(`/${override}`));
  const results = overrides.map(path => {
    const beforePath = findSource(before, path);
    const afterPath = findSource(after, path);
    const status = !afterPath
      ? 'missing_upstream'
      : !beforePath
        ? 'untracked'
        : before[beforePath] !== after[afterPath]
          ? 'upstream_changed'
          : 'compatible';
    return {
      path,
      status,
      upstream_before: beforePath ?? null,
      upstream_after: afterPath ?? null,
      requires_review: status !== 'compatible',
    };
  });
  return {
    overrides_checked: overrides.length,
    requires_review: results.filter(item => item.requires_review).length,
    results,
  };
}

export type { RowDef };
