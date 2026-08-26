import { escapeXml, quoteIni, quotePhp } from '../utils/serialization.js';

interface ScaffoldAddonOptions {
  name: string;
  title: string;
  author?: string;
  author_url?: string;
  version?: string;
  type: 'basic' | 'with_admin' | 'with_hooks' | 'with_routes' | 'with_widget';
  hooks?: string[];
  description?: string;
}

export function scaffoldAddon(opts: ScaffoldAddonOptions): object {
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(opts.name)) {
    throw new Error(
      'Техническое имя должно начинаться с латинской буквы и содержать 2–64 строчных букв, цифр или подчёркиваний'
    );
  }
  const name = opts.name;
  const Name = name.split('_').map(capitalize).join('');
  const NAME = name.toUpperCase();
  const version = opts.version || '1.0.0';
  const author = opts.author || 'Author';
  const author_url = opts.author_url || 'https://example.com';
  const title = opts.title;
  const description = opts.description || `Дополнение ${title}`;

  const files: Record<string, string> = {};

  // ── manifest.ru.ini — корень пакета ─────────────────────────────────────────
  const versionMatch = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!versionMatch) {
    throw new Error('Версия должна быть указана в формате X.Y.Z, например 1.0.0');
  }
  const [, major, minor, build] = versionMatch;

  files['[pkg] manifest.ru.ini'] = `[info]
title = ${quoteIni(title)}
description = ${quoteIni(description)}
image_hint =

[version]
major = ${major}
minor = ${minor}
build = ${build}

[author]
name = ${quoteIni(author)}
url = ${quoteIni(author_url)}

[install]
type = controller
name = ${name}`;

  // ── install.sql ──────────────────────────────────────────────────────────────
  files['[pkg] install.sql'] = `-- Замените cms_ на реальный префикс БД из system/config/config.php
CREATE TABLE IF NOT EXISTS \`cms_${name}_items\` (
    \`id\`       int(10) unsigned NOT NULL AUTO_INCREMENT,
    \`user_id\`  int(10) unsigned NOT NULL DEFAULT '0',
    \`title\`    varchar(255) NOT NULL DEFAULT '',
    \`text\`     text,
    \`date_pub\` datetime NOT NULL,
    \`is_pub\`   tinyint(1) unsigned NOT NULL DEFAULT '1',
    PRIMARY KEY (\`id\`),
    KEY \`user_id\` (\`user_id\`),
    KEY \`is_pub\` (\`is_pub\`),
    KEY \`date_pub\` (\`date_pub\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  // ── Файлы контроллера ────────────────────────────────────────────────────────
  const ctrl = `package/system/controllers/${name}`;

  // ── model.php ────────────────────────────────────────────────────────────────
  files[`${ctrl}/model.php`] = `<?php

class model${Name} extends cmsModel {

    public function getPublished(int $limit = 10): array {
        return $this->filterEqual('is_pub', 1)
                    ->orderBy('date_pub', 'desc')
                    ->limit($limit)
                    ->get('${name}_items');
    }

    public function getByUser(int $user_id): array {
        return $this->filterEqual('user_id', $user_id)
                    ->orderBy('date_pub', 'desc')
                    ->get('${name}_items');
    }

}`;

  // ── frontend.php ─────────────────────────────────────────────────────────────
  files[`${ctrl}/frontend.php`] = `<?php
/**
 * @property \\model${Name} $model
 */
class ${name} extends cmsFrontend {

    protected $useOptions = true;

    // Экшены размещаются в actions/*.php
    // Шаблоны — в /templates/{theme}/controllers/${name}/*.tpl.php
    // Языковой файл — /system/languages/ru/controllers/${name}/${name}.php

}`;

  // ── manifest.xml ─────────────────────────────────────────────────────────────
  const hookEntries = (opts.hooks || [])
    .map(h => `        <hook controller="${name}" name="${escapeXml(h)}" />`)
    .join('\n');

  files[`${ctrl}/manifest.xml`] = `<?xml version="1.0" encoding="utf-8"?>
<addon>
    <name>${name}</name>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <version>${escapeXml(version)}</version>
    <build>${build}</build>
    <author>
        <name>${escapeXml(author)}</name>
        <url>${escapeXml(author_url)}</url>
        <email></email>
    </author>
    <dependencies>
    </dependencies>
    <hooks>
${hookEntries || '        <!-- <hook controller="${name}" name="user_registered" /> -->'}
    </hooks>
</addon>`;

  // ── install.php / uninstall.php ───────────────────────────────────────────────
  files[`${ctrl}/install.php`] = `<?php

class install${Name} extends cmsInstaller {

    public function install() {
        // SQL выполняется автоматически из install.sql при установке пакета.
        // Здесь можно добавить дополнительную инициализацию:
        // $this->addOption('${name}', 'perpage', 10);
        return true;
    }

}`;

  files[`${ctrl}/uninstall.php`] = `<?php

class uninstall${Name} extends cmsInstaller {

    public function uninstall() {
        $this->db->query("DROP TABLE IF EXISTS \`{$this->db->prefix}${name}_items\`");
        return true;
    }

}`;

  // ── actions/index.php ────────────────────────────────────────────────────────
  files[`${ctrl}/actions/index.php`] = `<?php

class action${Name}Index extends cmsAction {

    public function run() {

        $page    = $this->request->get('page', 1);
        $perpage = $this->options['perpage'] ?? 10;

        $total = $this->model->filterEqual('is_pub', 1)->getCount('${name}_items');

        $items = $this->model
            ->filterEqual('is_pub', 1)
            ->orderBy('date_pub', 'desc')
            ->limitPage($page, $perpage)
            ->get('${name}_items');

        $this->cms_template->setTitle(LANG_${NAME}_TITLE);

        // Шаблон: /templates/{theme}/controllers/${name}/index.tpl.php
        return $this->cms_template->render('index', [
            'items'   => $items,
            'total'   => $total,
            'page'    => (int) $page,
            'perpage' => (int) $perpage,
        ]);
    }

}`;

  // ── actions/view.php ─────────────────────────────────────────────────────────
  files[`${ctrl}/actions/view.php`] = `<?php

class action${Name}View extends cmsAction {

    public function run() {

        $id   = $this->request->get('id', 0);
        $item = $this->model->getItemByField('${name}_items', 'id', (int) $id);

        if (!$item || !$item['is_pub']) {
            return cmsCore::error404();
        }

        $item = cmsEventsManager::hook('${name}_before_item', $item);

        $this->cms_template->setTitle($item['title']);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to('${name}'));
        $this->cms_template->addBreadcrumb($item['title']);

        // Шаблон: /templates/{theme}/controllers/${name}/view.tpl.php
        return $this->cms_template->render('view', [
            'item' => $item,
        ]);
    }

}`;

  // ── routes.php — только для with_routes ─────────────────────────────────────
  if (opts.type === 'with_routes') {
    files[`${ctrl}/routes.php`] = generateRoutes(name);
  }

  // ── Языковой файл ────────────────────────────────────────────────────────────
  // ВАЖНО: файл расположен ВНЕ папки контроллера!
  files[`package/system/languages/ru/controllers/${name}/${name}.php`] = `<?php
// Файл: /system/languages/ru/controllers/${name}/${name}.php
// ВАЖНО: языковой файл расположен в /system/languages/, а НЕ внутри контроллера!

define('LANG_${NAME}_TITLE',     ${quotePhp(title)});
define('LANG_${NAME}_ADD',       'Добавить');
define('LANG_${NAME}_EDIT',      'Редактировать');
define('LANG_${NAME}_DELETE',    'Удалить');
define('LANG_${NAME}_NOT_FOUND', 'Ничего не найдено');

// Константы для бэкенда (рекомендуется префикс _CP_):
define('LANG_${NAME}_CP_TITLE',  '${title}');
define('LANG_${NAME}_CP_ITEMS',  'Элементы');
define('LANG_${NAME}_CP_ADD',    'Добавить элемент');`;

  // ── Хуки ────────────────────────────────────────────────────────────────────
  if (opts.hooks && opts.hooks.length > 0) {
    for (const hookName of opts.hooks) {
      const hookCamel = hookName
        .split('_')
        .map((w: string) => capitalize(w))
        .join('');
      files[`${ctrl}/hooks/${hookName}.php`] = `<?php
// Хук: ${hookName}
// Регистрация в manifest.xml: <hook controller="${name}" name="${hookName}" />

class on${Name}${hookCamel} extends cmsAction {

    /**
     * @param mixed $data Данные хука (тип зависит от конкретного хука)
     * @return mixed Для filter-хуков ОБЯЗАТЕЛЬНО вернуть $data
     */
    public function run($data) {

        // Доступны стандартные свойства:
        // $this->model     — модель дополнения ${name}
        // $this->cms_user  — текущий пользователь
        // $this->request   — объект запроса

        // Пример: загрузить другой контроллер:
        // $content = cmsCore::getController('content');

        // TODO: ваша логика

        return $data; // ОБЯЗАТЕЛЬНО вернуть $data для filter-хуков!
    }

}`;
    }
  }

  // ── Бэкенд (if with_admin) ───────────────────────────────────────────────────
  if (opts.type === 'with_admin') {
    // backend.php — только getBackendMenu() и before(), БЕЗ inline экшенов
    files[`${ctrl}/backend.php`] = generateBackend(name, Name, NAME);

    // backend/model.php — расширение модели для бэкенда
    files[`${ctrl}/backend/model.php`] = generateBackendModel(name, Name);

    // backend/actions/index.php — дашборд бэкенда
    files[`${ctrl}/backend/actions/index.php`] = generateBackendActionIndex(name, Name, NAME);

    // backend/actions/items.php — список с трейтом listgrid
    files[`${ctrl}/backend/actions/items.php`] = generateBackendActionItems(name, Name, NAME);

    // backend/actions/items_add.php — добавление/редактирование с трейтом formItem
    files[`${ctrl}/backend/actions/items_add.php`] = generateBackendActionItemsAdd(
      name,
      Name,
      NAME
    );

    // backend/grids/grid_items.php — ФУНКЦИЯ, не класс!
    files[`${ctrl}/backend/grids/grid_items.php`] = generateGridItems(name, Name, NAME);

    // backend/forms/form_item.php — форма с init($do)
    files[`${ctrl}/backend/forms/form_item.php`] = generateFormItem(Name, NAME);

    // backend/forms/form_options.php — настройки дополнения
    files[`${ctrl}/backend/forms/form_options.php`] = generateFormOptions(Name);
  }

  // ── Виджет (if with_widget) ──────────────────────────────────────────────────
  if (opts.type === 'with_widget') {
    files[`${ctrl}/widgets/list/widget.php`] = generateWidget(name, Name);
    files[`${ctrl}/widgets/list/options.form.php`] = generateWidgetOptionsForm(Name);
  }

  return {
    addon_name: name,
    addon_class: Name,
    type: opts.type,
    files_count: Object.keys(files).length,
    files,
    installation_note: `Пакет для менеджера дополнений: manifest.ru.ini + install.sql + package/ → архив ${name}.zip`,
    structure_notes: [
      `backend.php содержит ТОЛЬКО getBackendMenu() — экшены в backend/actions/`,
      `backend/grids/grid_items.php — ФУНКЦИЯ grid_items($controller), не класс`,
      `Языковой файл: /system/languages/ru/controllers/${name}/${name}.php (ВНЕ контроллера!)`,
      `Шаблоны фронтенда: /templates/{theme}/controllers/${name}/*.tpl.php`,
      `Шаблоны бэкенда: /templates/admincoreui/controllers/${name}/*.tpl.php`,
    ],
    next_steps: [
      `1. Упаковать в zip: manifest.ru.ini + install.sql + package/ → ${name}.zip`,
      `2. Установить: Панель управления → Расширения → Загрузить пакет`,
      `3. Создать шаблоны в /templates/default/controllers/${name}/index.tpl.php и view.tpl.php`,
      opts.type === 'with_admin'
        ? `4. Шаблоны бэкенда: /templates/admincoreui/controllers/${name}/index.tpl.php`
        : `4. При необходимости добавить виджеты в widgets/`,
    ],
  };
}

export function scaffoldTemplate(opts: { name: string; title: string; author?: string }): object {
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(opts.name)) {
    throw new Error(
      'Техническое имя шаблона должно начинаться с латинской буквы и содержать 2–64 допустимых символа'
    );
  }
  const name = opts.name;

  const files: Record<string, string> = {
    'manifest.php': `<?php
return [
    'title'  => ${quotePhp(opts.title)},
    'author' => [
        'name' => ${quotePhp(opts.author || 'Author')},
        'url'  => 'https://example.com',
        'help' => 'https://example.com/docs'
    ],
    'properties' => [
        'has_options'                => true,
        'has_profile_themes_support' => false,
        'has_profile_themes_options' => false,
        'is_dynamic_layout'          => false,
        'is_backend'                 => false,
        'is_frontend'                => true
    ]
];`,
    'main.tpl.php': `<!DOCTYPE html>
<html lang="<?= LANG_CODE ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $this->title() ?></title>
    <?= $this->head() ?>
    <?= $this->linkCSS('css/main.css') ?>
</head>
<body>

<header class="site-header">
    <?= $this->widgets('header') ?>
    <?= $this->widgets('top') ?>
</header>

<?= $this->breadcrumbs() ?>

<div class="site-wrap">
    <?php if ($this->hasWidgetsOn('left-top') || $this->hasWidgetsOn('left-bottom')): ?>
    <aside class="sidebar sidebar-left">
        <?= $this->widgets('left-top') ?>
        <?= $this->widgets('left-bottom') ?>
    </aside>
    <?php endif ?>

    <main class="site-main">
        <?= $this->body() ?>
    </main>

    <?php if ($this->hasWidgetsOn('right-top')): ?>
    <aside class="sidebar sidebar-right">
        <?= $this->widgets('right-top') ?>
        <?= $this->widgets('right-center') ?>
        <?= $this->widgets('right-bottom') ?>
    </aside>
    <?php endif ?>
</div>

<footer class="site-footer">
    <?= $this->widgets('footer') ?>
</footer>

<?= $this->bottom() ?>
</body>
</html>`,
    'css/main.css': `/* ${opts.title} */
:root {
    --color-primary: #4a90d9;
    --color-text: #333;
    --color-bg: #fff;
    --color-border: #e0e0e0;
}

* { box-sizing: border-box; }
body { font-family: sans-serif; color: var(--color-text); background: var(--color-bg); margin: 0; }
.site-wrap { display: flex; max-width: 1200px; margin: 0 auto; padding: 0 16px; gap: 24px; }
.site-main { flex: 1; min-width: 0; }
.sidebar { width: 240px; flex-shrink: 0; }`,
  };

  return {
    template_name: name,
    files,
    placement: `/templates/${name}/`,
    structure_notes: [
      `Шаблон размещается в /templates/${name}/ (НЕ в /system/templates/)`,
      `Для переопределения шаблонов контроллеров: controllers/{controller}/{action}.tpl.php`,
      `Для бэкенда используется шаблон admincoreui (не фронтенд-шаблон)`,
      `Переменные в .tpl.php: $this->title(), $this->body(), $this->widgets('position'), $this->breadcrumbs()`,
      `Проверка виджетов: $this->hasWidgetsOn('right-top')`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// backend.php — ТОЛЬКО getBackendMenu() + before(), без inline экшенов
function generateBackend(name: string, Name: string, NAME: string): string {
  return `<?php
/**
 * @property \\modelBackend${Name} $model
 */
class backend${Name} extends cmsBackend {

    // true = автоматически создать экшен 'options' для формы настроек
    public $useDefaultOptionsAction = true;

    // Загружать настройки дополнения
    protected $useOptions = true;

    public function __construct(cmsRequest $request) {
        parent::__construct($request);
        // Передать настройки в модель (если модели нужны опции):
        // $this->model->setControllerOptions($this->options);
    }

    // Вызывается перед каждым экшеном бэкенда
    public function before($action_name) {
        if (!parent::before($action_name)) {
            return false;
        }
        return true;
    }

    // Меню левой панели бэкенда
    public function getBackendMenu() {
        return [
            [
                'title'   => LANG_${NAME}_CP_ITEMS,
                'url'     => href_to($this->root_url, 'items'),
                'options' => ['icon' => 'list']
            ],
            [
                'title'   => LANG_OPTIONS,
                'url'     => href_to($this->root_url, 'options'),
                'options' => ['icon' => 'cog']
            ]
        ];
    }

}`;
}

// backend/model.php — расширение модели для бэкенда
function generateBackendModel(name: string, Name: string): string {
  return `<?php
/**
 * Расширение модели для нужд бэкенда.
 * Добавляет JOIN-ы, агрегации и методы для бэкенд-экшенов.
 */
class modelBackend${Name} extends model${Name} {

    // Статистика для дашборда
    public function getStats(): array {
        return [
            'total'     => $this->getCount('${name}_items'),
            'published' => $this->filterEqual('is_pub', 1)->getCount('${name}_items'),
        ];
    }

}`;
}

// backend/actions/index.php — дашборд
function generateBackendActionIndex(name: string, Name: string, _NAME: string): string {
  return `<?php
/**
 * Дашборд бэкенда.
 * URL: /admin/${name}/ или /admin/${name}/index
 *
 * @property \\modelBackend${Name} $model
 */
class action${Name}Index extends cmsAction {

    public function run($do = false) {

        // Делегация вложенным экшенам: /admin/${name}/index/something
        if ($do) {
            return $this->runAction('index_' . $do, array_slice($this->params, 1));
        }

        $stats = $this->model->getStats();

        // Шаблон: /templates/admincoreui/controllers/${name}/index.tpl.php
        return $this->cms_template->render([
            'stats' => $stats,
        ]);
    }

}`;
}

// backend/actions/items.php — список с трейтом listgrid
function generateBackendActionItems(name: string, Name: string, NAME: string): string {
  return `<?php
/**
 * Список элементов в бэкенде.
 * Использует trait listgrid — не нужен метод run(), настройка через __construct().
 * URL: /admin/${name}/items
 */
class action${Name}Items extends cmsAction {

    use icms\\traits\\controllers\\actions\\listgrid;

    public function __construct($controller, $params = []) {

        parent::__construct($controller, $params);

        // ОБЯЗАТЕЛЬНО: таблица и грид
        $this->table_name = '${name}_items';
        $this->grid_name  = 'items';             // файл: backend/grids/grid_items.php
        $this->title      = LANG_${NAME}_CP_ITEMS;

        // Кнопка "Добавить" в тулбаре
        $this->tool_buttons = [
            [
                'class' => 'add',
                'title' => LANG_${NAME}_CP_ADD,
                'href'  => $this->cms_template->href_to('items', 'add')
            ]
        ];

        // Делегировать подэкшены: items/add, items/edit, items/delete
        $this->external_action_prefix = 'items_';

        // Дополнительные JOIN-ы к запросу:
        // $this->list_callback = function (\\cmsModel $model) {
        //     return $model->joinLeft('users u', 'u.id = t.user_id', ['u.nickname as user_nickname']);
        // };

        // Постобработка данных:
        // $this->items_callback = function ($items) { return $items; };
    }

}`;
}

// backend/actions/items_add.php — добавление/редактирование с трейтом formItem
function generateBackendActionItemsAdd(name: string, Name: string, NAME: string): string {
  return `<?php
/**
 * Добавление / редактирование элемента в бэкенде.
 * Trait formItem обрабатывает и 'add' (items/add) и 'edit' (items/edit/ID) — один файл!
 * URL add:  /admin/${name}/items/add
 * URL edit: /admin/${name}/items/edit/{id}
 * URL copy: /admin/${name}/items/add/{id}/1
 */
class action${Name}ItemsAdd extends cmsAction {

    use icms\\traits\\controllers\\actions\\formItem;

    public function __construct($controller, $params = []) {

        parent::__construct($controller, $params);

        $list_url = $this->cms_template->href_to('items');

        // ОБЯЗАТЕЛЬНО:
        $this->table_name  = '${name}_items';
        $this->form_name   = 'item';             // файл: backend/forms/form_item.php
        $this->success_url = $list_url;

        // Заголовок страницы:
        $this->title = [
            'add'  => LANG_${NAME}_CP_ADD,
            'edit' => '{title}'   // {title} заменяется значением поля title записи
        ];

        // Хлебные крошки:
        $this->breadcrumbs = [
            [LANG_${NAME}_CP_ITEMS, $list_url],
            isset($params[0]) ? '{title}' : LANG_${NAME}_CP_ADD
        ];

        // Кнопки Сохранить / Отменить в тулбаре:
        $this->use_default_tool_buttons = true;

        // Дефолтные значения для новой записи:
        $this->default_item = [
            'is_pub'   => 1,
            'date_pub' => date('Y-m-d H:i:s')
        ];

        // Коллбэки после сохранения:
        // $this->add_callback = function($id, $data) {
        //     cmsCache::getInstance()->clean('${name}');
        // };
        // $this->update_callback = function($data) {
        //     cmsCache::getInstance()->clean('${name}');
        // };
    }

}`;
}

// backend/grids/grid_items.php — ФУНКЦИЯ, не класс!
function generateGridItems(name: string, _Name: string, _NAME: string): string {
  return `<?php
// ВАЖНО: грид — это ФУНКЦИЯ, а не класс!
// Имя функции = grid_ + значение $this->grid_name из экшена

function grid_items($controller) {

    $options = [
        'is_sortable'   => true,
        'is_filter'     => true,
        'is_pagination' => true,
        'is_draggable'  => false,
        'is_selectable' => false,
        'order_by'      => 'id',
        'order_to'      => 'desc',
        'show_id'       => true
        // Для drag&drop:
        // 'is_draggable'  => true,
        // 'drag_save_url' => href_to('admin', 'reorder', '${name}_items'),
    ];

    $columns = [
        'title' => [
            'title'   => LANG_TITLE,
            'filter'  => 'like',
            'href'    => href_to($controller->root_url, 'items', ['edit', '{id}'])
        ],
        'date_pub' => [
            'title'   => LANG_DATE_PUB,
            'width'   => 150,
            'filter'  => 'date',
            'handler' => function ($value) {
                return html_date_time($value);
            }
        ],
        'is_pub' => [
            'title'       => LANG_IS_PUB,
            'width'       => 60,
            'flag'        => true,
            'flag_toggle' => href_to($controller->root_url, 'toggle_item', ['{id}', '${name}_items', 'is_pub'])
        ]
    ];

    $actions = [
        [
            'title' => LANG_EDIT,
            'icon'  => 'pen',
            'href'  => href_to($controller->root_url, 'items', ['edit', '{id}'])
        ],
        [
            'title'   => LANG_DELETE,
            'class'   => 'text-danger',
            'icon'    => 'times-circle',
            'confirm' => LANG_DELETE_CONFIRM,
            'href'    => href_to($controller->root_url, 'items', ['delete', '{id}'])
        ]
    ];

    return [
        'options' => $options,
        'columns' => $columns,
        'actions' => $actions
    ];
}`;
}

// backend/forms/form_item.php
function generateFormItem(Name: string, _NAME: string): string {
  return `<?php

class form${Name}Item extends cmsForm {

    // $do = 'add' или 'edit' (передаётся из trait formItem)
    public function init($do) {

        return [
            'basic' => [
                'title'  => LANG_CP_BASIC,
                'type'   => 'fieldset',
                'childs' => [
                    new fieldString('title', [
                        'title' => LANG_TITLE,
                        'rules' => [['required'], ['max_length', 255]]
                    ]),
                    new fieldHtml('text', [
                        'title' => LANG_TEXT
                    ]),
                    new fieldDate('date_pub', [
                        'title'   => LANG_DATE_PUB,
                        'default' => date('Y-m-d H:i:s')
                    ]),
                    new fieldCheckbox('is_pub', [
                        'title'   => LANG_IS_PUB,
                        'default' => 1
                    ])
                ]
            ]
        ];
    }

}`;
}

// backend/forms/form_options.php
function generateFormOptions(Name: string): string {
  return `<?php

class form${Name}Options extends cmsForm {

    public function init() {
        return [
            'basic' => [
                'title'  => LANG_CP_BASIC,
                'type'   => 'fieldset',
                'childs' => [
                    new fieldNumber('perpage', [
                        'title'   => LANG_LIST_LIMIT,
                        'default' => 10,
                        'rules'   => [['required'], ['min', 1]]
                    ]),
                    new fieldCheckbox('use_moderation', [
                        'title' => LANG_USE_MODERATION
                    ])
                ]
            ]
        ];
    }

}`;
}

// widgets/list/widget.php
function generateWidget(name: string, Name: string): string {
  return `<?php
/**
 * Виджет списка элементов.
 * Шаблон: /templates/{theme}/controllers/${name}/list.tpl.php
 */
class widget${Name}List extends cmsWidget {

    // Отключить кэш для динамического контента:
    // public $is_cacheable = false;

    public function run() {

        $limit = $this->getOption('limit', 5);

        $controller = cmsCore::getController('${name}');

        $items = $controller->model
            ->filterEqual('is_pub', 1)
            ->orderBy('date_pub', 'desc')
            ->limit($limit)
            ->get('${name}_items');

        if (!$items) {
            return false;
        }

        return [
            'items' => cmsEventsManager::hook('${name}_before_list', $items),
            'limit' => $limit
        ];
    }

}`;
}

// widgets/list/options.form.php
// Класс: formWidget{Name}ListOptions (не formWidget{Name}List!)
function generateWidgetOptionsForm(Name: string): string {
  return `<?php
// Класс опций виджета: formWidget + PascalCase(controller) + PascalCase(widget) + Options

class formWidget${Name}ListOptions extends cmsForm {

    public function init($options = false) {
        return [
            'woptions' => [
                'type'   => 'fieldset',
                'title'  => LANG_OPTIONS,
                'childs' => [
                    new fieldNumber('options:limit', [
                        'title'   => LANG_LIST_LIMIT,
                        'default' => 5,
                        'options' => ['is_abs' => true]
                    ]),
                    new fieldList('options:is_pub', [
                        'title'   => LANG_SHOW,
                        'default' => 1,
                        'items'   => [1 => LANG_PUBLISHED_ONLY, 0 => LANG_ALL]
                    ])
                ]
            ]
        ];
    }

}`;
}

// routes.php
function generateRoutes(name: string): string {
  return `<?php

function routes_${name}() {

    return [
        // /myaddon/item-slug.html → action view
        [
            'pattern' => '/^([a-z0-9\\-_]+)\\.html$/i',
            'action'  => 'view',
            1         => 'slug'
        ],
        // /myaddon/page/2 → action index с page
        [
            'pattern' => '/^page\\/(\\d+)$/i',
            'action'  => 'index',
            1         => 'page'
        ],
        // /myaddon/ (главная)
        [
            'pattern' => '/^$/',
            'action'  => 'index'
        ]
    ];

}`;
}
