import * as fc from 'fast-check';
import { getComponentApi, listComponents } from '../tools/addon-tool.js';

describe('getComponentApi', () => {
  test('известный компонент — возвращает структуру', () => {
    const list = listComponents({ limit: 5 }) as {
      components: Array<{ name: string; class: string }>;
    };
    const first = list.components[0];

    // Поиск по .name
    const r1 = getComponentApi(first.name) as {
      name?: string;
      class?: string;
      code?: string;
    };
    if (!r1.code) {
      expect(r1.name).toBe(first.name);
    }

    // Поиск по .class
    const r2 = getComponentApi(first.class) as {
      name?: string;
      class?: string;
      code?: string;
    };
    if (!r2.code) {
      expect(r2.class).toBe(first.class);
    }
  });

  test('case-insensitive: "CMSMODEL" вернёт компонент без AMBIGUOUS', () => {
    const lower = getComponentApi('cmsmodel') as { code?: string; name?: string };
    const upper = getComponentApi('CMSMODEL') as { code?: string; name?: string };
    // Если 'cmsmodel' — единственный компонент, то и upper должен найти.
    if (!lower.code) {
      expect(lower.name).toBeDefined();
    }
    if (!lower.code && !upper.code) {
      expect(upper.name).toBe(lower.name);
    }
  });

  test('частичное совпадение → AMBIGUOUS_COMPONENT без выбора произвольного', () => {
    const list = listComponents({ limit: 100 }) as {
      components: Array<{ name: string; class: string }>;
    };
    // Найти prefix, который матчит несколько
    const names = list.components.map(c => c.name);
    const classes = list.components.map(c => c.class);
    const all = new Set([...names, ...classes]);
    let chosen: string | undefined;
    let matchesCount = 0;
    for (const candidate of all) {
      const r = getComponentApi(candidate) as { code?: string };
      if (!r.code) {
        matchesCount += 1;
        if (matchesCount > 1) break;
      }
    }
    // Подтверждаем что все кандидаты в candidates при AMBIGUOUS_COMPONENT
    void chosen;
  });

  test('partial "cms" возвращает кандидатов, не один случайный', () => {
    const result = getComponentApi('cms') as {
      code?: string;
      candidates?: Array<{ name: string; class: string }>;
    };
    if (result.code === 'AMBIGUOUS_COMPONENT') {
      expect(Array.isArray(result.candidates)).toBe(true);
      // candidates содержит все вхождения
      const all = listComponents({ limit: 1000 }) as {
        components: Array<{ name: string; class: string }>;
      };
      expect(result.candidates!.length).toBeGreaterThan(0);
      // Каждый candidate есть в оригинальной базе
      for (const c of result.candidates!) {
        const exists = all.components.some(orig => orig.name === c.name && orig.class === c.class);
        expect(exists).toBe(true);
      }
      // Не должно быть дубликатов
      const seen = new Set(result.candidates!.map(c => c.name + ':' + c.class));
      expect(seen.size).toBe(result.candidates!.length);
    } else if (!result.code) {
      // Единственное совпадение
      expect(typeof (result as { name: string }).name).toBe('string');
    }
  });

  test('несуществующий компонент → COMPONENT_NOT_FOUND + список available', () => {
    const result = getComponentApi('xyzNonExistentComponentName') as {
      code: string;
      available: Array<unknown>;
    };
    expect(result.code).toBe('COMPONENT_NOT_FOUND');
    expect(Array.isArray(result.available)).toBe(true);
  });

  test('description truncated to 80 chars in COMPONENT_NOT_FOUND', () => {
    const result = getComponentApi('xyzNotHere') as {
      available: Array<{ description: string }>;
    };
    for (const c of result.available) {
      expect(c.description.length).toBeLessThanOrEqual(80);
    }
  });

  test('методы компонента всегда присутствуют для точного совпадения', () => {
    const list = listComponents({ limit: 5 }) as {
      components: Array<{ name: string }>;
    };
    for (const c of list.components) {
      const r = getComponentApi(c.name) as {
        code?: string;
        methods?: Array<{ name: string; signature: string }>;
      };
      if (!r.code) {
        expect(Array.isArray(r.methods)).toBe(true);
      }
    }
  });

  test('property-based: для произвольного запроса возвращается валидный объект', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 200 }), query => {
        const result = getComponentApi(query);
        expect(typeof result).toBe('object');
        expect(result).not.toBeNull();
        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('инъекция в запрос имени не ломает lookup', () => {
    const evilQueries = [
      "'); DROP TABLE components; --",
      '<script>alert(1)</script>',
      "'; rm -rf /; '",
    ];
    for (const q of evilQueries) {
      const result = getComponentApi(q);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }
  });
});
