import { appliedOptions, rejectUnsupportedOptions } from '../utils/generator-options.js';
import { scaffoldApi } from '../tools/api-tool.js';
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
      'use_seo',
      () => scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_seo: true } }),
    ],
    [
      'use_content',
      () =>
        scaffoldCrud({ addon_name: 'demo', fields: crudFields, options: { use_content: true } }),
    ],
    [
      'list_template',
      () =>
        scaffoldCrud({
          addon_name: 'demo',
          fields: crudFields,
          options: { list_template: 'table' },
        }),
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
        options: { use_category: true, theme: 'modern' },
      })
    ).not.toThrow();

    expect(() =>
      scaffoldFilter({
        addon_name: 'demo',
        fields: [{ field: 'a', type: 'text', label: 'A' }],
        options: { save_filters: true },
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

    expect(result.supported_options).toEqual(['theme', 'use_category']);
    expect(result.options_applied).toEqual({ theme: 'modern', use_category: true });
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
