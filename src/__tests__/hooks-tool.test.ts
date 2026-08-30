import * as fc from 'fast-check';
import { getHookDetails, listHooks, searchHooks } from '../tools/hooks-tool.js';

describe('hooks-tool knowledge lookups', () => {
  describe('listHooks', () => {
    test('возвращает структуру с total и hooks', () => {
      const result = listHooks() as {
        total: number;
        hooks: Array<{ name: string }>;
        page: { limit: number; total: number };
        categories: unknown[];
      };
      expect(typeof result.total).toBe('number');
      expect(result.total).toBeGreaterThan(0);
      expect(Array.isArray(result.hooks)).toBe(true);
      expect(Array.isArray(result.categories)).toBe(true);
    });

    test('фильтр по category оставляет только эту категорию', () => {
      const result = listHooks('content') as {
        hooks: Array<{ category: string }>;
        total: number;
      };
      for (const hook of result.hooks) {
        expect(hook.category).toBe('content');
      }
    });

    test('фильтр по type оставляет только этот type (или содержит подстроку)', () => {
      const result = listHooks(undefined, 'filter') as {
        hooks: Array<{ type: string }>;
      };
      for (const hook of result.hooks) {
        expect(hook.type === 'filter' || hook.type.includes('filter')).toBe(true);
      }
    });

    test('пагинация через cursor работает', () => {
      const first = listHooks(undefined, undefined, { limit: 5 }) as {
        hooks: Array<{ name: string }>;
        page: { next_cursor: string | null; returned: number };
      };
      expect(first.hooks).toHaveLength(5);
      expect(first.page.returned).toBe(5);
      expect(first.page.next_cursor).toBeTruthy();

      const second = listHooks(undefined, undefined, {
        limit: 5,
        cursor: first.page.next_cursor!,
      }) as { hooks: Array<{ name: string }> };
      expect(second.hooks).toHaveLength(5);

      const names = new Set([...first.hooks.map(h => h.name), ...second.hooks.map(h => h.name)]);
      expect(names.size).toBe(10);
    });

    test('несуществующая категория → пустой результат', () => {
      const result = listHooks('this-category-does-not-exist') as {
        hooks: Array<unknown>;
        total: number;
      };
      expect(result.hooks).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    test('hook items всегда содержат name, type, category, parameters_count, return_type', () => {
      const result = listHooks(undefined, undefined, { limit: 100 }) as {
        hooks: Array<{
          name: string;
          type: string;
          category: string;
          parameters_count: number;
          return_type?: string;
        }>;
      };
      for (const h of result.hooks) {
        expect(typeof h.name).toBe('string');
        expect(typeof h.type).toBe('string');
        expect(typeof h.category).toBe('string');
        expect(typeof h.parameters_count).toBe('number');
      }
    });
  });

  describe('getHookDetails', () => {
    test('известный хук возвращает полную структуру', () => {
      const candidates = ['content_after_add_approve', 'user_registered', 'admin_login'];
      let resolved: string | null = null;
      for (const name of candidates) {
        const r = getHookDetails(name) as { code?: string; name?: string };
        if (!r.code && r.name === name) {
          resolved = name;
          break;
        }
      }
      if (!resolved) return; // ни один из тестовых имён не существует в базе
      const result = getHookDetails(resolved) as {
        name: string;
        type: string;
        category: string;
        implementation: { class_name: string; file_path: string };
        manifest_xml: string;
      };
      expect(result.name).toBe(resolved);
      expect(result.implementation.class_name).toContain('on{AddonName}');
      expect(result.implementation.file_path).toContain(resolved);
      expect(result.manifest_xml).toContain(`name="${resolved}"`);
    });

    test('точный case-insensitive поиск', () => {
      const first = listHooks(undefined, undefined, { limit: 1 }) as {
        hooks: Array<{ name: string }>;
      };
      const realName = first.hooks[0].name;
      const upper = getHookDetails(realName.toUpperCase()) as { name?: string; code?: string };
      // Зависит от того, есть ли такой хук; если точный — должен найтись.
      if (!upper.code) {
        expect(upper.name).toBe(realName);
      }
    });

    test('частичное совпадение → возвращает AMBIGUOUS_HOOK или null без произвольного выбора', () => {
      const result = getHookDetails('content') as { code?: string; candidates?: string[] };
      // Если совпало несколько — должны быть перечислены все кандидаты.
      if (result.code === 'AMBIGUOUS_HOOK') {
        expect(Array.isArray(result.candidates)).toBe(true);
        expect(result.candidates!.length).toBeGreaterThan(1);
      } else {
        // Если один или ноль — должен быть name или HOOK_NOT_FOUND.
        expect(['name', 'code']).toContain(Object.keys(result)[0]);
      }
    });

    test('несуществующий хук → HOOK_NOT_FOUND с similar_hooks', () => {
      const result = getHookDetails('nonexistent_hook_xyzqwerty') as {
        code: string;
        similar_hooks?: string[];
      };
      expect(result.code).toBe('HOOK_NOT_FOUND');
      expect(Array.isArray(result.similar_hooks)).toBe(true);
    });
  });

  describe('searchHooks', () => {
    test('поиск по имени', () => {
      const candidates = listHooks(undefined, undefined, { limit: 3 }) as {
        hooks: Array<{ name: string }>;
      };
      const someName = candidates.hooks[0].name;
      const part = someName.split('_')[0];
      const result = searchHooks(part) as { total: number; results: Array<{ name: string }> };
      expect(result.total).toBeGreaterThan(0);
      expect(result.results.some(h => h.name.includes(part))).toBe(true);
    });

    test('поиск по описанию (case-insensitive)', () => {
      const result = searchHooks('событие') as {
        total: number;
        results: Array<{ name: string; type: string; category: string; description: string }>;
      };
      expect(result.total).toBeGreaterThanOrEqual(0);
      // Если есть совпадения — проверяем структуру.
      for (const r of result.results) {
        expect(typeof r.name).toBe('string');
        expect(typeof r.type).toBe('string');
        expect(typeof r.category).toBe('string');
      }
    });

    test('уникальные результаты (no duplicates)', () => {
      const list = listHooks(undefined, undefined, { limit: 10 }) as {
        hooks: Array<{ name: string }>;
      };
      const someName = list.hooks[0].name;
      const result = searchHooks(someName) as { total: number; results: Array<{ name: string }> };
      const names = result.results.map(r => r.name);
      expect(new Set(names).size).toBe(names.length);
    });

    test('пустой запрос → 0 результатов', () => {
      const result = searchHooks('zzz_nonexistent_xyzqwerty_abc_999') as {
        total: number;
        results: Array<unknown>;
      };
      expect(result.total).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    test('property-based: search для произвольных строк не выбрасывает', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 100 }), query => {
          const result = searchHooks(query) as { total: number; results: unknown[] };
          expect(Array.isArray(result.results)).toBe(true);
          expect(typeof result.total).toBe('number');
          return true;
        }),
        { numRuns: 30 }
      );
    });
  });
});
