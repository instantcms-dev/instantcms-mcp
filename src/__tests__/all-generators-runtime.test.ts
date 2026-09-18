/**
 * Runtime-контракт всех генераторов против реального исходника InstantCMS.
 *
 * `php -l` не видит отсутствующие константы, методы и трейты, утёкшие escape-последовательности
 * и несовместимые переопределения. Этот тест прогоняет каждый генератор и проверяет
 * синтаксис плюс существование всех использованных символов.
 *
 * Источник: ICMS_SOURCE → ~/Sites/idev.test → .cache/icms2. Без источника тест пропускается.
 */
import { describe, expect, test } from '@jest/globals';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { validateGeneratedArtifacts } from '../tools/artifact-tool.js';
import { scaffoldHook } from '../tools/addon-tool.js';
import { scaffoldAddon } from '../tools/scaffold-tool.js';
import { scaffoldAdminPartial } from '../tools/admin-partial-tool.js';
import { scaffoldApi } from '../tools/api-tool.js';
import { scaffoldCache } from '../tools/cache-tool.js';
import { scaffoldComponent } from '../tools/component-tool.js';
import { scaffoldCron } from '../tools/cron-tool.js';
import { scaffoldCrud } from '../tools/crud-tool.js';
import { scaffoldEmail } from '../tools/email-tool.js';
import { scaffoldExternalApi } from '../tools/external-api-tool.js';
import { scaffoldFilter } from '../tools/filter-tool.js';
import { scaffoldForm } from '../tools/form-tool.js';
import { scaffoldGrid } from '../tools/grid-tool.js';
import { scaffoldImportExport } from '../tools/import-export-tool.js';
import { scaffoldLang } from '../tools/lang-tool.js';
import { scaffoldLayoutOverride } from '../tools/layout-override-tool.js';
import { scaffoldLayoutScheme } from '../tools/layout-tool.js';
import { generateMigration } from '../tools/migration-tool.js';
import { scaffoldOAuth } from '../tools/oauth-tool.js';
import { scaffoldPermission } from '../tools/permission-tool.js';
import { scaffoldSeo } from '../tools/seo-tool.js';
import { scaffoldTemplate } from '../tools/scaffold-tool.js';
import { scaffoldTest } from '../tools/test-tool.js';
import { scaffoldWidget } from '../tools/widget-tool.js';

function locateSource(): string | null {
  const candidates = [
    process.env.ICMS_SOURCE,
    path.join(os.homedir(), 'Sites', 'idev.test'),
    path.join(process.cwd(), '.cache', 'icms2'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return (
    candidates.find(candidate => fs.existsSync(path.join(candidate, 'system', 'core'))) ?? null
  );
}

const SITE = locateSource();
const sourceRequired = process.env.ICMS_REQUIRE_SOURCE === '1';
const read = (rel: string): string => {
  if (!SITE) return '';
  try {
    return fs.readFileSync(path.join(SITE, rel), 'utf8');
  } catch {
    return '';
  }
};

const methodsOf = (rel: string): Set<string> => {
  const out = new Set<string>();
  const re = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  let m;
  const c = read(rel);
  while ((m = re.exec(c))) out.add(m[1].toLowerCase());
  return out;
};

const propsOf = (rel: string): Map<string, string> => {
  const out = new Map<string, string>();
  const re = /^\s*(public|protected|private)\s+(?:static\s+)?\$([a-zA-Z_][a-zA-Z0-9_]*)/gm;
  let m;
  const c = read(rel);
  while ((m = re.exec(c))) out.set(m[2], m[1]);
  return out;
};

const shapeOf = (rel: string): Map<string, { required: number; total: number }> => {
  const out = new Map<string, { required: number; total: number }>();
  const re = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
  let m;
  const c = read(rel);
  while ((m = re.exec(c))) {
    const params = m[2]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    out.set(m[1].toLowerCase(), {
      required: params.filter(s => !s.includes('=')).length,
      total: params.length,
    });
  }
  return out;
};

const core = {
  template: methodsOf('system/core/template.php'),
  controller: methodsOf('system/core/controller.php'),
  request: methodsOf('system/core/request.php'),
  response: methodsOf('system/core/response.php'),
  modelShape: shapeOf('system/core/model.php'),
  modelProps: propsOf('system/core/model.php'),
  controllerProps: propsOf('system/core/controller.php'),
  backendProps: propsOf('system/core/backend.php'),
  frontendProps: propsOf('system/core/frontend.php'),
  coreMethods: methodsOf('system/core/core.php'),
  events: methodsOf('system/core/eventsmanager.php'),
  form: methodsOf('system/core/form.php'),
  user: methodsOf('system/core/user.php'),
};

const globalLang = new Set<string>();
const adminLang = new Set<string>();
for (const [target, rel] of [
  [globalLang, 'system/languages/ru/language.php'],
  [adminLang, 'system/languages/ru/controllers/admin/admin.php'],
] as Array<[Set<string>, string]>) {
  const re = /define\(\s*'(LANG_[A-Z0-9_]+)'/g;
  let m;
  const c = read(rel);
  while ((m = re.exec(c))) target.add(m[1]);
}

const VIS: Record<string, number> = { public: 2, protected: 1, private: 0 };

interface Case {
  name: string;
  run: () => Record<string, unknown>;
}

const cases: Case[] = [
  {
    name: 'scaffold_addon/basic',
    run: () => asFiles(scaffoldAddon({ name: 'genaddon', title: 'Gen Addon', type: 'basic' })),
  },
  {
    name: 'scaffold_addon/with_admin',
    run: () => asFiles(scaffoldAddon({ name: 'genadmin', title: 'Gen Admin', type: 'with_admin' })),
  },
  {
    name: 'scaffold_addon/with_hooks',
    run: () =>
      asFiles(
        scaffoldAddon({
          name: 'genhooks',
          title: 'Gen Hooks',
          type: 'with_hooks',
          hooks: ['content_after_add_approve'],
        })
      ),
  },
  {
    name: 'scaffold_addon/with_routes',
    run: () =>
      asFiles(scaffoldAddon({ name: 'genroutes', title: 'Gen Routes', type: 'with_routes' })),
  },
  {
    name: 'scaffold_addon/with_widget',
    run: () =>
      asFiles(scaffoldAddon({ name: 'genwidget', title: 'Gen Widget', type: 'with_widget' })),
  },
  {
    name: 'scaffold_template(theme)',
    run: () => asFiles(scaffoldTemplate({ name: 'gentheme', title: 'Gen Theme' })),
  },
  {
    name: 'scaffold_crud',
    run: () =>
      asFiles(
        scaffoldCrud({
          addon_name: 'gencrud',
          fields: [
            { name: 'title', type: 'varchar', title: 'Заголовок' },
            { name: 'price', type: 'decimal', title: 'Цена' },
          ],
        })
      ),
  },
  {
    name: 'scaffold_crud/category',
    run: () =>
      asFiles(
        scaffoldCrud({
          addon_name: 'gencat',
          fields: [{ name: 'title', type: 'varchar', title: 'Заголовок' }],
          options: { use_category: true },
        })
      ),
  },
  {
    name: 'scaffold_form',
    run: () =>
      asFiles(
        scaffoldForm({
          addon_name: 'genform',
          form_name: 'item',
          fields: [
            { name: 'title', type: 'varchar', title: 'Title' },
            { name: 'body', type: 'html', title: 'Body' },
            { name: 'price', type: 'decimal', title: 'Price' },
            { name: 'is_active', type: 'checkbox', title: 'Active' },
          ],
          options: { use_tabs: true },
        })
      ),
  },
  {
    name: 'scaffold_grid',
    run: () =>
      asFiles(
        scaffoldGrid({
          addon_name: 'gengrid',
          grid_name: 'items',
          columns: [
            { name: 'id', title: 'ID', width: 60 },
            { name: 'title', title: 'Title', filter: 'like' },
            { name: 'is_pub', title: 'Published', flag: true },
          ],
        })
      ),
  },
  {
    name: 'scaffold_api',
    run: () =>
      asFiles(
        scaffoldApi({
          addon_name: 'genapi',
          endpoints: [
            { name: 'list', method: 'GET', path: '/list', auth_required: false },
            {
              name: 'item',
              method: 'GET',
              path: '/items/{id}',
              params: [{ name: 'id', type: 'path', required: true }],
            },
            { name: 'create', method: 'POST', path: '/create' },
            {
              name: 'update',
              method: 'PUT',
              path: '/items/{id}',
              params: [{ name: 'id', type: 'path', required: true }],
            },
            {
              name: 'delete',
              method: 'DELETE',
              path: '/items/{id}',
              params: [{ name: 'id', type: 'path', required: true }],
            },
          ],
          options: { use_swagger: true },
        })
      ),
  },
  {
    name: 'scaffold_test',
    run: () =>
      asFiles(
        scaffoldTest({
          addon_name: 'gentest',
          class_name: 'ModelGen',
          class_type: 'model',
          methods: ['getItem', 'getList'],
        })
      ),
  },
  {
    name: 'scaffold_email',
    run: () =>
      asFiles(
        scaffoldEmail({
          addon_name: 'genemail',
          templates: [{ name: 'welcome', subject: 'Hi', body: 'Hello {user_name}' }],
        })
      ),
  },
  {
    name: 'scaffold_layout_override',
    run: () =>
      asFiles(
        scaffoldLayoutOverride({
          addon_name: 'genlay',
          overrides: [{ controller: 'content', template: 'modern', action: 'view' }],
        })
      ),
  },
  {
    name: 'scaffold_admin_partial',
    run: () =>
      asFiles(
        scaffoldAdminPartial({
          addon_name: 'genpart',
          partials: [
            { name: 'menu', type: 'sidebar' },
            { name: 'info', type: 'panel' },
          ],
        })
      ),
  },
  {
    name: 'scaffold_cron',
    run: () =>
      asFiles(
        scaffoldCron({
          addon_name: 'gencron',
          tasks: [{ name: 'cleanup', schedule: { minute: '0' }, action: 'taskCleanup' }],
        })
      ),
  },
  {
    name: 'scaffold_permission',
    run: () =>
      asFiles(
        scaffoldPermission({
          name: 'genperm',
          title: 'Тест',
          permissions: ['view', 'add'],
          options: { withCategories: false, withOwnership: true, withRoles: true },
        })
      ),
  },
  {
    name: 'scaffold_filter',
    run: () =>
      asFiles(
        scaffoldFilter({
          addon_name: 'genfilter',
          fields: [
            { field: 'price', type: 'range', label: 'Цена' },
            { field: 'category', type: 'select', label: 'Категория' },
          ],
        })
      ),
  },
  {
    name: 'scaffold_seo',
    run: () =>
      asFiles(
        scaffoldSeo({
          addon_name: 'genseo',
          options: { use_sitemap: true, use_schema_org: true, use_og_tags: true },
        })
      ),
  },
  {
    name: 'scaffold_import_export',
    run: () =>
      asFiles(
        scaffoldImportExport({
          addon_name: 'genie',
          fields: [{ field: 'title', type: 'string', label: 'Название' }],
          options: { use_csv: true, use_json: true },
        })
      ),
  },
  {
    name: 'scaffold_cache',
    run: () => asFiles(scaffoldCache({ addon_name: 'gencache', options: { use_tags: true } })),
  },
  { name: 'scaffold_webhook', run: () => asFiles(scaffoldWebhookSafe()) },
  {
    name: 'scaffold_external_api',
    run: () =>
      asFiles(
        scaffoldExternalApi({
          addon_name: 'genext',
          base_url: 'https://api.example.com',
          endpoints: [{ path: '/data', method: 'GET' }],
          options: { use_auth: true, auth_type: 'bearer', use_rate_limit: true, use_cache: true },
        })
      ),
  },
  {
    name: 'scaffold_oauth',
    run: () =>
      asFiles(
        scaffoldOAuth({
          addon_name: 'genoauth',
          providers: [
            {
              name: 'google',
              client_id: 'x',
              client_secret: 'y',
              auth_url: 'https://a',
              token_url: 'https://t',
            },
          ],
          options: { store_tokens_in_db: true, use_refresh_token: true },
        })
      ),
  },
  {
    name: 'scaffold_component',
    run: () =>
      asFiles(
        scaffoldComponent({
          addon_name: 'gencomp',
          controllers: [{ name: 'items', actions: ['index', 'view'], use_model: true }],
          options: { with_routes: true, with_menu: true },
        })
      ),
  },
  {
    name: 'scaffold_widget',
    run: () =>
      asFiles(
        scaffoldWidget({
          addon_name: 'genwid',
          widget_name: 'recent',
          options: [{ name: 'limit', type: 'number', label: 'Limit', default: 5 }],
          options_config: { with_template: true, with_styles: true, with_cache: true },
        })
      ),
  },
  {
    name: 'scaffold_hook',
    run: () =>
      asFiles(
        scaffoldHook({
          addon_name: 'genhook',
          hook_name: 'content_after_add_approve',
          type: 'action',
        })
      ),
  },
  {
    name: 'scaffold_lang',
    run: () =>
      asFiles(
        scaffoldLang({
          addon_name: 'genlang',
          keys: ['TITLE', 'DESC'],
          custom_keys: [{ key: 'EXTRA', value: 'Доп' }],
        })
      ),
  },
  {
    name: 'generate_migration',
    run: () =>
      asFiles(
        generateMigration('genmig', [
          { name: 'title', type: 'varchar' },
          { name: 'price', type: 'decimal' },
        ])
      ),
  },
  {
    name: 'scaffold_layout_scheme',
    run: () =>
      asFiles(
        scaffoldLayoutScheme({
          template: 'modern',
          rows: [{ title: 'Row', cols: [{ title: 'Col', class: 'col-md-12' }] }],
        })
      ),
  },
];

function asFiles(result: unknown): Record<string, unknown> {
  const r = result as Record<string, unknown>;
  if (r.files) return r;
  const files: Record<string, string> = {};
  if (typeof r.code === 'string') files['generated/hook.php'] = r.code;
  if (typeof r.manifest_xml === 'string') files['generated/manifest.xml'] = r.manifest_xml;
  if (typeof r.file_content === 'string' && typeof r.file_path === 'string') {
    files[String(r.file_path).replace(/^\//, '')] = r.file_content;
  }
  if (typeof r.install_php === 'string') files['generated/install.php'] = r.install_php;
  if (typeof r.sql === 'string') files['generated/install.sql'] = r.sql;
  if (typeof r.yaml === 'string') files['generated/layout.yaml'] = r.yaml;
  return Object.keys(files).length ? { files } : r;
}

function scaffoldWebhookSafe(): unknown {
  const mod = require('../tools/webhook-tool.js') as {
    scaffoldWebhook: (o: unknown) => unknown;
  };
  return mod.scaffoldWebhook({
    addon_name: 'genwh',
    events: ['user.registered'],
    options: { use_signature: true, use_retry: true, retry_count: 3, async_execution: true },
  });
}

interface Finding {
  generator: string;
  kind: string;
  detail: string;
}

const findings: Finding[] = [];
const summary: Array<{ name: string; files: number; php: number; errors: number }> = [];

for (const testCase of SITE ? cases : []) {
  let result: Record<string, unknown>;
  try {
    result = testCase.run();
  } catch (error) {
    findings.push({ generator: testCase.name, kind: 'GENERATOR_THREW', detail: String(error) });
    continue;
  }

  const rawFiles = result.files;
  if (!rawFiles || typeof rawFiles !== 'object') {
    findings.push({
      generator: testCase.name,
      kind: 'NO_FILES',
      detail: `keys: ${Object.keys(result).join(', ')}`,
    });
    continue;
  }
  const files = rawFiles as Record<string, string>;
  const entries = Object.entries(files);

  const artifact = validateGeneratedArtifacts(files) as {
    is_valid: boolean;
    diagnostics: Array<{ code: string; path: string; message: string }>;
  };
  for (const d of artifact.diagnostics) {
    findings.push({
      generator: testCase.name,
      kind: d.code,
      detail: `${d.path}: ${d.message.split('\n')[0]}`,
    });
  }

  const phpEntries = entries.filter(([f]) => f.endsWith('.php'));
  const ownConstants = new Set<string>();
  for (const [, content] of phpEntries) {
    const reOwnAll = /define\(\s*'(LANG_[A-Z0-9_]+)'/g;
    let mOwn;
    while ((mOwn = reOwnAll.exec(content))) ownConstants.add(mOwn[1]);
  }
  const generatedModelMethods = new Set<string>();
  for (const [, content] of phpEntries) {
    if (/class\s+\w+\s+extends\s+(cmsModel|model)/.test(content)) {
      for (const name of shapeOfContent(content).keys()) generatedModelMethods.add(name);
    }
  }

  for (const [file, rawContent] of phpEntries) {
    let content = rawContent;
    const isFrontend = !file.includes('/backend/') && !file.includes('/backend');
    content = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/([^:])\/\/[^\n]*/g, '$1');

    const available = isFrontend
      ? new Set([...globalLang, ...ownConstants])
      : new Set([...globalLang, ...adminLang, ...ownConstants]);
    for (const key of new Set(content.match(/LANG_[A-Z0-9_]+/g) ?? [])) {
      if (!available.has(key)) {
        findings.push({
          generator: testCase.name,
          kind: 'LANG_UNAVAILABLE',
          detail: `${file}: ${key}`,
        });
      }
    }

    for (const t of new Set(content.match(/icms\\traits\\[a-zA-Z\\]+/g) ?? [])) {
      const rel = t.replace(/^icms\\/, '').replace(/\\/g, '/');
      if (!fs.existsSync(path.join(SITE as string, 'system', rel + '.php'))) {
        findings.push({ generator: testCase.name, kind: 'MISSING_TRAIT', detail: `${file}: ${t}` });
      }
    }

    for (const mm of content.matchAll(/\$this->cms_template->([a-zA-Z_]+)\s*\(/g)) {
      const n = mm[1].toLowerCase();
      if (!core.template.has(n) && !core.controller.has(n)) {
        findings.push({
          generator: testCase.name,
          kind: 'MISSING_TEMPLATE_METHOD',
          detail: `${file}: ${mm[1]}`,
        });
      }
    }
    for (const mm of content.matchAll(/\$this->request->([a-zA-Z_]+)\s*\(/g)) {
      if (!core.request.has(mm[1].toLowerCase())) {
        findings.push({
          generator: testCase.name,
          kind: 'MISSING_REQUEST_METHOD',
          detail: `${file}: ${mm[1]}`,
        });
      }
    }
    for (const mm of content.matchAll(
      /cmsCore::getInstance\(\)->response[\s\S]{0,40}?->([a-zA-Z_]+)\s*\(/g
    )) {
      if (!core.response.has(mm[1].toLowerCase())) {
        findings.push({
          generator: testCase.name,
          kind: 'MISSING_RESPONSE_METHOD',
          detail: `${file}: ${mm[1]}`,
        });
      }
    }
    for (const mm of content.matchAll(/\$this->model->([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)) {
      const n = mm[1];
      if (core.modelShape.has(n.toLowerCase())) continue;
      if (generatedModelMethods.has(n.toLowerCase())) continue;
      if (content.includes(`method_exists($this->model, '${n}')`)) continue;
      findings.push({
        generator: testCase.name,
        kind: 'UNGUARDED_MODEL_CALL',
        detail: `${file}: ${n}()`,
      });
    }
    for (const mm of content.matchAll(
      /(cmsCore|cmsEventsManager|cmsForm|cmsUser)::([a-zA-Z_]+)\s*\(/g
    )) {
      const map: Record<string, Set<string>> = {
        cmsCore: core.coreMethods,
        cmsEventsManager: core.events,
        cmsForm: core.form,
        cmsUser: core.user,
      };
      if (!map[mm[1]].has(mm[2].toLowerCase())) {
        findings.push({
          generator: testCase.name,
          kind: 'MISSING_STATIC_METHOD',
          detail: `${file}: ${mm[1]}::${mm[2]}`,
        });
      }
    }

    const decl = /class\s+(\w+)\s+extends\s+(\w+)/.exec(content);
    if (decl) {
      const bases: Record<string, Map<string, string>> = {
        cmsModel: core.modelProps,
        cmsController: core.controllerProps,
        cmsBackend: core.backendProps,
        cmsFrontend: core.frontendProps,
      };
      const base = bases[decl[2]];
      if (base) {
        for (const [prop, vis] of propsOfContent(content)) {
          const parent = base.get(prop);
          if (parent && VIS[vis] < VIS[parent]) {
            findings.push({
              generator: testCase.name,
              kind: 'VISIBILITY_NARROWED',
              detail: `${file}: ${prop} ${parent} -> ${vis}`,
            });
          }
        }
      }
    }

    if (/class\s+\w+\s+extends\s+cmsModel/.test(content)) {
      for (const [name, shape] of shapeOfContent(content)) {
        if (name === '__construct') continue;
        const parent = core.modelShape.get(name);
        if (parent && (shape.total < parent.total || shape.required > parent.required)) {
          findings.push({
            generator: testCase.name,
            kind: 'INCOMPATIBLE_OVERRIDE',
            detail: `${file}: ${name}(${shape.required}/${shape.total}) vs parent (${parent.required}/${parent.total})`,
          });
        }
      }
    }
  }

  summary.push({
    name: testCase.name,
    files: entries.length,
    php: phpEntries.length,
    errors: artifact.diagnostics.filter(d => d.code !== 'PHP_LINTER_UNAVAILABLE').length,
  });
}

function shapeOfContent(content: string): Map<string, { required: number; total: number }> {
  const out = new Map<string, { required: number; total: number }>();
  const re = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(content))) {
    const params = m[2]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    out.set(m[1].toLowerCase(), {
      required: params.filter(s => !s.includes('=')).length,
      total: params.length,
    });
  }
  return out;
}

function propsOfContent(content: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /^\s*(public|protected|private)\s+(?:static\s+)?\$([a-zA-Z_][a-zA-Z0-9_]*)/gm;
  let m;
  while ((m = re.exec(content))) out.set(m[2], m[1]);
  return out;
}

if (!SITE && sourceRequired) {
  throw new Error(
    'ICMS_REQUIRE_SOURCE=1, но исходники InstantCMS не найдены: задайте ICMS_SOURCE или подготовьте .cache/icms2'
  );
}

if (!SITE) {
  describe.skip('generator runtime contract (нет источника InstantCMS)', () => {
    test('skipped: исходники InstantCMS не найдены', () => {
      console.warn(
        'all-generators-runtime: пропущено — нет ICMS_SOURCE, ~/Sites/idev.test или .cache/icms2'
      );
    });
  });
} else {
  describe('generator runtime contract', () => {
    test('все генераторы: синтаксис и символы', () => {
      const report = findings.map(f => `${f.generator} :: ${f.kind} :: ${f.detail}`).join('\n');
      expect(report).toBe('');
    });

    test('генераторы без файловой карты обрабатываются адаптерами', () => {
      expect(summary.length).toBeGreaterThanOrEqual(25);
    });
  });
}
