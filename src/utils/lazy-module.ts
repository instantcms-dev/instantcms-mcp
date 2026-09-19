/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Ленивая загрузка модулей с кэшем.
 *
 * Тяжёлые зависимости (mysql2, fast-xml-parser, yaml) и крупные data-модули
 * не нужны при старте сервера: они используются только при вызове конкретных
 * инструментов. Ленивый require переносит их стоимость на первое обращение.
 *
 * ВАЖНО: относительные пути разрешаются от ЭТОГО файла (src/utils →
 * dist/utils), поэтому потребители указывают их как из src/utils:
 * '../tools/artifact-tool.js', '../data/controllers-map.js'. Пакеты — по имени:
 * 'mysql2/promise'.
 *
 * Проект собирается в CommonJS, поэтому require синхронен и не требует
 * перевода потребителей на async. jest.mock перехватывает такие вызовы
 * в момент обращения, поэтому моки в тестах продолжают работать.
 */
export function lazyModule<T>(id: string): () => T {
  let cached: T | undefined;
  return () => {
    if (cached === undefined) {
      cached = require(id) as T;
    }
    return cached;
  };
}
