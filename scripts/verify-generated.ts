#!/usr/bin/env node
/**
 * Автоматическая проверка сгенерированных артефактов на реальном InstantCMS.
 *
 * Разворачивает артефакт в тестовом экземпляре, создаёт записи в БД, прогоняет
 * HTTP-сценарии и по требованию удаляет всё созданное.
 *
 * Пример:
 *   npx tsx scripts/verify-generated.ts \
 *     --scenario crud --name vfydemo \
 *     --site ~/Sites/idev.test --base-url https://idev.test \
 *     --db-user root --db-password secret --db-name idev.test \
 *     --cleanup
 *
 * Скрипт пишет в тестовый сайт и БД. Без флага --yes он только печатает план.
 */

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { scaffoldAddon } from '../src/tools/scaffold-tool.js';
import { missingDirs, removeEmptyDirs } from '../src/utils/site-deploy.js';
import { scaffoldApi } from '../src/tools/api-tool.js';
import { scaffoldCron } from '../src/tools/cron-tool.js';
import { scaffoldCrud } from '../src/tools/crud-tool.js';
import { scaffoldWidget } from '../src/tools/widget-tool.js';

interface Options {
  scenario: string;
  name: string;
  site: string;
  baseUrl: string;
  theme: string;
  mysql: string;
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  cleanup: boolean;
  yes: boolean;
  insecure: boolean;
}

interface CheckResult {
  name: string;
  expected: number;
  actual: number;
  ok: boolean;
  note?: string;
}

interface Deployed {
  /** Созданные файлы. */
  files: string[];
  /** Созданные каталоги (только те, которых не было). */
  dirs: string[];
}

interface Artifact {
  /** Путь относительно корня сайта → содержимое. */
  files: Record<string, string>;
  /** SQL-файлы (пути относительно корня сайта). */
  sql: string[];
  /** Строка в cms_controllers, если контроллер нужно зарегистрировать. */
  controller?: { name: string; title: string; isBackend: number };
  /** Задача планировщика, если создан cron-хук. */
  schedulerTask?: { hook: string; period: number; title: string };
  /** Строка в cms_widgets, если создан виджет. */
  widget?: { controller: string; name: string; title: string };
  /** Опциональная привязка виджета к позиции. */
  widgetBinding?: { position: string; options: string };
  /** Таблицы, создаваемые install.sql (для очистки). */
  tables: string[];
  /** Демонстрационные строки. */
  seed?: Array<{ table: string; columns: string; values: string }>;
}

function parseArgs(argv: string[]): Options {
  const get = (flag: string, fallback = ''): string => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };
  const has = (flag: string): boolean => argv.includes(flag);

  return {
    scenario: get('--scenario'),
    name: get('--name', 'verifydemo'),
    site: (get('--site') || path.join(os.homedir(), 'Sites', 'idev.test')).replace(
      /^~/,
      os.homedir()
    ),
    baseUrl: get('--base-url') || 'https://idev.test',
    theme: get('--theme', 'modern'),
    mysql: get('--mysql', 'mysql'),
    dbHost: get('--db-host', process.env.DB_HOST || '127.0.0.1'),
    dbUser: get('--db-user', process.env.DB_USER || 'root'),
    dbPassword: get('--db-password', process.env.DB_PASSWORD || ''),
    dbName: get('--db-name', process.env.DB_DATABASE || ''),
    cleanup: has('--cleanup'),
    yes: has('--yes'),
    insecure: has('--insecure'),
  };
}

function die(message: string): never {
  console.error(`Ошибка: ${message}`);
  process.exit(1);
}

function mysql(options: Options, sql: string, file?: string): string {
  const args = [
    `-h${options.dbHost}`,
    `-u${options.dbUser}`,
    options.dbPassword ? `-p${options.dbPassword}` : '',
    options.dbName,
    ...(file ? [] : ['-e', sql]),
  ].filter(Boolean);
  const result = spawnSync(options.mysql, args, {
    encoding: 'utf8',
    input: file,
  });
  if (result.error) die(`mysql недоступен: ${result.error.message}`);
  if (result.status !== 0) die(`mysql вернул ошибку: ${(result.stderr || '').trim()}`);
  return result.stdout;
}

/** Строит артефакты для выбранного сценария. */
function buildArtifact(options: Options): Artifact {
  const files: Record<string, string> = {};
  const sql: string[] = [];
  const tables: string[] = [];

  const put = (source: Record<string, string>): void => {
    for (const [rawPath, content] of Object.entries(source)) {
      if (rawPath.startsWith('[pkg] ')) {
        const file = rawPath.replace('[pkg] ', '');
        if (file.endsWith('.sql')) {
          files[`.verify/${file}`] = content;
          sql.push(`.verify/${file}`);
          for (const match of content.matchAll(/CREATE TABLE IF NOT EXISTS `([^`]+)`/g)) {
            tables.push(match[1]);
          }
        }
        continue;
      }
      files[rawPath.replace(/^package\//, '')] = content;
    }
  };

  switch (options.scenario) {
    case 'crud': {
      const result = scaffoldCrud({
        addon_name: options.name,
        fields: [
          { name: 'description', type: 'text', title: 'Описание' },
          { name: 'price', type: 'int', title: 'Цена' },
        ],
        options: { theme: options.theme },
      }) as { files: Record<string, string> };
      put(result.files);
      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify CRUD', isBackend: 1 },
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,description,price,date_pub,is_pub',
            values: `1,'Опубликованный материал','Описание',1500,NOW(),1`,
          },
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,description,price,date_pub,is_pub',
            values: `1,'Скрытый материал','Не виден',999,NOW(),0`,
          },
        ],
      };
    }
    case 'api': {
      // Экшены API живут внутри контроллера — генерируем его вместе с моделью.
      const crud = scaffoldCrud({
        addon_name: options.name,
        fields: [{ name: 'description', type: 'text', title: 'Описание' }],
        options: { theme: options.theme },
      }) as { files: Record<string, string> };
      put(crud.files);

      const result = scaffoldApi({
        addon_name: options.name,
        endpoints: [
          { name: 'list', method: 'GET', path: '/list', auth_required: false },
          {
            name: 'item',
            method: 'GET',
            path: '/items/{id}',
            auth_required: false,
            params: [{ name: 'id', type: 'path', required: true }],
          },
          { name: 'create', method: 'POST', path: '/create', auth_required: true },
          { name: 'status', method: 'GET', path: '/status', auth_required: false },
        ],
      }) as { files: Record<string, string> };
      put(result.files);
      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify API', isBackend: 0 },
      };
    }
    case 'addon': {
      const result = scaffoldAddon({
        name: options.name,
        title: 'Verify Addon',
        type: 'with_admin',
      }) as { files: Record<string, string> };
      put(result.files);
      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify Addon', isBackend: 1 },
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,text,date_pub,is_pub',
            values: `1,'Материал дополнения','Текст',NOW(),1`,
          },
        ],
      };
    }
    case 'cron': {
      // Планировщик вызывает runHook() у контроллера — значит, контроллер нужен.
      const crud = scaffoldCrud({
        addon_name: options.name,
        fields: [{ name: 'description', type: 'text', title: 'Описание' }],
        options: { theme: options.theme },
      }) as { files: Record<string, string> };
      put(crud.files);

      const result = scaffoldCron({
        addon_name: options.name,
        tasks: [
          {
            name: 'cleanup',
            schedule: { minute: '0', hour: '*' },
            description: 'Очистка',
            action: 'taskCleanup',
          },
        ],
      }) as { files: Record<string, string> };
      for (const [rawPath, content] of Object.entries(result.files)) {
        if (rawPath.startsWith('[pkg] ')) {
          files[`.verify/${rawPath.replace('[pkg] ', '')}`] = content;
          continue;
        }
        files[rawPath.replace(/^package\//, '')] = content;
      }

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify cron', isBackend: 1 },
        schedulerTask: { hook: 'cleanup', period: 60, title: 'Очистка' },
      };
    }
    case 'widget': {
      // Виджету нужен контроллер с моделью — иначе cmsCore::getModel() не найдёт класс.
      const crud = scaffoldCrud({
        addon_name: options.name,
        fields: [{ name: 'description', type: 'text', title: 'Описание' }],
        options: { theme: options.theme },
      }) as { files: Record<string, string> };
      put(crud.files);

      const result = scaffoldWidget({
        addon_name: options.name,
        widget_name: 'recent',
        options_config: { with_template: true, with_styles: true, with_cache: false },
      }) as { files: Record<string, string> };
      put(result.files);

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify widget', isBackend: 0 },
        widget: {
          controller: options.name,
          name: 'recent',
          title: 'Verify widget',
        },
        widgetBinding: { position: 'pos_8', options: '---\nlimit: 3\n' },
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,description,date_pub,is_pub',
            values: `1,'Материал для виджета','Описание',NOW(),1`,
          },
        ],
      };
    }
    default:
      return die(`неизвестный сценарий: ${options.scenario || '(пусто)'}`);
  }
}

async function httpStatus(
  options: Options,
  url: string,
  init?: RequestInit
): Promise<{ status: number; body: string }> {
  if (options.insecure) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const response = await fetch(url, { redirect: 'manual', ...init });
  const body = await response.text();
  return { status: response.status, body };
}

function registerRows(options: Options, artifact: Artifact): void {
  if (artifact.controller) {
    mysql(
      options,
      `INSERT INTO cms_controllers (title,name,slug,is_enabled,author,url,version,is_backend)
       VALUES ('${artifact.controller.title}','${artifact.controller.name}',NULL,1,'verify','','1.0.0',${artifact.controller.isBackend});`
    );
  }
  if (artifact.schedulerTask) {
    mysql(
      options,
      `INSERT INTO cms_events (event,listener,ordering,is_enabled)
       VALUES ('cron_${artifact.schedulerTask.hook}','${artifact.controller?.name}',1,1);`
    );
  }
  if (artifact.widget) {
    mysql(
      options,
      `INSERT INTO cms_widgets (controller,name,title,author,url,version)
       VALUES ('${artifact.widget.controller}','${artifact.widget.name}','${artifact.widget.title}','verify','','1.0.0');`
    );
  }
  if (artifact.widget && artifact.widgetBinding) {
    mysql(
      options,
      `INSERT INTO cms_widgets_bind (widget_id,title,options,is_cacheable)
         SELECT id,'Verify widget','${artifact.widgetBinding.options.replace(/\n/g, '\\n')}',0
         FROM cms_widgets WHERE controller='${artifact.widget.controller}' AND name='${artifact.widget.name}';`
    );
    mysql(
      options,
      `INSERT INTO cms_widgets_bind_pages (bind_id,template,is_enabled,page_id,position,ordering)
         SELECT b.id,'${options.theme}',1,0,'${artifact.widgetBinding.position}',0
         FROM cms_widgets_bind b
         JOIN cms_widgets w ON w.id=b.widget_id
         WHERE w.controller='${artifact.widget.controller}' AND w.name='${artifact.widget.name}' LIMIT 1;`
    );
  }
  for (const seed of artifact.seed ?? []) {
    mysql(options, `INSERT INTO ${seed.table} (${seed.columns}) VALUES (${seed.values});`);
  }
}

function clearCache(options: Options): void {
  const cache = path.join(options.site, 'cache');
  if (!fs.existsSync(cache)) return;
  for (const entry of fs.readdirSync(cache, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const file of fs.readdirSync(path.join(cache, entry.name))) {
      fs.rmSync(path.join(cache, entry.name, file), { recursive: true, force: true });
    }
  }
}

function deploy(options: Options, artifact: Artifact): Deployed {
  const targets = Object.entries(artifact.files).map(([relative, content]) => ({
    target: path.join(options.site, relative),
    content,
  }));

  // Каталоги вычисляются до записи: удалять будем только те, что создали сами.
  const dirs = missingDirs(
    options.site,
    targets.map(item => item.target)
  );

  for (const { target, content } of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }

  for (const relative of artifact.sql) {
    mysql(options, '', fs.readFileSync(path.join(options.site, relative), 'utf8'));
  }

  return { files: targets.map(item => item.target), dirs };
}

function cleanup(options: Options, artifact: Artifact, deployed: Deployed): void {
  for (const file of deployed.files) {
    fs.rmSync(file, { force: true });
  }
  // Удаляются только созданные нами и уже пустые каталоги.
  removeEmptyDirs(options.site, deployed.dirs);
  if (artifact.controller) {
    mysql(options, `DELETE FROM cms_controllers WHERE name='${artifact.controller.name}';`);
  }
  if (artifact.widget) {
    mysql(
      options,
      `DELETE bp FROM cms_widgets_bind_pages bp
         JOIN cms_widgets_bind b ON b.id=bp.bind_id
         JOIN cms_widgets w ON w.id=b.widget_id
        WHERE w.controller='${artifact.widget.controller}' AND w.name='${artifact.widget.name}';`
    );
    mysql(
      options,
      `DELETE b FROM cms_widgets_bind b
         JOIN cms_widgets w ON w.id=b.widget_id
        WHERE w.controller='${artifact.widget.controller}' AND w.name='${artifact.widget.name}';`
    );
    mysql(
      options,
      `DELETE FROM cms_widgets WHERE controller='${artifact.widget.controller}' AND name='${artifact.widget.name}';`
    );
  }
  if (artifact.schedulerTask) {
    mysql(
      options,
      `DELETE FROM cms_scheduler_tasks WHERE controller='${artifact.controller?.name}';`
    );
    mysql(options, `DELETE FROM cms_events WHERE listener='${artifact.controller?.name}';`);
  }
  for (const table of artifact.tables) {
    mysql(options, `DROP TABLE IF EXISTS \`${table}\`;`);
  }
  clearCache(options);

  // Страховка: после очистки установка обязана остаться целой.
  const requiredPaths = [
    path.join(options.site, 'system', 'config', 'config.php'),
    path.join(options.site, 'system', 'core'),
    path.join(options.site, 'templates'),
  ];
  const missing = requiredPaths.filter(required => !fs.existsSync(required));
  if (missing.length) {
    die(`ОЧИСТКА ПОВРЕДИЛА САЙТ, отсутствует: ${missing.join(', ')}. Требуется восстановление.`);
  }
}

async function runChecks(options: Options, artifact: Artifact): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const base = options.baseUrl.replace(/\/$/, '');
  const name = options.name;

  const add = (check: string, expected: number, actual: number, note?: string): void => {
    results.push({ name: check, expected, actual, ok: expected === actual, note });
  };

  const idOf = (where: string): number => {
    const rows = mysql(
      options,
      `SELECT id FROM cms_${name}_items WHERE ${where} ORDER BY id ASC LIMIT 1;`
    );
    const match = rows.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  // Таблица items есть только у сценариев, которые её создают.
  const hasItemsTable = ['crud', 'addon', 'widget'].includes(options.scenario);
  const first = hasItemsTable ? idOf('is_pub=1') : 0;
  const hidden = hasItemsTable ? idOf('is_pub=0') : 0;

  if (options.scenario === 'crud') {
    const index = await httpStatus(options, `${base}/${name}`);
    add(`GET /${name}`, 200, index.status);
    add(`список содержит материал`, 1, index.body.includes('Опубликованный материал') ? 1 : 0);
    add(`скрытый материал не показан`, 1, index.body.includes('Скрытый материал') ? 0 : 1);

    const view = await httpStatus(options, `${base}/${name}/view/${first}`);
    add(`GET /${name}/view/${first}`, 200, view.status);
    add(`страница материала отрисована`, 1, view.body.includes('Опубликованный материал') ? 1 : 0);

    const missing = await httpStatus(options, `${base}/${name}/view/99999`);
    add(`GET /${name}/view/99999`, 404, missing.status);

    if (hidden) {
      const hiddenPage = await httpStatus(options, `${base}/${name}/view/${hidden}`);
      add(`скрытая запись /view/${hidden}`, 404, hiddenPage.status);
    }

    const addForm = await httpStatus(options, `${base}/${name}/add`);
    add(`GET /${name}/add (гость)`, 303, addForm.status);

    const page2 = await httpStatus(options, `${base}/${name}/index/2`);
    add(`пагинация /${name}/index/2`, 200, page2.status);
  }

  if (options.scenario === 'api') {
    const status = await httpStatus(options, `${base}/${name}/api_v1_status`);
    add('GET /api_v1_status', 200, status.status);

    // Контракт модели не реализован, поэтому endpoint отвечает 501, а не падает.
    const list = await httpStatus(options, `${base}/${name}/api_v1_list`);
    add('GET /api_v1_list (контракт не реализован)', 501, list.status);
    add('ответ list — JSON', 1, list.body.includes('NOT_IMPLEMENTED') ? 1 : 0);

    const item = await httpStatus(options, `${base}/${name}/api_v1_item/1`);
    add('GET /api_v1_item/1 (контракт не реализован)', 501, item.status);

    const unauthorized = await httpStatus(options, `${base}/${name}/api_v1_create`, {
      method: 'POST',
    });
    add('POST /api_v1_create без токена', 401, unauthorized.status);

    const wrongMethod = await httpStatus(options, `${base}/${name}/api_v1_create`);
    add('GET /api_v1_create (неверный метод)', 405, wrongMethod.status);
  }

  if (options.scenario === 'addon') {
    const index = await httpStatus(options, `${base}/${name}`);
    add(`GET /${name}`, 200, index.status);
    add('материал в списке', 1, index.body.includes('Материал дополнения') ? 1 : 0);

    const view = await httpStatus(options, `${base}/${name}/view/${first}`);
    add(`GET /${name}/view/${first}`, 200, view.status);

    const missing = await httpStatus(options, `${base}/${name}/view/99999`);
    add(`GET /${name}/view/99999`, 404, missing.status);
  }

  if (options.scenario === 'cron') {
    const hookName = artifact.schedulerTask?.hook ?? 'cleanup';

    // Регистрируем задачу так же, как это делает сгенерированный install_package().
    const registerScript = `<?php
if (PHP_SAPI !== 'cli') { die('404'); }
require_once __DIR__ . '/bootstrap.php';
chdir(PATH);
$core->initLanguage();
cmsTemplate::getInstance();
$id = cmsCore::getModel('admin')->addSchedulerTask([
    'title'      => '${artifact.schedulerTask?.title ?? hookName}',
    'controller' => '${name}',
    'hook'       => '${hookName}',
    'period'     => ${artifact.schedulerTask?.period ?? 60},
    'is_active'  => 1,
]);
echo $id;
`;
    const scriptPath = path.join(options.site, '_verify_cron.php');
    fs.writeFileSync(scriptPath, registerScript);

    let taskId = 0;
    try {
      const executed = spawnSync('php', [scriptPath], { encoding: 'utf8' });
      taskId = Number((executed.stdout || '').trim()) || 0;
    } finally {
      fs.rmSync(scriptPath, { force: true });
    }
    add('задача планировщика зарегистрирована', 1, taskId > 0 ? 1 : 0);

    if (taskId) {
      const cron = spawnSync(
        'php',
        [path.join(options.site, 'cron.php'), 'verify', String(taskId)],
        {
          encoding: 'utf8',
        }
      );
      add('cron.php выполнился без ошибок', 0, cron.status ?? 1);

      const row = mysql(
        options,
        `SELECT is_active, date_last_run IS NOT NULL AS ran FROM cms_scheduler_tasks WHERE id=${taskId};`
      );
      add('задача не отключена после запуска', 1, /\t1\t1|\(1,\s*1\)|1\s+1/.test(row) ? 1 : 0);
    }
  }

  if (options.scenario === 'widget') {
    const home = await httpStatus(options, `${base}/`);
    add('GET /', 200, home.status);
    add(`виджет ${name}/recent отрисован`, 1, home.body.includes(`widget_${name}_recent`) ? 1 : 0);
    add('материал виджета показан', 1, home.body.includes('Материал для виджета') ? 1 : 0);
  }

  return results;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.scenario) {
    die('укажите --scenario crud|api|addon|widget|cron');
  }
  const config = path.join(options.site, 'system', 'config', 'config.php');
  if (!fs.existsSync(config)) {
    die(`не похоже на InstantCMS: нет ${config}`);
  }
  if (!options.dbName) {
    die('укажите --db-name или DB_DATABASE');
  }

  const artifact = buildArtifact(options);

  console.log(`Сценарий:  ${options.scenario}`);
  console.log(`Сайт:      ${options.site}`);
  console.log(`Базовый URL: ${options.baseUrl}`);
  console.log(`Файлов:    ${Object.keys(artifact.files).length}`);
  console.log(`Таблиц:    ${artifact.tables.join(', ') || '—'}`);

  if (!options.yes) {
    console.log('\nЭто запись в тестовый сайт и БД. Повторите с --yes для выполнения.');
    return;
  }

  const deployed = deploy(options, artifact);
  registerRows(options, artifact);
  clearCache(options);

  let results: CheckResult[] = [];
  try {
    results = await runChecks(options, artifact);
  } finally {
    // Очистка выполняется даже при падении проверок, чтобы не оставлять мусор.
    if (options.cleanup) {
      cleanup(options, artifact, deployed);
      console.log('\nСозданные файлы, записи и таблицы удалены.');
    }
  }

  console.log('\nСценарии:');
  for (const result of results) {
    const mark = result.ok ? 'OK  ' : 'FAIL';
    console.log(
      `  ${mark} ${result.name}: ожидалось ${result.expected}, получено ${result.actual}`
    );
  }

  const failed = results.filter(result => !result.ok);

  if (!options.cleanup) {
    console.log('\nАртефакт оставлен на сайте (--cleanup удалит его).');
  }

  if (failed.length) {
    die(`не пройдено сценариев: ${failed.length}`);
  }
  console.log('\nВсе сценарии пройдены.');
}

main().catch(error => die(error instanceof Error ? error.message : String(error)));
