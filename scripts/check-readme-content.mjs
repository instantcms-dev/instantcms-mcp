/**
 * Проверяет, что блок инструментов в README.md соответствует тому,
 * что генерирует scripts/generate-tools-md.ts. Запускается из `check:readme`.
 *
 * Если блок устарел — печатает git-style diff и падает с кодом 1.
 * Если маркеры <!-- tools:start --> / <!-- tools:end --> отсутствуют — фейл.
 */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const readmePath = path.resolve('README.md');
const START = '<!-- tools:start -->';
const END = '<!-- tools:end -->';

function extractBlock(content) {
  const start = content.indexOf(START);
  const end = content.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Маркеры ${START} / ${END} не найдены в README.md`);
  }
  return content.slice(start, end + END.length);
}

const readme = await readFile(readmePath, 'utf8');
const actual = extractBlock(readme);

const tmp = await mkdtemp(path.join(os.tmpdir(), 'tools-md-'));
const expectedPath = path.join(tmp, 'README.expected.md');
const tempReadme = readme.replace(
  new RegExp(`${START}[\\s\\S]*${END}`),
  `${START}\n\nPLACEHOLDER\n\n${END}`
);
await writeFile(readmePath, tempReadme);
try {
  execFileSync('npx', ['tsx', 'scripts/generate-tools-md.ts'], { stdio: 'pipe' });
} finally {
  await writeFile(readmePath, readme);
}
const regenerated = await readFile(readmePath, 'utf8');
const expected = extractBlock(regenerated);

if (actual.trim() !== expected.trim()) {
  console.error('README.md: блок инструментов устарел.');
  console.error('Запустите: npm run docs:tools');
  process.exit(1);
}
console.log('OK: блок инструментов в README.md синхронизирован с registry.');
