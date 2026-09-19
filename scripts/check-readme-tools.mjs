/**
 * Синхронизация README ↔ зарегистрированные инструменты.
 *
 * Сверяет:
 *  1. Фактическое число defineTool(server, ...) в каждом src/registry/*.ts
 *  2. Число в заголовке каждой группы блока <!-- tools:start/end -->
 *  3. Итоговую фразу "**N инструментов**" в начале блока.
 *
 * Полная перегенерация блока — `npm run docs:tools`. Эта проверка ловит
 * рассинхрон после ручных правок README.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const registryDir = path.join(root, 'src', 'registry');
const readmePath = path.join(root, 'README.md');

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

const start = readme.indexOf('<!-- tools:start -->');
const end = readme.indexOf('<!-- tools:end -->');
if (start === -1 || end === -1 || end < start) {
  throw new Error('Маркеры <!-- tools:start --> / <!-- tools:end --> не найдены в README.md.');
}
const block = readme.slice(start, end + '<!-- tools:end -->'.length);

// Парсим заголовки секций: "### Group Ru / En / Zh (NN)"
const documented = {};
const headerPattern = /^###\s+(.+?)\s+\/\s+(.+?)\s+\/\s+(.+?)\s+\((\d+)\)/gm;
let m;
while ((m = headerPattern.exec(block)) !== null) {
  // Берём только те группы, что входят в наш реестр; «Инструмент / Tool / 工具»
  // и другие заголовки с другим форматом игнорируем.
  const ru = (m[1] ?? '').trim();
  const count = Number(m[4]);
  // Имя группы восстанавливаем по ru-title.
  const known = Object.entries({
    'Мета': 'meta-tools',
    'Генераторы дополнений': 'generator-tools',
    'База знаний': 'knowledge-tools',
    'База данных': 'database-tools',
    'Источники InstantCMS': 'source-tools',
    'Язык и миграции': 'language-tools',
    'Расширения и интеграции': 'extension-tools',
    'Проект': 'project-tools',
    'Шаблоны': 'template-development-tools',
  });
  const match = known.find(([k]) => k === ru);
  if (match) documented[match[1]] = count;
}

// Итоговая фраза: "Сервер регистрирует **N инструментов**"
const totalMatch = block.match(/Сервер регистрирует\s+\*\*(\d+)\s+инструмент/);
const documentedTotal = totalMatch ? Number(totalMatch[1]) : null;

let failed = false;
const lines = [];
for (const [group, count] of Object.entries(actual)) {
  const doc = documented[group];
  const ok = doc === count;
  if (!ok) failed = true;
  lines.push(`  ${ok ? 'OK ' : 'FAIL'} ${group}: README=${doc ?? '—'} actual=${count}`);
}

const total = Object.values(actual).reduce((a, b) => a + b, 0);
const totalOk = documentedTotal === total;
if (!totalOk) failed = true;

console.log('README tool-group sync:');
console.log(lines.join('\n'));
console.log(`  ${totalOk ? 'OK ' : 'FAIL'} total: README=${documentedTotal ?? '—'} actual=${total}`);

if (failed) {
  throw new Error(
    'README.md не синхронизирован с зарегистрированными инструментами. Запустите: npm run docs:tools'
  );
}
console.log('README tool lists are in sync with registered tools.');
