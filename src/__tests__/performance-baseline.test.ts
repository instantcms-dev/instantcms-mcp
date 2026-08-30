import { listHooks } from '../tools/hooks-tool.js';
import { listComponents } from '../tools/addon-tool.js';
import { paginate } from '../utils/pagination.js';
import { rankToolCategories } from '../utils/find-tool.js';

describe('performance baseline', () => {
  test('listHooks: < 50ms для одного вызова без пагинации', () => {
    const start = Date.now();
    listHooks();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  test('listHooks с пагинацией: < 50ms', () => {
    const start = Date.now();
    listHooks(undefined, undefined, { limit: 100 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  test('listComponents: < 100ms', () => {
    const start = Date.now();
    listComponents();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  test('paginate вызов: < 5ms', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
    const start = Date.now();
    paginate(arr, { limit: 100 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5);
  });

  test('rankToolCategories: < 20ms на 10 категориях', () => {
    const cats = Array.from({ length: 10 }, (_, i) => ({
      category: `cat${i}`,
      keywords: [`kw_${i}`, `kw_shared`],
      tools: ['t1'],
    }));
    const start = Date.now();
    rankToolCategories('test query with multiple tokens', cats);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(20);
  });

  test('100 последовательных listHooks — без утечек', () => {
    const startMem = process.memoryUsage().heapUsed;
    for (let i = 0; i < 100; i += 1) {
      listHooks(undefined, undefined, { limit: 10 });
    }
    if (global.gc) global.gc();
    const endMem = process.memoryUsage().heapUsed;
    const diffMb = (endMem - startMem) / 1024 / 1024;
    // Достаточно грубая проверка — не растёт бесконтрольно.
    expect(diffMb).toBeLessThan(5);
  });
});
