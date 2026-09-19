import { readFile } from 'node:fs/promises';

/**
 * Гарантирует, что CHANGELOG.md содержит непустой раздел для текущей версии
 * из package.json. Без этого релиз с новым кодом, но без записей в changelog
 * проходил бы молча.
 *
 * Раздел «## Unreleased» также должен существовать: живой журнал изменений —
 * часть дисциплины проекта.
 */

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const version = pkg.version;

const problems = [];

if (!/^## Unreleased\s*$/m.test(changelog)) {
  problems.push('нет раздела "## Unreleased"');
}

const sectionPattern = new RegExp(
  `^## ${version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`,
  'm'
);
const match = changelog.match(sectionPattern);
if (!match) {
  problems.push(`нет раздела "## ${version}"`);
} else {
  const after = changelog.slice(match.index + match[0].length);
  const nextSection = after.search(/^## /m);
  const body = (nextSection === -1 ? after : after.slice(0, nextSection)).trim();
  if (!body) {
    problems.push(`раздел "## ${version}" пуст`);
  }
}

if (problems.length > 0) {
  console.error('CHANGELOG не синхронизирован с package.json:');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(`Ожидается непустой "## ${version}" (текущая версия package.json).`);
  process.exit(1);
}

console.log(`CHANGELOG ok: раздел "## ${version}" присутствует и непуст.`);
