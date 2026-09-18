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
import { scaffoldAdminPartial } from '../src/tools/admin-partial-tool.js';
import { missingDirs, removeEmptyDirs } from '../src/utils/site-deploy.js';
import { scaffoldApi } from '../src/tools/api-tool.js';
import { scaffoldCron } from '../src/tools/cron-tool.js';
import { scaffoldCrud } from '../src/tools/crud-tool.js';
import { scaffoldEmail } from '../src/tools/email-tool.js';
import { scaffoldCache } from '../src/tools/cache-tool.js';
import { scaffoldFilter } from '../src/tools/filter-tool.js';
import { scaffoldImportExport } from '../src/tools/import-export-tool.js';
import { scaffoldLayoutOverride } from '../src/tools/layout-override-tool.js';
import { scaffoldHook } from '../src/tools/addon-tool.js';
import { scaffoldLang } from '../src/tools/lang-tool.js';
import { scaffoldMigration } from '../src/tools/migration-tool.js';
import { generateMigration } from '../src/tools/migration-tool.js';
import { scaffoldForm } from '../src/tools/form-tool.js';
import { scaffoldGrid } from '../src/tools/grid-tool.js';
import { scaffoldSeo } from '../src/tools/seo-tool.js';
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

interface RuntimeCheck {
  note: string;
  script: string;
  expect: (output: string) => boolean;
}

interface Artifact {
  /** Путь относительно корня сайта → содержимое. */
  files: Record<string, string>;
  /** SQL-файлы (пути относительно корня сайта). */
  sql: string[];
  /** Строка в cms_controllers, если контроллер нужно зарегистрировать. */
  controller?: { name: string; title: string; isBackend: number };
  /** PHP-сценарии для проверки загружаемых классов и хуков (form, grid, hook и т.п.). */
  runtimePhp?: RuntimeCheck | RuntimeCheck[];
  /** Функция регистрации виджета из сгенерированного install_widget.php. */
  widgetInstaller?: string;
  /** Задача планировщика, если создан cron-хук. */
  schedulerTask?: { hook: string; period: number; title: string };
  /** Слушатели событий, которые нужно зарегистрировать в cms_events. */
  events?: Array<{ event: string; listener?: string; ordering?: number }>;
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

/**
 * Пароль не передаётся аргументом командной строки: `-p<password>` виден
 * другим пользователям в `ps`. Вместо этого — временный option-файл MySQL
 * с правами 0600, который удаляется при выходе.
 */
let mysqlDefaultsDir: string | null = null;
function getMysqlDefaultsFile(options: Options): string {
  if (mysqlDefaultsDir) return path.join(mysqlDefaultsDir, 'client.cnf');

  mysqlDefaultsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'icms-mysql-'));
  const file = path.join(mysqlDefaultsDir, 'client.cnf');
  const value = (raw: string): string => `"${raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

  fs.writeFileSync(
    file,
    [
      '[client]',
      `host=${value(options.dbHost)}`,
      `user=${value(options.dbUser)}`,
      `password=${value(options.dbPassword)}`,
      '',
    ].join('\n'),
    { mode: 0o600 }
  );

  const cleanup = (): void => {
    if (mysqlDefaultsDir) fs.rmSync(mysqlDefaultsDir, { recursive: true, force: true });
  };
  process.once('exit', cleanup);
  process.once('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.once('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });

  return file;
}

function mysql(options: Options, sql: string, file?: string): string {
  const args = [
    `--defaults-extra-file=${getMysqlDefaultsFile(options)}`,
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
    case 'crud_options': {
      // Опции CRUD: вариант шаблона списка и SEO-поля.
      const result = scaffoldCrud({
        addon_name: options.name,
        fields: [
          { name: 'description', type: 'text', title: 'Описание' },
          { name: 'price', type: 'int', title: 'Цена' },
        ],
        options: { theme: options.theme, use_seo: true, list_template: 'table' },
      }) as { files: Record<string, string> };
      put(result.files);

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify CRUD options', isBackend: 1 },
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns:
              'user_id,title,description,price,meta_title,meta_description,meta_keywords,date_pub,is_pub',
            values: `1,'Материал с SEO','Описание',10,'SEO заголовок','SEO описание','seo, ключи',NOW(),1`,
          },
        ],
      };
    }
    case 'crud_slug': {
      // ЧПУ: колонка slug, routes.php, route() и поиск материала по slug.
      const result = scaffoldCrud({
        addon_name: options.name,
        fields: [{ name: 'description', type: 'text', title: 'Описание' }],
        options: { theme: options.theme, use_slug: true },
      }) as { files: Record<string, string> };
      put(result.files);

      // SEO-хук должен находить материал по slug, а не по id.
      const seo = scaffoldSeo({
        addon_name: options.name,
        options: { use_slug: true, use_og_tags: true, use_schema_org: true },
      }) as { files: Record<string, string> };
      put(seo.files);

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify CRUD slug', isBackend: 1 },
        events: [{ event: 'render_page' }],
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,slug,description,date_pub,is_pub',
            values: `1,'Материал ЧПУ','moy-material','Описание',NOW(),1`,
          },
        ],
      };
    }
    case 'routes': {
      // Дополнение с ЧПУ: routes.php плюс route() в контроллере.
      const result = scaffoldAddon({
        name: options.name,
        title: 'Verify routes',
        type: 'with_routes',
      }) as { files: Record<string, string> };
      put(result.files);

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify routes', isBackend: 1 },
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,text,date_pub,is_pub',
            values: `1,'Материал через маршрут','Текст',NOW(),1`,
          },
        ],
      };
    }
    case 'integration': {
      // CRUD с контрактом модели + API + виджет: проверяем, что связка работает
      // без ручных правок.
      const crud = scaffoldCrud({
        addon_name: options.name,
        fields: [
          { name: 'description', type: 'text', title: 'Описание' },
          { name: 'price', type: 'int', title: 'Цена' },
        ],
        options: { theme: options.theme, with_api_model: true },
      }) as { files: Record<string, string> };
      put(crud.files);

      const api = scaffoldApi({
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
        ],
      }) as { files: Record<string, string> };
      put(api.files);

      const widget = scaffoldWidget({
        addon_name: options.name,
        widget_name: 'recent',
        options: [{ name: 'limit', type: 'number', label: 'Количество', default: 3 }],
        options_config: { with_template: true, with_styles: false, with_cache: false },
      }) as { files: Record<string, string> };
      for (const [rawPath, content] of Object.entries(widget.files)) {
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
        controller: { name: options.name, title: 'Verify integration', isBackend: 1 },
        widget: { controller: options.name, name: 'recent', title: 'Verify widget' },
        widgetBinding: { position: 'pos_8', options: '---\nlimit: 3\n' },
        widgetInstaller: `install_widget_${options.name}_recent`,
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,description,price,date_pub,is_pub',
            values: `1,'Материал интеграции','Описание',500,NOW(),1`,
          },
        ],
      };
    }
    case 'form':
    case 'grid': {
      // Формы и гриды живут внутри контроллера и проверяются загрузкой классов.
      const crud = scaffoldCrud({
        addon_name: options.name,
        fields: [
          { name: 'description', type: 'text', title: 'Описание' },
          { name: 'price', type: 'int', title: 'Цена' },
        ],
        options: { theme: options.theme },
      }) as { files: Record<string, string> };
      put(crud.files);

      const UpperCamelCase = options.name
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

      if (options.scenario === 'form') {
        const form = scaffoldForm({
          addon_name: options.name,
          form_name: 'item',
          fields: [
            { name: 'description', type: 'text', title: 'Описание' },
            { name: 'price', type: 'decimal', title: 'Цена' },
          ],
        }) as { files: Record<string, string> };
        put(form.files);

        return {
          files,
          sql,
          tables,
          controller: { name: options.name, title: 'Verify form', isBackend: 1 },
          runtimePhp: {
            note: 'форма собирается через init()',
            script: `cmsCore::loadControllerLanguage('admin');
require_once PATH . '/system/controllers/${options.name}/backend/forms/form_item.php';
$form = new form${UpperCamelCase}Item();
$structure = $form->init('add');
$childs = 0;
foreach ($structure as $fieldset) {
    $childs += count($fieldset['childs'] ?? []);
}
echo (int) $childs;`,
            expect: output => Number(output.trim()) >= 2,
          },
        };
      }

      const grid = scaffoldGrid({
        addon_name: options.name,
        grid_name: 'items',
        columns: [
          { name: 'title', title: 'Заголовок', filter: 'like' },
          { name: 'price', title: 'Цена', filter: 'range' },
        ],
      }) as { files: Record<string, string> };
      put(grid.files);

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify grid', isBackend: 1 },
        runtimePhp: {
          note: 'функция грида возвращает колонки с фильтрами',
          script: `require_once PATH . '/system/controllers/${options.name}/backend/grids/grid_items.php';
$controller = cmsCore::getController('${options.name}');
$grid = grid_items($controller);
echo count($grid['columns']) . '|' . (!empty($grid['options']['is_filter']) ? 1 : 0);`,
          expect: output => {
            const [columns, filter] = output.trim().split('|');
            return Number(columns) >= 2 && filter === '1';
          },
        },
      };
    }
    case 'filter': {
      // Бэкенд-грид и фронтенд-фильтр: применяем фильтры к модели в рантайме.
      const crud = scaffoldCrud({
        addon_name: options.name,
        fields: [
          { name: 'description', type: 'text', title: 'Описание' },
          { name: 'price', type: 'int', title: 'Цена' },
        ],
        options: { theme: options.theme },
      }) as { files: Record<string, string> };
      put(crud.files);

      const result = scaffoldFilter({
        addon_name: options.name,
        fields: [
          { field: 'title', type: 'text', label: 'Заголовок' },
          { field: 'price', type: 'range', label: 'Цена' },
        ],
        options: { frontend: true },
      }) as { files: Record<string, string> };
      put(result.files);

      const UpperCamelCase = options.name
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify filter', isBackend: 1 },
        seed: [
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,description,price,date_pub,is_pub',
            values: `1,'Материал один','Описание',100,NOW(),1`,
          },
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,description,price,date_pub,is_pub',
            values: `1,'Материал два','Описание',200,NOW(),1`,
          },
          {
            table: `cms_${options.name}_items`,
            columns: 'user_id,title,description,price,date_pub,is_pub',
            values: `1,'Материал три','Описание',300,NOW(),1`,
          },
        ],
        runtimePhp: {
          note: 'фронтенд-фильтр применяется к модели',
          script: `cmsCore::loadControllerLanguage('${options.name}');
require_once PATH . '/system/controllers/${options.name}/${options.name}_filter.php';

$table = '${options.name}_items';

$none = cmsCore::getModel('${options.name}')->get($table);

$byTitle = cmsCore::getModel('${options.name}');
${UpperCamelCase}Filter::apply($byTitle, new cmsRequest(['title' => 'Материал два'], cmsRequest::CTX_INTERNAL));
$titleRows = $byTitle->get($table);

$byPrice = cmsCore::getModel('${options.name}');
${UpperCamelCase}Filter::apply($byPrice, new cmsRequest(['price' => ['from' => 150]], cmsRequest::CTX_INTERNAL));
$priceRows = $byPrice->get($table);

echo count($none) . '|' . count($titleRows) . '|' . count($priceRows);`,
          expect: output => output.trim() === '3|1|2',
        },
      };
    }
    case 'core_artifacts': {
      // migration + lang + hook: артефакты, которые ядро реально загружает.
      const addon = scaffoldAddon({
        name: options.name,
        title: 'Verify core artifacts',
        type: 'basic',
      }) as { files: Record<string, string> };
      put(addon.files);

      const migration = scaffoldMigration({
        addon_name: options.name,
        table_name: `${options.name}_migrated`,
        fields: [
          { name: 'id', type: 'int(10) unsigned', nullable: false, extra: 'AUTO_INCREMENT' },
          { name: 'title', type: 'varchar(255)', nullable: false, default: '' },
        ],
        options: { indexes: [{ name: 'title', type: 'INDEX', fields: ['title'] }] },
      }) as { files: Record<string, string> };
      put(migration.files);
      files['.verify/install_package.php'] = migration.files['[pkg] install.php'];

      // Второй генератор миграций: чистый SQL и install.php без file-map.
      const legacy = generateMigration(`${options.name}_legacy`, [
        { name: 'id', type: 'int(10) unsigned', extra: 'AUTO_INCREMENT' },
        { name: 'title', type: 'varchar(255)', nullable: false },
      ]) as { sql: string; install_php: string };
      files['.verify/migrate_legacy.sql'] = legacy.sql;
      files['.verify/install_legacy.php'] = legacy.install_php;
      sql.push('.verify/migrate_legacy.sql');
      tables.push(`cms_${options.name}_legacy`);

      const lang = scaffoldLang({ addon_name: options.name }) as { file_content: string };
      files[`system/languages/ru/controllers/${options.name}/${options.name}.php`] =
        lang.file_content;

      const hook = scaffoldHook({
        addon_name: options.name,
        hook_name: 'render_page',
        type: 'filter',
      }) as { code: string };
      files[`system/controllers/${options.name}/hooks/render_page.php`] = hook.code;

      const email = scaffoldEmail({
        addon_name: options.name,
        templates: [{ name: 'welcome', subject: 'Тест {site}', body: 'Привет, {nickname}!' }],
      }) as { files: Record<string, string> };
      put(email.files);

      const NAME = options.name.toUpperCase();

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify core artifacts', isBackend: 1 },
        runtimePhp: [
          {
            note: 'install_package() из migration',
            script: `require_once PATH . '/.verify/install_package.php';
echo function_exists('install_package') && install_package([]) === true ? 'ok' : 'fail';`,
            expect: output => output.trim() === 'ok',
          },
          {
            note: 'SQL scaffold_migration создал таблицу',
            script: `$model = cmsCore::getModel('${options.name}');
echo (int) $model->getCount('${options.name}_migrated') === 0 ? 'ok' : 'fail';`,
            expect: output => output.trim() === 'ok',
          },
          {
            note: 'generate_migration создал таблицу и install_package()',
            script: `$model = cmsCore::getModel('${options.name}');
$count = (int) $model->getCount('${options.name}_legacy');
require_once PATH . '/.verify/install_legacy.php';
echo $count === 0 && install_package([]) === true ? 'ok' : 'fail';`,
            expect: output => output.trim() === 'ok',
          },
          {
            note: 'языковой файл scaffold_lang',
            script: `cmsCore::loadControllerLanguage('${options.name}');
echo defined('LANG_${NAME}_TITLE') ? 'ok' : 'missing';`,
            expect: output => output.trim() === 'ok',
          },
          {
            note: 'хук из scaffold_hook вызывается ядром',
            script: `$controller = cmsCore::getController('${options.name}');
$result = $controller->runHook('render_page', ['ping']);
echo is_string($result) ? $result : json_encode($result);`,
            expect: output => output.trim() === 'ping',
          },
          {
            note: 'письмо scaffold_email читается ядром',
            script: `$text = cmsCore::getLanguageTextFile('letters/${options.name}_welcome');
$replaced = string_replace_keys_values($text, ['nickname' => 'Мир', 'site' => 'ICMS']);
$hasSubject = (bool) preg_match('/\\[subject:(.+)\\]/iu', $replaced, $matches);
echo $hasSubject && strpos($replaced, 'Привет, Мир!') !== false && $matches[1] === 'Тест ICMS'
    ? 'ok'
    : 'fail:' . $replaced;`,
            expect: output => output.trim() === 'ok',
          },
        ],
      };
    }
    case 'admin_partial': {
      // Фрагмент админки рендерится ядром через getRenderedAsset().
      const result = scaffoldAdminPartial({
        addon_name: options.name,
        partials: [
          { name: 'menu', type: 'sidebar' },
          { name: 'info', type: 'panel' },
        ],
      }) as { files: Record<string, string> };
      put(result.files);

      return {
        files,
        sql,
        tables,
        runtimePhp: {
          note: 'фрагмент админки рендерится ядром',
          script: `$template = new cmsTemplate('admincoreui');
$html = $template->getRenderedAsset('${options.name}/sidebar_menu', [
    'config' => cmsConfig::getInstance(),
    'user' => cmsUser::getInstance(),
    'items' => ['dashboard', 'settings'],
]);
echo $html !== '' && strpos($html, 'Array') === false ? 'ok' : 'fail:' . $html;`,
          expect: output => output.trim().split('\n').pop() === 'ok',
        },
      };
    }
    case 'import_export': {
      // Библиотека импорта/экспорта поверх реального контроллера и модели CRUD.
      const crud = scaffoldCrud({
        addon_name: options.name,
        fields: [
          { name: 'title', type: 'varchar', title: 'Заголовок' },
          { name: 'price', type: 'decimal', title: 'Цена' },
        ],
        options: { theme: options.theme, use_slug: true },
      }) as { files: Record<string, string> };
      put(crud.files);

      const result = scaffoldImportExport({
        addon_name: options.name,
        fields: [
          { field: 'title', type: 'string', label: 'title', required: true },
          { field: 'price', type: 'number', label: 'price' },
          { field: 'slug', type: 'string', label: 'slug' },
          { field: 'date_pub', type: 'datetime', label: 'date_pub' },
        ],
        options: {
          table: `${options.name}_items`,
          key_field: 'slug',
          update_existing: true,
          use_csv: true,
          use_json: true,
          use_xml: true,
        },
      }) as { files: Record<string, string> };
      put(result.files);

      const Name = options.name
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify import/export', isBackend: 0 },
        runtimePhp: [
          {
            note: 'библиотека импорта/экспорта работает на модели CRUD',
            script: `require_once PATH . '/system/controllers/${options.name}/export.php';
require_once PATH . '/system/controllers/${options.name}/import.php';

$model = cmsCore::getModel('${options.name}');
$now = date('Y-m-d H:i:s');

$model->insert('${options.name}_items', [
    'title' => 'Экспорт-строка',
    'price' => 12.5,
    'slug' => 'export-row',
    'date_pub' => $now,
    'is_pub' => 1,
]);

$export = new ${Name}Export(['table' => '${options.name}_items'], $model);
$rows = $export->exportToArray();
$csv = $export->exportToCsv();
$json = $export->exportToJson();

$import = new ${Name}Import([
    'table' => '${options.name}_items',
    'skip_header' => false,
    'update_existing' => false,
], $model);
$stats = $import->importFromArray([
    ['title' => 'Импорт-строка', 'price' => '42', 'slug' => 'import-row', 'date_pub' => $now],
]);

$import_again = new ${Name}Import([
    'table' => '${options.name}_items',
    'skip_header' => false,
    'update_existing' => true,
    'key_field' => 'slug',
], $model);
$stats_again = $import_again->importFromArray([
    ['title' => 'Обновлённая строка', 'price' => '99', 'slug' => 'import-row', 'date_pub' => $now],
]);

$count = (int) $model->getCount('${options.name}_items');
$updated_row = $model->getItemByField('${options.name}_items', 'slug', 'import-row');

$ok = count($rows) === 2
    && in_array('title', $rows[0], true)
    && $stats['imported'] === 1
    && $stats['errors'] === 0
    && $stats_again['updated'] === 1
    && $count === 2
    && $updated_row['title'] === 'Обновлённая строка'
    && strpos($csv, 'Экспорт-строка') !== false
    && strpos($json, 'Экспорт-строка') !== false;

echo $ok ? 'ok' : 'fail:' . json_encode([$rows, $stats, $stats_again, $count]);`,
            expect: output => output.trim() === 'ok',
          },
          {
            note: 'форма импорта собирается на реальных полях',
            script: `require_once PATH . '/system/controllers/${options.name}/import.form.php';

$form = new cmsForm();
${Name}ImportForm::create($form);

$fields = ['import_file', 'update_existing', 'skip_header', 'encoding'];
$missing = [];
foreach ($fields as $field) {
    if (!$form->hasField($field)) { $missing[] = $field; }
}

echo $missing ? 'missing:' . implode(',', $missing) : 'ok';`,
            expect: output => output.trim() === 'ok',
          },
        ],
      };
    }
    case 'template_override': {
      // Переопределение шаблона темы: файл рендерится через getTemplateFileName().
      const result = scaffoldLayoutOverride({
        addon_name: options.name,
        overrides: [{ controller: options.name, template: options.theme, action: 'view' }],
      }) as { files: Record<string, string> };
      put(result.files);

      return {
        files,
        sql,
        tables,
        runtimePhp: {
          note: 'переопределённый шаблон рендерится ядром',
          script: `$template = cmsTemplate::getInstance();
$path = $template->getTemplateFileName('controllers/${options.name}/view', true);
if (!$path) { echo 'missing'; return; }

$item = ['title' => 'Материал', 'content' => 'Тело'];

$render = Closure::bind(function () use ($path, $item) {
    ob_start();
    include $path;
    return ob_get_clean();
}, $template, get_class($template));

$html = $render();

echo strpos($html, 'Материал') !== false && strpos($html, 'Array') === false
    ? 'ok'
    : 'fail:' . $html;`,
          expect: output => output.trim() === 'ok',
        },
      };
    }
    case 'cache': {
      // Кэш-класс и хуки: ядро вызывает хук события <controller>_after_add.
      const addon = scaffoldAddon({
        name: options.name,
        title: 'Verify cache',
        type: 'basic',
      }) as { files: Record<string, string> };
      put(addon.files);

      const result = scaffoldCache({
        addon_name: options.name,
        options: { use_tags: true, default_ttl: 60 },
      }) as { files: Record<string, string> };
      put(result.files);

      const UpperCamelCase = options.name
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

      return {
        files,
        sql,
        tables,
        controller: { name: options.name, title: 'Verify cache', isBackend: 1 },
        events: [{ event: `${options.name}_after_add` }],
        runtimePhp: [
          {
            note: 'класс кэша загружается и инвалидация не падает',
            script: `require_once PATH . '/system/controllers/${options.name}/cache.php';

$cache = ${UpperCamelCase}Cache::getInstance();
$cache->invalidateItem(7);
$cache->invalidateList();

$missing = [];
foreach (['get', 'set', 'delete', 'remember', 'invalidateItem', 'invalidateList'] as $method) {
    if (!method_exists($cache, $method)) { $missing[] = $method; }
}
echo $missing ? 'missing:' . implode(',', $missing) : (class_exists('${UpperCamelCase}CacheTags') ? 'ok' : 'no-tags');`,
            expect: output => output.trim() === 'ok',
          },
          {
            note: 'хук кэша вызывается ядром через cms_events',
            script: `$result = cmsEventsManager::hook('${options.name}_after_add', ['id' => 7]);
echo is_array($result) && ($result['id'] ?? null) === 7 ? 'ok' : json_encode($result);`,
            expect: output => output.trim() === 'ok',
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
  if (artifact.widgetInstaller) {
    // Вызываем сгенерированную функцию так, как это делает install_package().
    const scriptPath = path.join(options.site, '_verify_widget_install.php');
    fs.writeFileSync(
      scriptPath,
      `<?php
if (PHP_SAPI !== 'cli') { die('404'); }
require_once __DIR__ . '/bootstrap.php';
chdir(PATH);
$core->initLanguage();
require_once __DIR__ . '/.verify/install_widget.php';
${artifact.widgetInstaller}();
echo 'ok';
`
    );
    try {
      spawnSync('php', [scriptPath], { encoding: 'utf8' });
    } finally {
      fs.rmSync(scriptPath, { force: true });
    }
  }

  if (artifact.schedulerTask) {
    mysql(
      options,
      `INSERT INTO cms_events (event,listener,ordering,is_enabled)
       VALUES ('cron_${artifact.schedulerTask.hook}','${artifact.controller?.name}',1,1);`
    );
  }
  for (const event of artifact.events ?? []) {
    mysql(
      options,
      `INSERT INTO cms_events (event,listener,ordering,is_enabled)
       VALUES ('${event.event}','${event.listener ?? artifact.controller?.name}',${event.ordering ?? 99},1);`
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
  if (artifact.events?.length) {
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
  const hasItemsTable = [
    'crud',
    'addon',
    'widget',
    'integration',
    'routes',
    'crud_options',
    'crud_slug',
  ].includes(options.scenario);
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

  const runtimeChecks = Array.isArray(artifact.runtimePhp)
    ? artifact.runtimePhp
    : artifact.runtimePhp
      ? [artifact.runtimePhp]
      : [];

  for (const check of runtimeChecks) {
    const scriptPath = path.join(options.site, '_verify_runtime.php');
    const body = `<?php
if (PHP_SAPI !== 'cli') { die('404'); }
require_once __DIR__ . '/bootstrap.php';
chdir(PATH);
$core->initLanguage();
cmsTemplate::getInstance();
${check.script}
`;
    fs.writeFileSync(scriptPath, body);

    let output = '';
    let status = 1;
    try {
      const executed = spawnSync('php', [scriptPath], { encoding: 'utf8' });
      output = executed.stdout || '';
      status = executed.status ?? 1;
    } finally {
      fs.rmSync(scriptPath, { force: true });
    }

    add(`${check.note}: PHP без ошибок`, 0, status);
    if (status === 0) {
      add(`${check.note}: результат`, 1, check.expect(output) ? 1 : 0);
    }
  }

  if (options.scenario === 'crud_slug') {
    const pretty = await httpStatus(options, `${base}/${name}/moy-material.html`);
    add(`GET /${name}/moy-material.html (ЧПУ)`, 200, pretty.status);
    add('ЧПУ отдаёт материал', 1, pretty.body.includes('Материал ЧПУ') ? 1 : 0);
    add('OG-разметка по slug', 1, pretty.body.includes('og:title') ? 1 : 0);
    add(
      'og:url ведёт на ЧПУ',
      1,
      /property="og:url" content="[^"]*moy-material\.html"/.test(pretty.body) ? 1 : 0
    );

    const missing = await httpStatus(options, `${base}/${name}/net-takogo-materiala.html`);
    add(`GET /${name}/net-takogo-materiala.html`, 404, missing.status);

    const direct = await httpStatus(options, `${base}/${name}/view/${first}`);
    add(`GET /${name}/view/${first} (id)`, 200, direct.status);
  }

  if (options.scenario === 'crud_options') {
    const index = await httpStatus(options, `${base}/${name}`);
    add(`GET /${name} (таблица)`, 200, index.status);
    add('шаблон списка — таблица', 1, index.body.includes('<table') ? 1 : 0);

    const view = await httpStatus(options, `${base}/${name}/view/${first}`);
    add(`GET /${name}/view/${first}`, 200, view.status);
    add('SEO-заголовок применён', 1, view.body.includes('<title>SEO заголовок') ? 1 : 0);
    add(
      'SEO-описание применено',
      1,
      /<meta name="description" content="SEO описание"/.test(view.body) ? 1 : 0
    );
  }

  if (options.scenario === 'routes') {
    const index = await httpStatus(options, `${base}/${name}/`);
    add(`GET /${name}/ (главная)`, 200, index.status);

    const page = await httpStatus(options, `${base}/${name}/page/1`);
    add(`ЧПУ /${name}/page/1`, 200, page.status);

    const routed = await httpStatus(options, `${base}/${name}/${first}.html`);
    add(`ЧПУ /${name}/${first}.html`, 200, routed.status);
    add('материал через маршрут найден', 1, routed.body.includes('Материал через маршрут') ? 1 : 0);

    const missing = await httpStatus(options, `${base}/${name}/99999.html`);
    add(`ЧПУ /${name}/99999.html`, 404, missing.status);

    const direct = await httpStatus(options, `${base}/${name}/view/${first}`);
    add(`прямой /${name}/view/${first}`, 200, direct.status);
  }

  if (options.scenario === 'integration') {
    const index = await httpStatus(options, `${base}/${name}`);
    add(`GET /${name}`, 200, index.status);

    // Модель получила контракт, поэтому API отвечает данными, а не 501.
    const list = await httpStatus(options, `${base}/${name}/api_v1_list`);
    add('GET /api_v1_list (контракт в модели CRUD)', 200, list.status);
    add('список API содержит материал', 1, list.body.includes('Материал интеграции') ? 1 : 0);

    const item = await httpStatus(options, `${base}/${name}/api_v1_item/${first}`);
    add(`GET /api_v1_item/${first}`, 200, item.status);

    const protegido = await httpStatus(options, `${base}/${name}/api_v1_create`, {
      method: 'POST',
    });
    add('POST /api_v1_create без токена', 401, protegido.status);

    // Токен выдаётся тем же методом, который генерирует scaffold_crud.
    const tokenScript = `<?php
if (PHP_SAPI !== 'cli') { die('404'); }
require_once __DIR__ . '/bootstrap.php';
chdir(PATH);
$core->initLanguage();
$model = cmsCore::getModel('${name}');
echo $model->createApiToken(1);
`;
    const tokenPath = path.join(options.site, '_verify_token.php');
    fs.writeFileSync(tokenPath, tokenScript);

    let token = '';
    try {
      const executed = spawnSync('php', [tokenPath], { encoding: 'utf8' });
      token = (executed.stdout || '').trim();
    } finally {
      fs.rmSync(tokenPath, { force: true });
    }
    add('токен выдан через createApiToken()', 1, token.length === 64 ? 1 : 0);

    if (token) {
      const created = await httpStatus(options, `${base}/${name}/api_v1_create?token=${token}`, {
        method: 'POST',
        body: new URLSearchParams({ title: 'Создано по токену', price: '777' }),
      });
      add('POST /api_v1_create с токеном', 201, created.status);

      const foreign = await httpStatus(options, `${base}/${name}/api_v1_create?token=deadbeef`, {
        method: 'POST',
        body: new URLSearchParams({ title: 'x' }),
      });
      add('POST /api_v1_create с чужим токеном', 401, foreign.status);
    }

    const home = await httpStatus(options, `${base}/`);
    add('виджет отрисован на главной', 1, home.body.includes(`widget_${name}_recent`) ? 1 : 0);
  }

  if (options.scenario === 'import_export') {
    const payload = encodeURIComponent(
      JSON.stringify([
        { title: 'Импорт HTTP', price: '7', slug: 'http-row', date_pub: '2026-01-01 00:00:00' },
      ])
    );

    const imported = await httpStatus(
      options,
      `${base}/${name}/api_import?data=${payload}&update_existing=0`,
      { method: 'POST' }
    );
    add('POST /api_import', 200, imported.status);
    add('ответ импорта — success', 1, imported.body.includes('"success":true') ? 1 : 0);

    const exported = await httpStatus(options, `${base}/${name}/api_export?format=json`);
    add('GET /api_export (json)', 200, exported.status);
    add('экспорт содержит CLI-строку', 1, exported.body.includes('Экспорт-строка') ? 1 : 0);
    add('экспорт содержит HTTP-строку', 1, exported.body.includes('Импорт HTTP') ? 1 : 0);

    const csv = await httpStatus(options, `${base}/${name}/api_export?format=csv`);
    add('GET /api_export (csv)', 200, csv.status);
    add('CSV содержит заголовок title', 1, csv.body.includes('title') ? 1 : 0);
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
    die(
      'укажите --scenario crud|api|addon|widget|cron|form|grid|filter|cache|core_artifacts|template_override|admin_partial|import_export|integration|routes|crud_options|crud_slug'
    );
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
