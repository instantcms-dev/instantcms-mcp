import { fieldsMap } from '../data/fields-map.js';
import { rejectUnsupportedOptions } from '../utils/generator-options.js';

/**
 * Генератор регистрации типа контента InstantCMS 2.18.
 *
 * Ядро не хранит описание типа контента в файлах: `modelBackendContent::addContentType()`
 * вставляет запись в `cms_content_types`, создаёт таблицы `cms_con_<name>_*` и заводит
 * стандартные поля. Поэтому «скаффолд» — это не SQL, а PHP-код, который вызывает API
 * ядра: ровно так делают админка (`admin/actions/ctypes_add.php`) и установщики пакетов.
 *
 * Raw SQL здесь намеренно не генерируется: DDL таблиц контента, nested sets категорий,
 * добавление колонок под поля и сброс кэша — ответственность ядра.
 */

/** Колонки, которые уже есть в таблице контента: поля с такими именами дублировать нельзя. */
export const CONTENT_TABLE_COLUMNS: readonly string[] = [
  'id',
  'title',
  'content',
  'photo',
  'slug',
  'seo_keys',
  'seo_desc',
  'seo_title',
  'tags',
  'template',
  'date_pub',
  'date_last_modified',
  'date_pub_end',
  'is_pub',
  'hits_count',
  'user_id',
  'parent_id',
  'parent_type',
  'parent_title',
  'parent_url',
  'is_parent_hidden',
  'category_id',
  'folder_id',
  'is_comments_on',
  'comments',
  'rating',
  'is_deleted',
  'is_approved',
  'approved_by',
  'date_approved',
  'is_private',
];

export interface ContentTypeField {
  name: string;
  type: string;
  title: string;
  is_in_list?: boolean;
  is_in_item?: boolean;
  is_in_filter?: boolean;
  is_system?: boolean;
  is_private?: boolean;
  options?: Record<string, unknown>;
}

export interface ContentTypeSeo {
  title?: string;
  keys?: string;
  desc?: string;
}

export interface ContentTypeLabels {
  one?: string;
  two?: string;
  many?: string;
  create?: string;
  list?: string;
  profile?: string;
}

export interface ScaffoldContentTypeParams {
  name: string;
  title: string;
  description?: string;
  url_pattern?: string;
  is_cats?: boolean;
  is_comments?: boolean;
  is_tags?: boolean;
  is_rating?: boolean;
  is_date_range?: boolean;
  labels?: ContentTypeLabels;
  options?: Record<string, unknown>;
  seo?: ContentTypeSeo;
  fields?: ContentTypeField[];
}

const NAME_RE = /^[a-z][a-z0-9_]{1,31}$/;
const FIELD_NAME_RE = /^[a-z][a-z0-9_]{0,39}$/;

function phpStr(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function phpScalar(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'string') return phpStr(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return `[${value.map(item => phpScalar(item)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!entries.length) return '[]';
    return `[${entries.map(([key, item]) => `${phpStr(key)} => ${phpScalar(item)}`).join(', ')}]`;
  }
  return phpStr(String(value));
}

/** Многострочный ассоциативный массив PHP с заданным отступом. */
function phpAssoc(entries: Array<[string, unknown]>, indent: string): string {
  if (!entries.length) return '[]';
  const lines = entries.map(
    ([key, value]) => `${indent}    ${phpStr(key)} => ${phpScalar(value)},`
  );
  return `[\n${lines.join('\n')}\n${indent}]`;
}

function fieldEntries(field: ContentTypeField): Array<[string, unknown]> {
  const entries: Array<[string, unknown]> = [
    ['name', field.name],
    ['title', field.title],
    ['type', field.type],
    ['is_in_list', field.is_in_list ?? true],
    ['is_in_item', field.is_in_item ?? true],
    ['is_in_filter', field.is_in_filter ?? false],
  ];
  if (field.is_system) entries.push(['is_system', true]);
  if (field.is_private) entries.push(['is_private', true]);
  if (field.options && Object.keys(field.options).length) entries.push(['options', field.options]);
  return entries;
}

function normalizeLabels(
  name: string,
  title: string,
  labels: ContentTypeLabels | undefined
): Required<ContentTypeLabels> {
  return {
    one: labels?.one ?? title,
    two: labels?.two ?? title,
    many: labels?.many ?? title,
    create: labels?.create ?? name,
    list: labels?.list ?? title,
    profile: labels?.profile ?? '',
  };
}

function buildCtypeEntries(params: ScaffoldContentTypeParams, labels: Required<ContentTypeLabels>) {
  const entries: Array<[string, unknown]> = [
    ['name', params.name],
    ['title', params.title],
    ['url_pattern', params.url_pattern ?? '{id}-{title}'],
    ['is_cats', params.is_cats ?? false],
    ['is_cats_recursive', false],
    ['is_comments', params.is_comments ?? false],
    ['is_tags', params.is_tags ?? false],
    ['is_rating', params.is_rating ?? false],
    ['is_date_range', params.is_date_range ?? false],
    ['is_auto_url', true],
    ['is_auto_keys', true],
    ['is_auto_desc', true],
    ['labels', labels],
  ];
  if (params.description) entries.splice(2, 0, ['description', params.description]);
  if (params.options && Object.keys(params.options).length)
    entries.push(['options', params.options]);
  const seo = params.seo ?? {};
  if (seo.title) entries.push(['seo_title', seo.title]);
  if (seo.keys) entries.push(['seo_keys', seo.keys]);
  if (seo.desc) entries.push(['seo_desc', seo.desc]);
  return entries;
}

function buildInstallPhp(params: ScaffoldContentTypeParams): string {
  const labels = normalizeLabels(params.name, params.title, params.labels);
  const ctype = phpAssoc(
    buildCtypeEntries(params, labels).map(([key, value]) => [key, value]),
    '        '
  );

  const fields = params.fields ?? [];
  const fieldsPhp = fields.length
    ? `[\n${fields
        .map(field => `        ${phpAssoc(fieldEntries(field), '        ')},`)
        .join('\n')}\n    ]`
    : '[]';

  return `<?php

/**
 * Установка: регистрация типа контента «${params.title}» (${params.name}).
 *
 * Тип создаётся через API ядра — modelBackendContent::addContentType() и
 * addContentField(). Это тот же путь, что использует админка
 * (system/controllers/admin/actions/ctypes_add.php) и установщики пакетов.
 *
 * Raw SQL намеренно не используется: ядро само создаёт таблицы контента
 * (cms_con_${params.name}, ..._fields, ..._cats, ..._props, ..._props_values),
 * добавляет колонки под поля, наполняет nested sets категорий и сбрасывает кэш.
 *
 * @param array $install_options
 * @return bool|string true при успехе либо текст ошибки
 */
function install_package(array $install_options = []) {

    require_once PATH . '/system/controllers/content/backend/model.php';

    $model = new modelBackendContent();

    // Повторная установка не должна дублировать тип.
    if ($model->getContentTypeByName(${phpStr(params.name)})) {
        return true;
    }

    $ctype_id = $model->addContentType(${ctype});

    if (!$ctype_id) {
        return ${phpStr(`Не удалось создать тип контента ${params.name}`)};
    }

    // Стандартные поля (title, date_pub, user, photo, content) создаёт addContentType().
    // Ниже — только предметные поля; ctype_id проставляется автоматически.
    $fields = ${fieldsPhp};

    foreach ($fields as $field) {
        $field['ctype_id'] = $ctype_id;
        $model->addContentField(${phpStr(params.name)}, $field);
    }

    return true;
}
`;
}

function buildCliScript(params: ScaffoldContentTypeParams): string {
  const labels = normalizeLabels(params.name, params.title, params.labels);
  const ctype = phpAssoc(buildCtypeEntries(params, labels), '    ');
  const fields = params.fields ?? [];
  const fieldsPhp = fields.length
    ? `[\n${fields.map(field => `    ${phpAssoc(fieldEntries(field), '    ')},`).join('\n')}\n]`
    : '[]';

  return `<?php

/**
 * Регистрация типа контента «${params.title}» (${params.name}) на уже
 * установленном сайте. Положите файл в <корень сайта>/scripts/ и запустите:
 *   php scripts/register_${params.name}.php
 *
 * Скрипт использует API ядра, а не SQL, поэтому безопасен: ядро создаёт
 * таблицы, поля, категории и сбрасывает кэш.
 */
if (PHP_SAPI !== 'cli') {
    die('cli only');
}

require_once __DIR__ . '/../bootstrap.php';

chdir(PATH);
$core->initLanguage();
cmsTemplate::getInstance();

require_once PATH . '/system/controllers/content/backend/model.php';

$model = new modelBackendContent();

if ($model->getContentTypeByName(${phpStr(params.name)})) {
    echo "Тип контента ${params.name} уже существует\\n";
    exit(0);
}

$ctype_id = $model->addContentType(${ctype});

if (!$ctype_id) {
    echo "Не удалось создать тип контента ${params.name}\\n";
    exit(1);
}

$fields = ${fieldsPhp};

foreach ($fields as $field) {
    $field['ctype_id'] = $ctype_id;
    $model->addContentField(${phpStr(params.name)}, $field);
}

echo "Готово: тип контента ${params.name}, id=" . $ctype_id . ", полей=" . count($fields) . "\\n";
`;
}

export function scaffoldContentType(params: ScaffoldContentTypeParams): object {
  const { name, title, fields = [], options = {} } = params;

  rejectUnsupportedOptions('scaffold_content_type', options, {
    permissions: 'генерация прав доступа не поддержана — настройте права типа в админке',
    raw_sql: 'raw SQL не генерируется: DDL таблиц контента делает ядро',
  });

  if (!NAME_RE.test(name)) {
    throw new Error(
      `scaffold_content_type: имя типа должно соответствовать ^[a-z][a-z0-9_]{1,31}$, получено "${name}"`
    );
  }
  if (!title.trim()) {
    throw new Error('scaffold_content_type: title обязателен');
  }
  if (title.length > 100) {
    throw new Error(
      'scaffold_content_type: title длиннее 100 символов (content_types.title varchar(100))'
    );
  }

  const knownTypes = Object.keys(fieldsMap.byName);
  const reserved = new Set(CONTENT_TABLE_COLUMNS);
  const seen = new Set<string>();

  for (const field of fields) {
    if (!FIELD_NAME_RE.test(field.name)) {
      throw new Error(
        `scaffold_content_type: имя поля "${field.name}" должно соответствовать ^[a-z][a-z0-9_]{0,39}$`
      );
    }
    if (reserved.has(field.name)) {
      throw new Error(
        `scaffold_content_type: поле "${field.name}" конфликтует с системной колонкой контента. ` +
          `Запрещены: ${CONTENT_TABLE_COLUMNS.join(', ')}`
      );
    }
    if (seen.has(field.name)) {
      throw new Error(`scaffold_content_type: поле "${field.name}" объявлено дважды`);
    }
    seen.add(field.name);

    if (!knownTypes.includes(field.type)) {
      throw new Error(
        `scaffold_content_type: неизвестный тип поля "${field.type}". Доступные: ${knownTypes.join(', ')}`
      );
    }
  }

  const labels = normalizeLabels(name, title, params.labels);
  const tables = [
    `cms_con_${name}`,
    `cms_con_${name}_fields`,
    `cms_con_${name}_cats`,
    `cms_con_${name}_cats_bind`,
    `cms_con_${name}_props`,
    `cms_con_${name}_props_bind`,
    `cms_con_${name}_props_values`,
  ];

  return {
    content_type: {
      name,
      title,
      description: params.description ?? '',
      url_pattern: params.url_pattern ?? '{id}-{title}',
      is_cats: params.is_cats ?? false,
      is_comments: params.is_comments ?? false,
      is_tags: params.is_tags ?? false,
      is_rating: params.is_rating ?? false,
      is_date_range: params.is_date_range ?? false,
      labels,
      options,
      seo: params.seo ?? {},
    },
    system_fields: ['title', 'date_pub', 'user', 'photo', 'content'],
    custom_fields: fields,
    field_count: fields.length,
    tables,
    files: {
      '[pkg] install.php': buildInstallPhp(params),
      [`scripts/register_${name}.php`]: buildCliScript(params),
    },
    notes: {
      registration:
        'Тип создаётся через API ядра modelBackendContent::addContentType()/addContentField() — как в админке и установщиках пакетов.',
      install_php:
        'Файл кладётся в корень пакета; ядро вызывает install_package() при установке. Повторная установка не дублирует тип.',
      cli_script: `Для уже установленного сайта: положите scripts/register_${name}.php в корень сайта и запустите "php scripts/register_${name}.php".`,
      system_fields:
        'Стандартные поля title, date_pub, user, photo, content создаются автоматически; в custom_fields их указывать нельзя.',
      tables:
        'Ядро создаёт таблицы cms_con_<name>, ..._fields, ..._cats, ..._cats_bind, ..._props, ..._props_bind, ..._props_values (префикс зависит от db_prefix).',
      categories:
        'При is_cats=true категории добавляются через cmsModel::addCategory($ctype_name, [...]) или в админке.',
      widgets_pages:
        'Админка после создания типа дополнительно заводит страницы виджетов (backendAdmin::addCtypeWidgetsPages()); при необходимости вызовите вручную или создайте виджеты в админке.',
      url_tokens:
        'Токены url_pattern: {id}, {title}, {category} и имя любого поля типа. Колонка slug существует по умолчанию и редактируется у материала.',
      field_types: `Доступные типы полей: ${knownTypes.join(', ')}.`,
      uninstall:
        'Ядро ICMS2 не вызывает скрипт удаления; удалите тип в админке (Контент → Типы контента).',
    },
  };
}
