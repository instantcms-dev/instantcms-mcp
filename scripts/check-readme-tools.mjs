import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Синхронизация README ↔ зарегистрированные инструменты.
 *
 * AGENTS.md требует держать списки инструментов в README согласованными с
 * реальной регистрацией. Этот скрипт извлекает фактическое число вызовов
 * defineTool/defineToolWithManualResult в каждом src/registry/*.ts и сверяет
 * с таблицей «Группы инструментов» в README.md. При рассинхроне завершается
 * с ошибкой, чтобы CI/локальная проверка не пропустила расхождение.
 */

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registryDir = path.join(root, 'src', 'registry');
const readmePath = path.join(root, 'README.md');

// registry-файл → имя строки в таблице README
const groupNames = {
  'meta-tools.ts': 'meta-tools',
  'generator-tools.ts': 'generator-tools',
  'knowledge-tools.ts': 'knowledge-tools',
  'database-tools.ts': 'database-tools',
  'source-tools.ts': 'source-tools',
  'language-tools.ts': 'language-tools',
  'extension-tools.ts': 'extension-tools',
  'project-tools.ts': 'project-tools',
  'template-development-tools.ts': 'template-development-tools',
};

function countTools(source) {
  // Считаем обращения defineTool(server, ...) / defineToolWithManualResult(server, ...)
  const matches = source.match(/\bdefineTool(?:WithManualResult)?\(\s*\n?\s*server\s*,/g);
  return matches ? matches.length : 0;
}

const files = (await readdir(registryDir)).filter(f => f.endsWith('-tools.ts'));
const actual = {};
for (const file of files) {
  const source = await readFile(path.join(registryDir, file), 'utf8');
  const group = groupNames[file];
  if (!group) continue;
  actual[group] = countTools(source);
}

const readme = await readFile(readmePath, 'utf8');

// Разбираем таблицу «Группы инструментов»: | `name` | count | ... |
const rowPattern = /\|\s*`([a-z-]+)`\s*\|\s*(\d+)\s*\|/g;
const documented = {};
let row;
while ((row = rowPattern.exec(readme)) !== null) {
  documented[row[1]] = Number(row[2]);
}

let failed = false;
const lines = [];
for (const [group, count] of Object.entries(actual)) {
  const doc = documented[group];
  const ok = doc === count;
  if (!ok) failed = true;
  lines.push(`  ${ok ? 'OK ' : 'FAIL'} ${group}: README=${doc ?? '—'} actual=${count}`);
}

// Проверяем итоговую фразу «регистрирует N инструментов»
const total = Object.values(actual).reduce((a, b) => a + b, 0);
const totalMatch = readme.match(/регистрирует\s+(\d+)\s+инструмент/);
const documentedTotal = totalMatch ? Number(totalMatch[1]) : null;
const totalOk = documentedTotal === total;
if (!totalOk) failed = true;

console.log('README tool-group sync:');
console.log(lines.join('\n'));
console.log(`  ${totalOk ? 'OK ' : 'FAIL'} total: README=${documentedTotal ?? '—'} actual=${total}`);

if (failed) {
  throw new Error(
    'README.md не синхронизирован с зарегистрированными инструментами. Обновите таблицу «Группы инструментов» и фразу о количестве.'
  );
}
console.log('README tool lists are in sync with registered tools.');
