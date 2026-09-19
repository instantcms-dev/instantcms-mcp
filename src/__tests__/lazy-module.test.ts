import { lazyModule } from '../utils/lazy-module.js';

describe('lazyModule', () => {
  test('не загружает модуль до первого вызова', () => {
    // libs-api не импортируется нигде в серверном пути — безопасный маркер.
    const id = '../data/libs-api.js';
    const resolved = require.resolve(id);
    delete require.cache[resolved];

    const load = lazyModule<Record<string, unknown>>(id);
    expect(require.cache[resolved]).toBeUndefined();

    const mod = load();
    expect(require.cache[resolved]).toBeDefined();
    expect(mod).toBeDefined();
  });

  test('кэширует результат: повторный вызов возвращает тот же объект', () => {
    const load = lazyModule<typeof import('../data/libs-api.js')>('../data/libs-api.js');
    const first = load();
    const second = load();
    expect(second).toBe(first);
  });

  test('загружает пакеты по bare-имени', () => {
    const load = lazyModule<typeof import('ini')>('ini');
    expect(typeof load().parse).toBe('function');
  });
});
