#!/usr/bin/env node
/**
 * Headless-установка InstantCMS для проверки сгенерированных артефактов.
 *
 * Установщик ICMS2 работает через веб-форму, поэтому здесь используется его же
 * SQL: `install/languages/ru/sql/base.sql` создаёт схему и базовые данные
 * (контроллеры, виджеты, события, группы, пользователя), а
 * `widgets_bind_modern.sql` подключает виджеты темы modern, без которых
 * страницы рендерятся пустыми. Остаётся записать config.php.
 *
 * Пример:
 *   node scripts/install-instantcms.mjs \
 *     --source .cache/icms2 --target /tmp/icms-site \
 *     --base-url http://127.0.0.1:8099 \
 *     --db-name icms_ci --db-user root --db-password secret
 */

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

function parseArgs(argv) {
  const get = (flag, fallback = '') => {
    const index = argv.indexOf(flag);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };

  return {
    source: get('--source', path.join(process.cwd(), '.cache', 'icms2')),
    target: get('--target', '/tmp/icms-site'),
    baseUrl: get('--base-url', 'http://127.0.0.1:8099'),
    prefix: get('--prefix', 'cms_'),
    dbHost: get('--db-host', process.env.DB_HOST || '127.0.0.1'),
    dbPort: get('--db-port', process.env.DB_PORT || '3306'),
    dbName: get('--db-name', process.env.DB_DATABASE || 'icms_ci'),
    dbUser: get('--db-user', process.env.DB_USER || 'root'),
    dbPassword: get('--db-password', process.env.DB_PASSWORD || ''),
    mysql: get('--mysql', 'mysql'),
    force: argv.includes('--force'),
  };
}

function die(message) {
  console.error(`Ошибка: ${message}`);
  process.exit(1);
}

/**
 * Пароль не передаётся аргументом командной строки: `-p<password>` виден
 * другим пользователям в `ps`. Вместо этого — временный option-файл MySQL
 * с правами 0600, который удаляется при выходе.
 */
function createMysqlDefaults(options) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'icms-mysql-'));
  const file = path.join(dir, 'client.cnf');
  const value = raw => `"${String(raw).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

  fs.writeFileSync(
    file,
    [
      '[client]',
      `host=${value(options.dbHost)}`,
      `port=${value(options.dbPort)}`,
      `user=${value(options.dbUser)}`,
      `password=${value(options.dbPassword)}`,
      '',
    ].join('\n'),
    { mode: 0o600 }
  );

  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
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

function mysql(options, { database = '', input = null, sql = '' } = {}) {
  const args = [
    `--defaults-extra-file=${options.mysqlDefaultsFile}`,
    '-N',
    database,
    ...(sql ? ['-e', sql] : []),
  ].filter(Boolean);

  const result = spawnSync(options.mysql, args, { encoding: 'utf8', input });
  if (result.error) die(`mysql недоступен: ${result.error.message}`);
  if (result.status !== 0) die(`mysql вернул ошибку: ${(result.stderr || '').trim()}`);
  return result.stdout;
}

const options = parseArgs(process.argv.slice(2));
options.mysqlDefaultsFile = createMysqlDefaults(options);

if (!fs.existsSync(path.join(options.source, 'index.php'))) {
  die(`в источнике нет index.php: ${options.source}`);
}
const sqlDir = path.join(options.source, 'install', 'languages', 'ru', 'sql');
const baseSql = path.join(sqlDir, 'base.sql');
if (!fs.existsSync(baseSql)) die(`нет дампа установки: ${baseSql}`);

console.log(`Источник:  ${options.source}`);
console.log(`Каталог:   ${options.target}`);
console.log(`База:      ${options.dbName} (префикс ${options.prefix})`);
console.log(`Базовый URL: ${options.baseUrl}`);

// 1. Копия исходников
if (fs.existsSync(options.target)) {
  if (!options.force) die(`каталог уже существует: ${options.target} (используйте --force)`);
  fs.rmSync(options.target, { recursive: true, force: true });
}
fs.cpSync(options.source, options.target, { recursive: true });

// 2. База данных
mysql(options, { sql: `DROP DATABASE IF EXISTS \`${options.dbName}\`;` });
mysql(options, {
  sql: `CREATE DATABASE \`${options.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
});

const dumps = ['base.sql', 'widgets_bind_modern.sql'];
for (const dump of dumps) {
  const file = path.join(sqlDir, dump);
  if (!fs.existsSync(file)) continue;
  const contents = fs.readFileSync(file, 'utf8').replace(/\{#\}/g, options.prefix);
  mysql(options, { database: options.dbName, input: contents });
}

// 3. Конфигурация сайта
const url = options.baseUrl.replace(/\/$/, '');
const config = `<?php

return [
    'root'                        => '/',
    'host'                        => '${url}',
    'upload_root'                 => '/upload/',
    'upload_host'                 => '${url}/upload',
    'cache_root'                  => '/cache/',
    'is_site_on'                  => 1,
    'off_reason'                  => 'Технические работы',
    'sitename'                    => 'InstantCMS CI',
    'hometitle'                   => 'InstantCMS CI',
    'date_format'                 => 'd.m.Y',
    'date_format_js'              => 'dd.mm.yy',
    'time_zone'                   => 'Europe/Moscow',
    'allow_users_time_zone'       => 1,
    'template'                    => 'modern',
    'template_admin'              => 'admincoreui',
    'template_mobile'             => '',
    'template_tablet'             => '',
    'template_dev'                => '',
    'template_dev_allow_ips'      => '',
    'db_host'                     => '${options.dbHost}',
    'db_base'                     => '${options.dbName}',
    'db_user'                     => '${options.dbUser}',
    'db_pass'                     => '${options.dbPassword}',
    'db_prefix'                   => '${options.prefix}',
    'db_engine'                   => 'InnoDB',
    'db_charset'                  => 'utf8mb4',
    'clear_sql_mode'              => 1,
    'innodb_full_text'            => 1,
    'db_users_table'              => '${options.prefix}users',
    'language'                    => 'ru',
    'metakeys'                    => '',
    'metadesc'                    => '',
    'is_sitename_in_title'        => 0,
    'ct_autoload'                 => 'frontpage',
    'ct_default'                  => 'content',
    'frontpage'                   => 'none',
    'debug'                       => 1,
    'emulate_lag'                 => '',
    'cache_enabled'               => 0,
    'cache_method'                => 'files',
    'cache_ttl'                   => 300,
    'cache_host'                  => 'localhost',
    'cache_port'                  => 11211,
    'min_html'                    => 0,
    'merge_css'                   => 0,
    'merge_js'                    => 0,
    'mail_transport'              => 'mail',
    'mail_from'                   => 'noreply@example.com',
    'mail_from_name'              => '',
    'mail_smtp_server'            => 'smtp.example.com',
    'mail_smtp_port'              => 25,
    'mail_smtp_auth'              => 1,
    'mail_smtp_user'              => 'user@example.com',
    'mail_smtp_pass'              => '',
    'is_check_updates'            => 0,
    'detect_ip_key'               => 'REMOTE_ADDR',
    'allow_ips'                   => '',
    'default_editor'              => 3,
    'show_breadcrumbs'            => 1,
    'check_spoofing_type'         => 0,
    'production_time'             => ${Math.floor(Date.now() / 1000)},
    'native_yaml'                 => 0,
    'session_save_handler'        => 'files',
    'session_name'                => 'ICMSCI',
    'session_save_path'           => '',
    'session_maxlifetime'         => 24,
    'controllers_without_widgets' => ['admin'],
    'ctype_default'               => [],
    'is_404_layout'               => 0,
];
`;

const configPath = path.join(options.target, 'system', 'config', 'config.php');
fs.writeFileSync(configPath, config);

// 4. Кэш
for (const entry of fs.readdirSync(path.join(options.target, 'cache'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  for (const file of fs.readdirSync(path.join(options.target, 'cache', entry.name))) {
    fs.rmSync(path.join(options.target, 'cache', entry.name, file), {
      recursive: true,
      force: true,
    });
  }
}

const tables = mysql(options, {
  database: options.dbName,
  sql: 'SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE();',
}).trim();
const controllers = mysql(options, {
  database: options.dbName,
  sql: `SELECT COUNT(*) FROM ${options.prefix}controllers;`,
}).trim();

console.log(`Таблиц: ${tables}, контроллеров: ${controllers}`);
console.log(`Конфигурация: ${configPath}`);
console.log(
  'Готово. Запуск сервера: php -S 127.0.0.1:8099 -t ' +
    options.target +
    ' ' +
    options.target +
    '/index.php'
);
