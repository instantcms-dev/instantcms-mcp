import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Каталоги верхнего уровня, которые нельзя удалять: даже если они отсутствовали
 * при планировании, их удаление означает повреждение установки InstantCMS.
 */
export const PROTECTED_DIRS = ['system', 'templates', 'upload', 'cache', 'install', 'static'];

/** Каталоги установки, которые нельзя удалять ни при каких условиях. */
export const PROTECTED_PATHS = ['system/config', 'system/core', 'system/libs', 'system/traits'];

/**
 * Минимальная глубина каталога относительно корня сайта, допустимая к удалению.
 * Например `system/controllers/demo` (глубина 3) — можно, `system/config`
 * (глубина 2) — нельзя.
 */
const MIN_REMOVABLE_DEPTH = 3;

/**
 * Возвращает каталоги, которых ещё нет и которые нужно создать для указанных файлов.
 * Возвращаются только отсутствующие каталоги, от глубоких к поверхностным.
 */
export function missingDirs(siteRoot: string, files: string[]): string[] {
  const root = path.resolve(siteRoot);
  const missing = new Set<string>();

  for (const file of files) {
    let dir = path.dirname(path.resolve(file));
    while (dir !== root && dir.startsWith(root + path.sep)) {
      if (!fs.existsSync(dir)) missing.add(dir);
      dir = path.dirname(dir);
    }
  }

  return [...missing].sort((a, b) => b.length - a.length);
}

/**
 * Каталоги, допустимые к удалению после проверки:
 *  - только внутри сайта и не сам корень сайта;
 *  - не защищённые каталоги верхнего уровня;
 *  - не поверхностнее двух уровней (например `system/controllers` остаётся);
 *  - отсортированы от глубоких к поверхностным, чтобы удалять вложенные первыми.
 *
 * Удаление выполняется только для пустых каталогов, поэтому общие каталоги
 * с чужими файлами не пострадают.
 */
export function removableDirs(siteRoot: string, dirs: string[]): string[] {
  const root = path.resolve(siteRoot);
  const protectedPaths = new Set([
    ...PROTECTED_DIRS.map(dir => path.join(root, dir)),
    ...PROTECTED_PATHS.map(dir => path.join(root, dir)),
  ]);

  return dirs
    .map(dir => path.resolve(dir))
    .filter(dir => dir !== root)
    .filter(dir => dir.startsWith(root + path.sep))
    .filter(dir => !protectedPaths.has(dir))
    .filter(dir => path.relative(root, dir).split(path.sep).length >= MIN_REMOVABLE_DEPTH)
    .sort((a, b) => b.length - a.length);
}

/**
 * Удаляет каталоги, созданные при развёртывании: только пустые, от глубоких к
 * поверхностным. Каталог с любыми файлами остаётся нетронутым.
 */
export function removeEmptyDirs(siteRoot: string, dirs: string[]): string[] {
  const removed: string[] = [];
  for (const dir of removableDirs(siteRoot, dirs)) {
    try {
      fs.rmdirSync(dir);
      removed.push(dir);
    } catch {
      // Каталог не пуст или уже удалён — это ожидаемо и не является ошибкой.
    }
  }
  return removed;
}
