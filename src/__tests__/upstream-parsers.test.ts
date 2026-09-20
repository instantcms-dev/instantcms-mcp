import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { discoverHooks } from '../tools/parser/hooks-parser.js';
import { generateComponentsSource } from '../tools/parser/components-parser.js';
import { parseEventsFromSql } from '../tools/parser/events-parser.js';
import { parseSqlFile } from '../tools/parser/sql-parser.js';

/**
 * Парсеры проверяются на **закреплённом** исходнике InstantCMS: ожидания
 * привязаны к коммиту из `knowledge/upstream.json`, а не к текущему master.
 * Так изменение парсера или случайная правка справочника не пройдут незаметно:
 * либо падает тест, либо weekly-sync открывает PR с другим коммитом.
 *
 * Источник: ICMS_SOURCE -> .cache/icms2 -> ~/Sites/idev.test.
 * Без источника тест пропускается; в CI job upstream-compatibility задан
 * ICMS_REQUIRE_SOURCE=1, и тогда коммит обязан совпасть с закреплённым.
 */

function locateSource(): string | null {
  const candidates = [
    process.env.ICMS_SOURCE,
    path.join(process.cwd(), '.cache', 'icms2'),
    path.join(os.homedir(), 'Sites', 'idev.test'),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find(candidate => existsSync(path.join(candidate, 'system', 'core'))) ?? null;
}

function gitHead(root: string): string | null {
  try {
    return execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

const source = locateSource();
const sourceRequired = process.env.ICMS_REQUIRE_SOURCE === '1';
const pinnedCommit = (
  JSON.parse(readFileSync(path.join(process.cwd(), 'knowledge', 'upstream.json'), 'utf8')) as {
    commit: string;
  }
).commit;
const sourceCommit = source ? gitHead(source) : null;
const isPinnedSource = sourceCommit === pinnedCommit;

if (sourceRequired && !source) {
  throw new Error(
    'ICMS_REQUIRE_SOURCE=1, но исходники InstantCMS не найдены: задайте ICMS_SOURCE или подготовьте .cache/icms2'
  );
}

if (sourceRequired && !isPinnedSource) {
  throw new Error(
    `ICMS_REQUIRE_SOURCE=1, но исходник не на закреплённом коммите: ожидался ${pinnedCommit}, получен ${sourceCommit ?? 'не git-репозиторий'}`
  );
}

const describeSource = source ? describe : describe.skip;
// Строгие ожидания имеют смысл только на закреплённом коммите: на изменённой
// копии сайта счётчики законно отличаются.
const itPinned = isPinnedSource ? test : test.skip;

describeSource('парсеры на закреплённом исходнике InstantCMS', () => {
  itPinned('коммит источника совпадает с knowledge/upstream.json', () => {
    expect(sourceCommit).toBe(pinnedCommit);
  });

  itPinned('парсер хуков находит известные хуки в известных файлах', () => {
    const hooks = discoverHooks(source as string);
    expect(hooks.length).toBeGreaterThanOrEqual(250);

    const renderPage = hooks.find(hook => hook.name === 'render_page');
    expect(renderPage).toMatchObject({ inferredType: 'filter' });
    expect(renderPage?.files).toContain('system/core/template.php');

    const sitemap = hooks.find(hook => hook.name === 'sitemap_urls');
    expect(sitemap?.files).toContain('system/controllers/sitemap/hooks/cron_generate.php');

    const userLogin = hooks.find(hook => hook.name === 'user_login');
    expect(userLogin?.occurrences).toBeGreaterThanOrEqual(2);
  });

  itPinned('парсер компонентов отдаёт публичные API ядра и скрывает protected', () => {
    const generated = generateComponentsSource(source as string);
    expect(generated.length).toBeGreaterThan(100_000);
    for (const marker of ['cmsModel', 'cmsTemplate', 'cmsEventsManager', 'function getItemById']) {
      expect(generated).toContain(marker);
    }
    // protected-метод ядра (cmsCore::loadModel) в публичное API не попадает.
    expect(generated).not.toContain('function loadModel');
    expect(generated).not.toContain('function loadManifest');
  });

  itPinned('парсер событий читает реальный дамп установки', () => {
    const baseSql = readFileSync(
      path.join(source as string, 'install', 'languages', 'ru', 'sql', 'base.sql'),
      'utf8'
    );
    const events = parseEventsFromSql(baseSql);
    expect(events.eventCount).toBeGreaterThanOrEqual(50);
    expect(events.byEvent.user_login).toMatchObject({ listener: 'admin' });
  });

  itPinned('SQL-парсер сохраняет поля и индексы реальных таблиц', () => {
    const schema = parseSqlFile(
      path.join(source as string, 'install', 'languages', 'ru', 'sql', 'base.sql')
    );
    expect(schema.tables.length).toBeGreaterThanOrEqual(40);

    const users = schema.tables.find(table => table.name === 'cms_users');
    expect(users).toBeDefined();
    expect(users?.fields.length).toBeGreaterThanOrEqual(30);
    expect(users?.indexes.length).toBeGreaterThanOrEqual(10);

    const events = schema.tables.find(table => table.name === 'cms_events');
    expect(events?.fields.map(field => field.name)).toEqual(
      expect.arrayContaining(['event', 'listener', 'ordering', 'is_enabled'])
    );
  });
});
