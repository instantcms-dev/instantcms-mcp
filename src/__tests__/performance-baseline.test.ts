import { listComponents } from '../tools/addon-tool.js';
import { listHooks } from '../tools/hooks-tool.js';
import { rankToolCategories } from '../utils/find-tool.js';
import { paginate } from '../utils/pagination.js';

/**
 * Дымовые проверки производительности.
 *
 * Задача этих тестов — заметить патологические регрессии (случайный O(n²),
 * обход всего справочника там, где нужен один элемент), а не измерить точные
 * миллисекунды. Поэтому:
 *
 *  - функция сначала прогревается, а затем берётся лучшее время из нескольких
 *    запусков: разовые всплески планировщика и сборщика мусора не влияют;
 *  - пороги намеренно с запасом: на перегруженном CI-раннере разница в разы
 *    нормальна, а реальная деградация проявляется на порядок;
 *  - рядом проверяется корректность результата, чтобы тест не проходил на
 *    функции, которая ничего не делает.
 */
const RUNS = 5;

function bestMs(run: () => void): number {
  run(); // прогрев: JIT и кэши данных
  let best = Number.POSITIVE_INFINITY;
  for (let index = 0; index < RUNS; index += 1) {
    const start = performance.now();
    run();
    best = Math.min(best, performance.now() - start);
  }
  return best;
}

describe('performance baseline', () => {
  test('listHooks: без пагинации', () => {
    const result = listHooks() as { hooks: unknown[] };

    expect(result.hooks.length).toBeGreaterThan(0);
    expect(bestMs(() => listHooks())).toBeLessThan(250);
  });

  test('listHooks с пагинацией', () => {
    const result = listHooks(undefined, undefined, { limit: 100 }) as {
      page: { returned: number };
    };

    expect(result.page.returned).toBe(100);
    expect(bestMs(() => listHooks(undefined, undefined, { limit: 100 }))).toBeLessThan(250);
  });

  test('listComponents', () => {
    const result = listComponents() as { components: unknown[] };

    expect(result.components.length).toBeGreaterThan(0);
    expect(bestMs(() => listComponents())).toBeLessThan(500);
  });

  test('paginate', () => {
    const items = Array.from({ length: 1000 }, (_, index) => `item-${index}`);

    expect(paginate(items, { limit: 100 }).items).toHaveLength(100);
    expect(bestMs(() => paginate(items, { limit: 100 }))).toBeLessThan(25);
  });

  test('rankToolCategories на 10 категориях', () => {
    const categories = Array.from({ length: 10 }, (_, index) => ({
      category: `cat${index}`,
      keywords: [`kw_${index}`, 'kw_shared'],
      tools: ['t1'],
    }));

    const query = 'kw_0 kw_shared';
    expect(rankToolCategories(query, categories).length).toBeGreaterThan(0);
    expect(bestMs(() => rankToolCategories(query, categories))).toBeLessThan(100);
  });

  test('100 последовательных listHooks не растят память бесконтрольно', () => {
    // Прогрев, чтобы разовый рост структур не считался утечкой.
    for (let index = 0; index < 20; index += 1) {
      listHooks(undefined, undefined, { limit: 10 });
    }
    if (global.gc) global.gc();
    const before = process.memoryUsage().heapUsed;

    for (let index = 0; index < 100; index += 1) {
      listHooks(undefined, undefined, { limit: 10 });
    }
    if (global.gc) global.gc();
    const after = process.memoryUsage().heapUsed;

    const diffMb = (after - before) / 1024 / 1024;
    // Порог с запасом: ловим именно утечку, а не разброс сборщика мусора.
    expect(diffMb).toBeLessThan(20);
  });
});
