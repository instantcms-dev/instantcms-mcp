import { readFile } from 'node:fs/promises';

const required = [
  'AGENTS.md',
  'CLAUDE.md',
  'skills/instantcms-addon/SKILL.md',
  'skills/instantcms-audit/SKILL.md',
];

for (const path of required) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  if (!content.trim()) throw new Error(`${path} is empty`);
}

const claude = await readFile(new URL('../CLAUDE.md', import.meta.url), 'utf8');
if (!claude.includes('AGENTS.md')) {
  throw new Error('CLAUDE.md must reference canonical AGENTS.md');
}

console.log('AI project adapters and skills are present.');
