/**
 * Генератор секции README с инструментами.
 *
 * Парсит registry-файлы статически: ищет пары `defineTool(server, 'name',
 * 'RU/EN/中文 description', ...)`. Полные описания длиннее, чем MCP-протокол
 * отдаёт клиентам (там лимит ~200 символов), поэтому берём прямо из исходников.
 *
 * Запуск: `tsx scripts/generate-tools-md.ts` или `npm run docs:tools`.
 * Проверка синхронизации: `npm run check:readme`.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readmePath = path.join(root, 'README.md');
const registryDir = path.join(root, 'src', 'registry');

const START_MARKER = '<!-- tools:start -->';
const END_MARKER = '<!-- tools:end -->';

interface GroupDef {
  file: string;
  title: { ru: string; en: string; zh: string };
}

const GROUPS: GroupDef[] = [
  { file: 'meta-tools.ts', title: { ru: 'Мета', en: 'Meta', zh: '元' } },
  {
    file: 'generator-tools.ts',
    title: { ru: 'Генераторы дополнений', en: 'Generators', zh: '生成器' },
  },
  { file: 'knowledge-tools.ts', title: { ru: 'База знаний', en: 'Knowledge', zh: '知识库' } },
  { file: 'database-tools.ts', title: { ru: 'База данных', en: 'Database', zh: '数据库' } },
  { file: 'source-tools.ts', title: { ru: 'Источники InstantCMS', en: 'Sources', zh: '源' } },
  { file: 'language-tools.ts', title: { ru: 'Язык и миграции', en: 'Languages', zh: '语言' } },
  {
    file: 'extension-tools.ts',
    title: { ru: 'Расширения и интеграции', en: 'Extensions', zh: '扩展' },
  },
  { file: 'project-tools.ts', title: { ru: 'Проект', en: 'Project', zh: '项目' } },
  { file: 'template-development-tools.ts', title: { ru: 'Шаблоны', en: 'Templates', zh: '模板' } },
];

export interface ToolDef {
  name: string;
  desc: { ru: string; en: string; zh: string };
}

/** Парсит файл registry и возвращает массив инструментов. */
export async function parseRegistry(file: string): Promise<ToolDef[]> {
  const source = await readFile(path.join(registryDir, file), 'utf8');
  const tools: ToolDef[] = [];
  const re = /defineTool(?:WithManualResult)?\(/g;
  const matches = [...source.matchAll(re)];

  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i]!.index ?? 0;
    const endIdx =
      i + 1 < matches.length
        ? (matches[i + 1]!.index ?? source.length)
        : Math.min(source.length, startIdx + 4000);
    const chunk = source.slice(startIdx, endIdx);

    // Имя: первый строковый литерал после имени функции.
    const nameMatch = chunk.match(/^\s*['"]([^'"]+)['"]/m) ?? chunk.match(/\n\s*['"]([^'"]+)['"]/);
    if (!nameMatch) continue;

    // Description: следующий строковый литерал с '/' и длиной > 20 (двуязычный формат).
    const stringLiterals = [...chunk.matchAll(/['"]([^'"\\]*(?:\\.[^'"\\]*)*)['"]/gs)].map(
      m => m[1] ?? ''
    );
    const desc = stringLiterals.find(s => s.includes('/') && s.length > 20);
    if (!desc) continue;

    tools.push({ name: nameMatch[1]!, desc: parseDescription(desc) });
  }
  return tools;
}

/** Разбирает "RU: a. / EN: b. / 中文：c" — формат с префиксами.
 *  Или "RU a. / EN b. / 中文 c" — без префиксов (текущий формат). */
export function parseDescription(raw: string): { ru: string; en: string; zh: string } {
  const parts = raw.split(/\s*\/\s*/);
  let ru = '';
  let en = '';
  let zh = '';

  if (parts.length >= 2) {
    const head = (parts[0] ?? '').trim();
    const middle = (parts[1] ?? '').trim();
    const tail = parts.length >= 3 ? (parts[2] ?? '').trim() : '';

    if (head.startsWith('RU:')) {
      ru = head.slice(3).trim();
      if (middle.startsWith('EN:')) en = middle.slice(3).trim();
      if (tail.startsWith('中文:') || tail.startsWith('中文：')) {
        zh = tail.replace(/^中文[::]\s*/, '').trim();
      }
    } else {
      // Без префиксов: первый — RU, второй — EN, третий (если есть) — 中文
      ru = head;
      en = middle;
      zh = tail;
    }
  }

  const clean = (s: string) => s.replace(/\.+\s*$/, '').trim();
  return { ru: clean(ru), en: clean(en), zh: clean(zh) };
}

function renderMarkdown(groups: Array<{ def: GroupDef; tools: ToolDef[] }>): string {
  const total = groups.reduce((acc, g) => acc + g.tools.length, 0);
  const intro = `Сервер регистрирует **${total} инструментов**. Ниже — сгруппированный список (RU/EN/中文). Полные схемы и описания доступны через стандартный MCP \`tools/list\`.`;

  const sections = groups
    .filter(g => g.tools.length > 0)
    .map(({ def, tools }) => {
      const rows = tools
        .map(
          t => `| \`${t.name}\` | ${t.desc.ru || '—'} | ${t.desc.en || '—'} | ${t.desc.zh || '—'} |`
        )
        .join('\n');
      return `### ${def.title.ru} / ${def.title.en} / ${def.title.zh} (${tools.length})\n\n| Инструмент / Tool / 工具 | Назначение / RU | Purpose / EN | 用途 / 中文 |\n| --- | --- | --- | --- |\n${rows}\n`;
    });

  return [intro, '', ...sections].join('\n');
}

async function main(): Promise<void> {
  const groups = await Promise.all(
    GROUPS.map(async def => ({ def, tools: await parseRegistry(def.file) }))
  );

  const readme = await readFile(readmePath, 'utf8');
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `Маркеры ${START_MARKER} / ${END_MARKER} не найдены в README.md. Добавьте их вручную.`
    );
  }

  const block = renderMarkdown(groups);
  const before = readme.slice(0, start + START_MARKER.length);
  const after = readme.slice(end);
  const updated = `${before}\n\n${block.trim()}\n\n${after}`;
  await writeFile(readmePath, updated, 'utf8');

  const total = groups.reduce((acc, g) => acc + g.tools.length, 0);
  const empty = groups.filter(g => g.tools.length === 0).map(g => g.def.file);
  console.log(`README.md: ${total} инструментов в ${groups.length} группах.`);
  if (empty.length > 0) {
    console.warn(`WARN: пустые группы — ${empty.join(', ')}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
