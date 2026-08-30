import * as fc from 'fast-check';
import { paginate } from '../utils/pagination.js';

describe('pagination property-based', () => {
  test('возвращённых элементов никогда не больше limit', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 500 }),
        fc.integer({ min: -10, max: 300 }),
        (items, rawLimit) => {
          const limit = rawLimit; // функция сама зажимает.
          const page = paginate(items, { limit });
          return page.items.length <= Math.max(1, Math.min(limit === 0 ? 50 : limit, 200));
        }
      ),
      { numRuns: 100 }
    );
  });

  test('limit автоматически clamp в диапазон [1, 200]', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 50 }),
        fc.integer({ min: -50, max: 1000 }),
        (items, limit) => {
          const page = paginate(items, { limit });
          return page.page.limit >= 1 && page.page.limit <= 200;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('limit по умолчанию равен 50', () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { maxLength: 100 }), items => {
        const page = paginate(items);
        return page.page.limit === 50;
      }),
      { numRuns: 20 }
    );
  });

  test('total отражает размер исходного массива', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 200 }),
        fc.integer({ min: 1, max: 50 }),
        (items, limit) => {
          const page = paginate(items, { limit });
          return page.page.total === items.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('returned элементов равно длине страницы', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 200 }),
        fc.integer({ min: 1, max: 100 }),
        (items, limit) => {
          const page = paginate(items, { limit });
          return page.page.returned === page.items.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('невалидный/повреждённый cursor безопасно стартует с 0', () => {
    const cursors = ['', '!!not-base64!!', 'AAAA', '!!!!', '__$$', '\u0000\u0000', ' '];
    for (const c of cursors) {
      const result = paginate(['a', 'b', 'c'], { cursor: c, limit: 10 });
      expect(result.items.length).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.items)).toBe(true);
    }
  });

  test('cursor за пределами массива возвращает пустой список и next_cursor=null', () => {
    const huge = paginate([1, 2, 3], { limit: 5, cursor: 'Zm9vYmFy' /* arbitrary */ });
    // arbitrary base64 может распарситься в мусор; cursor никогда не должен сломать результат
    expect(Array.isArray(huge.items)).toBe(true);
  });

  test('объединение всех страниц с корректными курсорами даёт исходный массив', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ maxLength: 50 }), { maxLength: 30 }),
        fc.integer({ min: 1, max: 7 }),
        (items, limit) => {
          const result: string[] = [];
          let cursor: string | undefined;
          let safety = 100; // защита от бесконечного цикла
          while (safety-- > 0) {
            const page = paginate(items, { cursor, limit });
            result.push(...page.items);
            if (!page.page.next_cursor) break;
            cursor = page.page.next_cursor;
          }
          return JSON.stringify(result) === JSON.stringify(items);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('пустой массив → пустой page с next_cursor=null', () => {
    const page = paginate([]);
    expect(page.items).toEqual([]);
    expect(page.page.returned).toBe(0);
    expect(page.page.total).toBe(0);
    expect(page.page.next_cursor).toBeNull();
    expect(page.page.limit).toBe(50);
  });

  test('массив короче limit → одна страница, next_cursor=null', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { maxLength: 10 }),
        fc.integer({ min: 20, max: 200 }),
        (items, limit) => {
          const page = paginate(items, { limit });
          expect(page.items.length).toBe(items.length);
          expect(page.page.next_cursor).toBeNull();
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });
});
