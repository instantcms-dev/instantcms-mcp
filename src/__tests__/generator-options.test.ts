import { appliedOptions, rejectUnsupportedOptions } from '../utils/generator-options.js';
import { scaffoldApi } from '../tools/api-tool.js';
import { scaffoldHook } from '../tools/addon-tool.js';
import { scaffoldComponent } from '../tools/component-tool.js';
import { scaffoldExternalApi } from '../tools/external-api-tool.js';
import { scaffoldOAuth } from '../tools/oauth-tool.js';
import { scaffoldWebhook } from '../tools/webhook-tool.js';
import { scaffoldCrud } from '../tools/crud-tool.js';
import { scaffoldFilter } from '../tools/filter-tool.js';
import { scaffoldForm } from '../tools/form-tool.js';
import { generateMigration, scaffoldMigration } from '../tools/migration-tool.js';

const crudFields = [{ name: 'title', type: 'varchar', title: 'Заголовок' }];

/**
 * Опции, которые генераторы принимали, но нигде не использовали. Теперь они
 * отклоняются явно: молча проигнорированная опция создаёт ложную уверенность.
 */
describe('unsupported generator options', () => {
  const cases: Array<[string, () => unknown]> = [
    [
      'use_tags',
      () => scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_tags: true } }),
    ],
    [
      'use_comments',
      () =>
        scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_comments: true } }),
    ],
    [
      'use_rating',
      () => scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_rating: true } }),
    ],
    [
      'use_moderation',
      () =>
        scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_moderation: true } }),
    ],
    [
      'use_content',
      () =>
        scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_content: true } }),
    ],
    [
      'use_rate_limit',
      () =>
        scaffoldApi({
          addon_name: 'demo',
          endpoints: [{ name: 'list', method: 'GET', path: '/list' }],
          options: { use_rate_limit: true },
        }),
    ],
    [
      'use_ajax',
      () =>
        scaffoldFilter({
          addon_name: 'demo',
          fields: [{ field: 'a', type: 'text', label: 'A' }],
          options: { use_ajax: true },
        }),
    ],
    [
      'use_url_params',
      () =>
        scaffoldFilter({
          addon_name: 'demo',
          fields: [{ field: 'a', type: 'text', label: 'A' }],
          options: { use_url_params: true },
        }),
    ],
    [
      'generate_rules',
      () =>
        scaffoldForm({
          addon_name: 'demo',
          form_name: 'item',
          fields: [{ name: 'a', type: 'varchar' }],
          options: { generate_rules: true },
        }),
    ],
    [
      'permissions',
      () =>
        scaffoldMigration({
          addon_name: 'demo',
          table_name: 'demo_items',
          fields: [{ name: 'a', type: 'varchar' }],
          options: { permissions: ['view'] },
        }),
    ],
  ];

  test.each(cases)('%s отклоняется с понятной ошибкой', (option, run) => {
    expect(() => run()).toThrow(new RegExp(option));
  });

  test('use_rate_limit отклоняется, остальные опции API работают', () => {
    expect(() =>
      scaffoldApi({
        addon_name: 'demo',
        endpoints: [{ name: 'list', method: 'GET', path: '/list' }],
        options: { use_rate_limit: true },
      })
    ).toThrow(/use_rate_limit/);

    expect(() =>
      scaffoldApi({
        addon_name: 'demo',
        endpoints: [{ name: 'list', method: 'GET', path: '/list' }],
        options: { use_swagger: true },
      })
    ).not.toThrow();
  });

  test('поддержанные опции не отклоняются', () => {
    expect(() =>
      scaffoldCrud({
        addon_name: 'demo',
        fields: crudFields,
        options: { use_category: true, theme: 'modern', use_seo: true, list_template: 'table' },
      })
    ).not.toThrow();

    expect(() =>
      scaffoldFilter({
        addon_name: 'demo',
        fields: [{ field: 'a', type: 'text', label: 'A' }],
      })
    ).not.toThrow();

    expect(() =>
      scaffoldForm({
        addon_name: 'demo',
        form_name: 'item',
        fields: [{ name: 'a', type: 'varchar' }],
        options: { use_tabs: true, use_separate_save: true },
      })
    ).not.toThrow();
  });

  test('явное false не считается запросом неподдержанного поведения', () => {
    expect(() =>
      scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_tags: false } })
    ).not.toThrow();
  });

  test('ifNotExists действительно управляет SQL', () => {
    const withFlag = generateMigration('demo_items', [{ name: 'a', type: 'varchar' }]) as {
      sql: string;
    };
    const withoutFlag = generateMigration('demo_items', [{ name: 'a', type: 'varchar' }], {
      ifNotExists: false,
    }) as { sql: string };

    expect(withFlag.sql).toContain('CREATE TABLE IF NOT EXISTS');
    expect(withoutFlag.sql).toContain('CREATE TABLE `cms_demo_items`');
    expect(withoutFlag.sql).not.toContain('IF NOT EXISTS');
  });

  test('результат перечисляет поддержанные и применённые опции', () => {
    const result = scaffoldCrud({
      addon_name: 'demo',
      fields: crudFields,
      options: { use_category: true, theme: 'modern' },
    }) as { supported_options: string[]; options_applied: Record<string, unknown> };

    expect(result.supported_options).toEqual([
      'theme',
      'use_category',
      'with_api_model',
      'use_seo',
      'use_slug',
      'list_template',
    ]);
    expect(result.options_applied).toEqual({ theme: 'modern', use_category: true });
  });

  test('use_seo добавляет SEO-колонки, поля формы и метатеги в view', () => {
    const result = scaffoldCrud({
      addon_name: 'demo',
      fields: crudFields,
      options: { use_seo: true },
    }) as { files: Record<string, string>; options_applied: Record<string, unknown> };

    const sql = result.files['[pkg] install.sql'];
    expect(sql).toContain('`meta_title`');
    expect(sql).toContain('`meta_description`');
    expect(sql).toContain('`meta_keywords`');

    const form = result.files['package/system/controllers/demo/backend/forms/form_item.php'];
    expect(form).toContain("fieldString('meta_title'");
    expect(form).toContain("fieldString('meta_description'");

    const view = result.files['package/system/controllers/demo/actions/view.php'];
    expect(view).toContain("$item['meta_title']");
    expect(view).toContain('setMeta');

    expect(result.options_applied).toEqual({ use_seo: true });
  });

  test('без use_seo SEO-колонок нет', () => {
    const result = scaffoldCrud({ addon_name: 'demo', fields: crudFields }) as {
      files: Record<string, string>;
    };
    expect(result.files['[pkg] install.sql']).not.toContain('meta_title');
  });

  test('use_slug добавляет ЧПУ: колонку, маршрут, поиск по slug и ссылки', () => {
    const result = scaffoldCrud({
      addon_name: 'demo',
      fields: crudFields,
      options: { use_slug: true },
    }) as { files: Record<string, string>; options_applied: Record<string, unknown> };

    const sql = result.files['[pkg] install.sql'];
    expect(sql).toContain('`slug`');
    expect(sql).toContain('UNIQUE KEY');

    const model = result.files['package/system/controllers/demo/model.php'];
    expect(model).toContain('getItemBySlug');

    const frontend = result.files['package/system/controllers/demo/frontend.php'];
    expect(frontend).toContain('public function route($uri)');
    expect(result.files['package/system/controllers/demo/routes.php']).toContain(
      "'action'  => 'view'"
    );

    const view = result.files['package/system/controllers/demo/actions/view.php'];
    expect(view).toContain("request->get('slug'");

    const add = result.files['package/system/controllers/demo/actions/add.php'];
    expect(add).toContain('lang_slug');
    expect(add).toContain('checkCorrectEqualSlug');

    const form = result.files['package/system/controllers/demo/backend/forms/form_item.php'];
    expect(form).toContain("fieldString('slug'");

    const indexKey = Object.keys(result.files).find(k => k.endsWith('index.tpl.php')) as string;
    expect(result.files[indexKey]).toContain("$item['slug'] . '.html'");

    expect(result.options_applied).toEqual({ use_slug: true });
  });

  test('без use_slug ЧПУ не создаются', () => {
    const result = scaffoldCrud({ addon_name: 'demo', fields: crudFields }) as {
      files: Record<string, string>;
    };

    expect(result.files['package/system/controllers/demo/routes.php']).toBeUndefined();
    expect(result.files['[pkg] install.sql']).not.toContain('UNIQUE KEY');
    expect(result.files['package/system/controllers/demo/actions/view.php']).not.toContain(
      "request->get('slug'"
    );
  });

  test('list_template выбирает разметку шаблона списка', () => {
    const indexOf = (tpl: 'grid' | 'list' | 'table'): string => {
      const result = scaffoldCrud({
        addon_name: 'demo',
        fields: crudFields,
        options: { list_template: tpl },
      }) as { files: Record<string, string> };

      const key = Object.keys(result.files).find(k => k.endsWith('index.tpl.php'));
      return key ? result.files[key] : '';
    };

    expect(indexOf('table')).toContain('<table');
    expect(indexOf('list')).toContain('list-group-item');
    expect(indexOf('grid')).toContain('card h-100');
  });

  test('scaffoldHook строит имя класса хука как ядро (CamelCase для подчёркиваний)', () => {
    const underscored = scaffoldHook({
      addon_name: 'ci_core_artifacts',
      hook_name: 'render_page',
    }) as { class_name: string; code: string };
    expect(underscored.class_name).toBe('onCiCoreArtifactsRenderPage');
    expect(underscored.code).toContain('class onCiCoreArtifactsRenderPage extends cmsAction');

    const plain = scaffoldHook({ addon_name: 'blog', hook_name: 'user_login' }) as {
      class_name: string;
    };
    expect(plain.class_name).toBe('onBlogUserLogin');
  });

  test('rejectUnsupportedOptions игнорирует undefined, null и false', () => {
    expect(() =>
      rejectUnsupportedOptions(
        'demo',
        { a: undefined, b: null, c: false },
        { a: 'x', b: 'y', c: 'z' }
      )
    ).not.toThrow();
    expect(() => rejectUnsupportedOptions('demo', {}, { a: 'x' })).not.toThrow();
    expect(() => rejectUnsupportedOptions('demo', undefined, { a: 'x' })).not.toThrow();
  });

  test('appliedOptions возвращает только поддержанные ключи', () => {
    expect(appliedOptions({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    expect(appliedOptions(undefined, ['a'])).toEqual({});
  });
});

/**
 * Раньше эти генераторы были прототипами и возвращали scaffold_status
 * 'experimental'. После переработки они не должны снова начать это делать,
 * а ограничения обязаны остаться видимыми агенту.
 */
describe('переработанные генераторы не помечают себя прототипами', () => {
  const cases: Array<[string, () => unknown]> = [
    ['scaffold_component', () => scaffoldComponent({ addon_name: 'okcomp' })],
    ['scaffold_webhook', () => scaffoldWebhook({ addon_name: 'okwh', events: ['order.created'] })],
    [
      'scaffold_external_api',
      () =>
        scaffoldExternalApi({
          addon_name: 'okext',
          base_url: 'https://api.example.com',
          endpoints: [{ path: '/x', method: 'GET' }],
        }),
    ],
    [
      'scaffold_oauth',
      () =>
        scaffoldOAuth({
          addon_name: 'okoauth',
          providers: [
            {
              name: 'google',
              client_id: 'x',
              client_secret: 'y',
              auth_url: 'https://accounts.google.com/o/oauth2/auth',
              token_url: 'https://oauth2.googleapis.com/token',
            },
          ],
        }),
    ],
  ];

  test.each(cases)('%s: без scaffold_status experimental и с limitations', (_name, run) => {
    const result = run() as { scaffold_status?: string; limitations?: string[] };
    expect(result.scaffold_status).not.toBe('experimental');
    expect(Array.isArray(result.limitations)).toBe(true);
    expect((result.limitations ?? []).length).toBeGreaterThan(0);
  });
});
