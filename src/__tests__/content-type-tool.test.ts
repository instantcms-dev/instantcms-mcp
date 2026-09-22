import { describe, expect, test } from '@jest/globals';

import { scaffoldContentType } from '../tools/content-type-tool.js';

/**
 * `scaffold_content_type` — единственный генератор, который описывает не файлы
 * дополнения, а рантайм-регистрацию типа контента через API ядра. Поэтому тесты
 * фиксируют два инварианта: артефакты вызывают `addContentType`/`addContentField`
 * (а не пишут SQL), и валидация не пропускает поля, которые ядро отвергнет
 * (системные колонки, неизвестные типы, дубликаты).
 */

const base = {
  name: 'catalog',
  title: 'Каталог',
  fields: [
    { name: 'price', type: 'number', title: 'Цена' },
    { name: 'cover', type: 'image', title: 'Обложка' },
  ],
};

function filesOf(result: unknown): Record<string, string> {
  return (result as { files: Record<string, string> }).files;
}

describe('scaffoldContentType', () => {
  test('возвращает install.php и CLI-скрипт, завязанные на API ядра', () => {
    const files = filesOf(scaffoldContentType(base));

    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(['[pkg] install.php', 'scripts/register_catalog.php'])
    );

    const install = files['[pkg] install.php']!;
    expect(install).toContain('function install_package(');
    expect(install).toContain('new modelBackendContent()');
    expect(install).toContain('addContentType(');
    expect(install).toContain("addContentField('catalog'");
    expect(install).toContain("getContentTypeByName('catalog')");
    // Raw SQL не генерируется: DDL делает ядро.
    expect(install).not.toMatch(/CREATE\s+TABLE/i);
    expect(install).not.toMatch(/ALTER\s+TABLE/i);

    const cli = files['scripts/register_catalog.php']!;
    expect(cli).toContain('PHP_SAPI');
    expect(cli).toContain('bootstrap.php');
    expect(cli).toContain('addContentType(');
  });

  test('описывает создаваемые таблицы и системные поля', () => {
    const result = scaffoldContentType(base) as {
      tables: string[];
      system_fields: string[];
      field_count: number;
    };

    expect(result.tables).toContain('cms_con_catalog');
    expect(result.tables).toContain('cms_con_catalog_fields');
    expect(result.tables).toContain('cms_con_catalog_props_values');
    expect(result.system_fields).toEqual(['title', 'date_pub', 'user', 'photo', 'content']);
    expect(result.field_count).toBe(2);
  });

  test('url_pattern по умолчанию — ядерный {id}-{title}, кастомный сохраняется', () => {
    const defaults = scaffoldContentType(base) as { content_type: { url_pattern: string } };
    expect(defaults.content_type.url_pattern).toBe('{id}-{title}');

    const custom = scaffoldContentType({
      ...base,
      url_pattern: 'catalog-{slug}.html',
    }) as { content_type: { url_pattern: string } };
    expect(custom.content_type.url_pattern).toBe('catalog-{slug}.html');
  });

  test('отклоняет имена, конфликтующие с системными колонками контента', () => {
    expect(() =>
      scaffoldContentType({ ...base, fields: [{ name: 'slug', type: 'string', title: 'Slug' }] })
    ).toThrow(/конфликтует с системной колонкой/);

    expect(() =>
      scaffoldContentType({ ...base, fields: [{ name: 'title', type: 'string', title: 'T' }] })
    ).toThrow(/конфликтует с системной колонкой/);
  });

  test('отклоняет неизвестный тип поля', () => {
    expect(() =>
      scaffoldContentType({ ...base, fields: [{ name: 'x', type: 'nope', title: 'X' }] })
    ).toThrow(/неизвестный тип поля/);
  });

  test('отклоняет дубликаты полей', () => {
    expect(() =>
      scaffoldContentType({
        ...base,
        fields: [
          { name: 'price', type: 'number', title: 'Цена' },
          { name: 'price', type: 'string', title: 'Цена 2' },
        ],
      })
    ).toThrow(/объявлено дважды/);
  });

  test('отклоняет невалидное имя типа', () => {
    expect(() => scaffoldContentType({ ...base, name: 'Bad-Name' })).toThrow(/имя типа/);
  });

  test('отклоняет неподдерживаемые опции с подсказкой', () => {
    expect(() => scaffoldContentType({ ...base, options: { permissions: ['view'] } })).toThrow(
      /permissions/
    );
  });

  test('родительный/винительный падежи и опции попадают в install.php', () => {
    const install = filesOf(
      scaffoldContentType({
        ...base,
        is_cats: true,
        labels: { many: 'Дополнений', create: 'дополнение' },
        options: { show_items_counts: 1 },
      })
    )['[pkg] install.php']!;

    expect(install).toContain("'many' => 'Дополнений'");
    expect(install).toContain("'create' => 'дополнение'");
    expect(install).toContain("'show_items_counts' => 1");
    expect(install).toContain("'is_cats' => true");
  });

  test('повторный запуск докатывает только отсутствующие поля', () => {
    const files = filesOf(scaffoldContentType(base));

    for (const path of ['[pkg] install.php', 'scripts/register_catalog.php']) {
      const code = files[path]!;
      // Тип берётся, если уже существует, иначе создаётся — без раннего выхода.
      expect(code).toContain('$ctype    = $model->getContentTypeByName(');
      expect(code).toContain("$ctype ? $ctype['id'] : $model->addContentType(");
      expect(code).not.toMatch(
        /if \(\$model->getContentTypeByName\([^)]*\)\) \{\s*\n\s*return true;/
      );
      // Поля добавляются только те, которых ещё нет.
      expect(code).toContain("array_keys($model->getContentFields('catalog', 0, false))");
      expect(code).toContain("if (in_array($field['name'], $existing, true)) {");
    }
  });
});
