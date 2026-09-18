import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

let cached: string | null = null;

/**
 * Версия сервера из package.json.
 *
 * Читается один раз при первом обращении. Поиск идёт вверх от текущего файла,
 * поэтому работает и из `src/` (tsx, тесты), и из `dist/` (опубликованный пакет).
 */
export function getServerVersion(): string {
  if (cached !== null) return cached;

  let dir = __dirname;
  for (let depth = 0; depth < 4; depth += 1) {
    const candidate = join(dir, 'package.json');
    if (existsSync(candidate)) {
      try {
        const parsed = JSON.parse(readFileSync(candidate, 'utf8')) as { version?: unknown };
        if (typeof parsed.version === 'string' && parsed.version) {
          cached = parsed.version;
          return cached;
        }
      } catch {
        // повреждённый package.json — падаем в значение по умолчанию ниже
      }
    }
    dir = dirname(dir);
  }

  cached = '0.0.0';
  return cached;
}
