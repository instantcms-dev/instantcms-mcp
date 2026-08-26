// Структуры файлов дополнений и шаблонов InstantCMS

export interface FileSpec {
  path: string;
  required: boolean;
  description: string;
  template?: string;
}

export interface AddonStructure {
  type: string;
  description: string;
  files: FileSpec[];
  notes?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ПОЛНАЯ СТРУКТУРА ПАПКИ КОНТРОЛЛЕРА
// /system/controllers/{name}/
// ─────────────────────────────────────────────────────────────────────────────
export const controllerDirectoryLayout = `
ПОЛНАЯ СТРУКТУРА ПАПКИ КОНТРОЛЛЕРА
===================================
/system/controllers/{name}/
├── frontend.php                     ← class {name} extends cmsFrontend
├── backend.php                      ← class backend{Name} extends cmsBackend
├── model.php                        ← class model{Name} extends cmsModel
├── manifest.xml                     ← метаданные, хуки, зависимости
├── install.php                      ← class install{Name} extends cmsInstaller
├── uninstall.php                    ← class uninstall{Name} extends cmsInstaller
├── routes.php                       ← function routes_{name}() { return [...] }
├── compatibility.php                ← trait для обратной совместимости (опц.)
│
├── actions/                         ← ФРОНТЕНД экшены
│   ├── index.php                    ← class action{Name}Index extends cmsAction
│   ├── view.php                     ← class action{Name}View extends cmsAction
│   └── ...                          ← один файл = один экшен
│
├── backend/                         ← БЭКЕНД компоненты
│   ├── model.php                    ← class modelBackend{Name} extends model{Name}
│   ├── actions/                     ← БЭКЕНД экшены (отдельные файлы)
│   │   ├── index.php                ← class actionBillingIndex extends cmsAction { run() }
│   │   ├── items.php                ← использует trait listgrid
│   │   ├── items_add.php            ← использует trait formItem
│   │   └── ...
│   ├── forms/                       ← ФОРМЫ для бэкенда
│   │   ├── form_item.php            ← class form{Name}Item extends cmsForm
│   │   ├── form_options.php         ← class form{Name}Options extends cmsForm
│   │   └── ...
│   └── grids/                       ← ГРИДЫ для списков в бэкенде
│       ├── grid_items.php           ← function grid_items($controller) { return [...] }
│       └── ...                      ← ФУНКЦИИ, не классы!
│
├── hooks/                           ← ХУКИ
│   ├── content_after_add_approve.php ← class on{Name}ContentAfterAddApprove extends cmsAction
│   └── ...                          ← имя файла = имя хука
│
├── widgets/                         ← ВИДЖЕТЫ для публичных страниц
│   └── {widget_name}/
│       ├── widget.php               ← class widget{Name}{WidgetName} extends cmsWidget
│       └── options.form.php         ← class formWidget{Name}{WidgetName}Options extends cmsForm
│
└── traits/                          ← ТРЕЙТЫ (опционально)
    └── validation.php

ЯЗЫКОВЫЕ ФАЙЛЫ (ВНЕ папки контроллера!):
/system/languages/ru/controllers/{name}/{name}.php
/system/languages/en/controllers/{name}/{name}.php

ШАБЛОНЫ (в папке frontend-темы, НЕ в контроллере!):
/templates/{theme_name}/controllers/{name}/{action}.tpl.php           ← фронтенд-экшен
/templates/{theme_name}/controllers/{name}/backend/{action}.tpl.php  ← бэкенд-экшен (подпапка backend/)
/templates/{theme_name}/controllers/{name}/widgets/{w}/{w}.tpl.php   ← виджет контроллера

ВАЖНО: бэкенд-шаблоны ВСЕГДА в папке frontend-темы (modern/), НЕ в admincoreui/
        admincoreui/ предоставляет ТОЛЬКО layout-оболочку (navbar/sidebar через admin.tpl.php)

ПАКЕТ ДЛЯ УСТАНОВКИ ЧЕРЕЗ МЕНЕДЖЕР ДОПОЛНЕНИЙ:
{name}.zip
├── manifest.ru.ini                  ← метаданные пакета
├── install.sql                      ← SQL для создания таблиц
└── package/
    └── system/
        ├── controllers/{name}/      ← все файлы контроллера
        └── languages/ru/controllers/{name}/{name}.php
`;

// ─────────────────────────────────────────────────────────────────────────────
// ИМЕНОВАНИЕ КЛАССОВ — КРИТИЧЕСКИ ВАЖНО
// ─────────────────────────────────────────────────────────────────────────────
export const classNamingConventions = `
ПРАВИЛА ИМЕНОВАНИЯ КЛАССОВ
===========================
frontend.php:      class {name} extends cmsFrontend
backend.php:       class backend{Name} extends cmsBackend
model.php:         class model{Name} extends cmsModel
backend/model.php: class modelBackend{Name} extends model{Name}

Фронтенд экшены (actions/*.php):
  actions/index.php → class action{Name}Index extends cmsAction
  actions/view.php  → class action{Name}View extends cmsAction
  Формат: action + PascalCase(controller) + PascalCase(action_name)

Бэкенд экшены (backend/actions/*.php):
  backend/actions/items.php     → class action{Name}Items extends cmsAction { use listgrid; }
  backend/actions/items_add.php → class action{Name}ItemsAdd extends cmsAction { use formItem; }
  Формат: action + PascalCase(controller) + PascalCase(action_name)

Формы (backend/forms/*.php):
  backend/forms/form_item.php    → class form{Name}Item extends cmsForm
  backend/forms/form_options.php → class form{Name}Options extends cmsForm

Гриды (backend/grids/*.php):
  backend/grids/grid_items.php  → function grid_items($controller, $model=null) { return [...] }
  ВАЖНО: Гриды — это ФУНКЦИИ, не классы!

Хуки (hooks/*.php):
  hooks/content_after_add_approve.php → class on{Name}ContentAfterAddApprove extends cmsAction
  Формат: on + PascalCase(controller) + PascalCase(hook_name)

Виджеты (widgets/{widget_name}/widget.php):
  → class widget{Name}{WidgetName} extends cmsWidget
  Пример: class widgetBillingPlans extends cmsWidget

Формы опций виджетов (widgets/{widget_name}/options.form.php):
  → class formWidget{Name}{WidgetName}Options extends cmsForm

Установщик:
  install.php   → class install{Name} extends cmsInstaller
  uninstall.php → class uninstall{Name} extends cmsInstaller

Примеры для addon name = "catalog":
  frontend.php → class catalog extends cmsFrontend
  backend.php  → class backendCatalog extends cmsBackend
  model.php    → class modelCatalog extends cmsModel
  backend/actions/items.php     → class actionCatalogItems extends cmsAction
  backend/actions/items_add.php → class actionCatalogItemsAdd extends cmsAction
  backend/forms/form_item.php   → class formCatalogItem extends cmsForm
  backend/grids/grid_items.php  → function grid_items($controller) { return [...] }
  hooks/user_registered.php     → class onCatalogUserRegistered extends cmsAction
  widgets/list/widget.php       → class widgetCatalogList extends cmsWidget
`;

export const addonStructures: Record<string, AddonStructure> = {
  basic: {
    type: "basic",
    description: "Минимальное дополнение — только фронтенд без админ-панели",
    notes: [
      "Языковой файл расположен ВНЕ папки контроллера: /system/languages/ru/controllers/{name}/{name}.php",
      "Шаблоны расположены в /templates/{theme}/controllers/{name}/{action}.tpl.php",
      "Экшены — отдельные файлы в actions/*.php, один файл = один экшен",
      "frontend.php использует route() + runAction(), не содержит встроенных методов-экшенов"
    ],
    files: [
      {
        path: "frontend.php",
        required: true,
        description: "Основной контроллер фронтенда. Наследует cmsFrontend. Содержит только route() + бизнес-логику. Экшены вынесены в отдельные файлы actions/*.php.",
        template: `<?php
/**
 * @property \\model{Name} $model
 */
class {name} extends cmsFrontend {

    protected $useOptions = true;

    // route() вызывается системой для каждого запроса
    // parseRoute() разбирает URI и определяет экшен
    // runAction() запускает найденный экшен из actions/{action}.php

}`
      },
      {
        path: "actions/index.php",
        required: true,
        description: "Экшен главной страницы. Имя класса: action{Name}Index. Все экшены наследуют cmsAction и имеют метод run().",
        template: `<?php

class action{Name}Index extends cmsAction {

    public function run() {

        $page    = $this->request->get('page', 1);
        $perpage = $this->options['perpage'] ?? 10;

        // $this->model — модель текущего дополнения
        // $this->options — настройки дополнения
        // $this->cms_user — текущий пользователь
        // $this->cms_template — объект шаблона

        $items = $this->model
            ->filterEqual('is_pub', 1)
            ->orderBy('date_pub', 'desc')
            ->limit(($page - 1) * $perpage, $perpage)
            ->get('{name}_items');

        $total = $this->model->getCount('{name}_items');

        // render() ищет шаблон в /templates/{theme}/controllers/{name}/index.tpl.php
        return $this->cms_template->render([
            'items'   => $items,
            'total'   => $total,
            'page'    => $page,
            'perpage' => $perpage
        ]);
    }

}`
      },
      {
        path: "actions/view.php",
        required: false,
        description: "Экшен просмотра одного элемента",
        template: `<?php

class action{Name}View extends cmsAction {

    public function run($id = 0) {

        $item = $this->model->getItemById('{name}_items', $id);
        if (!$item) {
            return cmsCore::error404();
        }

        $this->cms_template->setTitle($item['title']);
        $this->cms_template->addBreadcrumb(LANG_{NAME}_TITLE, href_to('{name}'));
        $this->cms_template->addBreadcrumb($item['title']);

        return $this->cms_template->render([
            'item' => $item
        ]);
    }

}`
      },
      {
        path: "model.php",
        required: true,
        description: "Модель базы данных. Наследует cmsModel. Содержит специфичные запросы для контроллера.",
        template: `<?php

class model{Name} extends cmsModel {

    // Фильтры применяются цепочкой (Fluent Interface)
    // get() выполняет запрос и возвращает массив записей
    // getItem() возвращает одну запись
    // getCount() возвращает количество записей

    public function getPublished($limit = 10) {
        return $this->filterEqual('is_pub', 1)
                    ->orderBy('date_pub', 'desc')
                    ->limit($limit)
                    ->get('{name}_items');
    }

    public function getItemById($table, $id) {
        return $this->filterEqual('id', $id)
                    ->getItem($table);
    }

}`
      },
      {
        path: "[ВНЕШНИЙ] system/languages/ru/controllers/{name}/{name}.php",
        required: true,
        description: "Языковой файл. ВАЖНО: находится ВНЕ папки контроллера, в /system/languages/{lang}/controllers/{name}/",
        template: `<?php
// Файл: /system/languages/ru/controllers/{name}/{name}.php
// ВАЖНО: файл расположен в /system/languages/, а НЕ в /system/controllers/!

define('LANG_{NAME}_TITLE',     'Моё дополнение');
define('LANG_{NAME}_ADD',       'Добавить');
define('LANG_{NAME}_EDIT',      'Редактировать');
define('LANG_{NAME}_DELETE',    'Удалить');
define('LANG_{NAME}_NOT_FOUND', 'Ничего не найдено');

// Константы для бэкенда (префикс _CP_)
define('LANG_{NAME}_CP_TITLE',  'Моё дополнение');
define('LANG_{NAME}_CP_ITEMS',  'Элементы');
define('LANG_{NAME}_CP_ADD',    'Добавить элемент');`
      },
      {
        path: "manifest.xml",
        required: true,
        description: "Метаданные дополнения: название, версия, зависимости, хуки",
        template: `<?xml version="1.0" encoding="utf-8"?>
<addon>
    <name>{name}</name>
    <title>{Title}</title>
    <description>Описание дополнения</description>
    <version>1.0.0</version>
    <build>1</build>
    <author>
        <name>Author Name</name>
        <url>https://example.com</url>
        <email>author@example.com</email>
    </author>
    <dependencies>
        <!-- <controller name="content" /> -->
    </dependencies>
    <hooks>
        <!-- Регистрация хуков: -->
        <!-- <hook controller="{name}" name="content_after_add_approve" /> -->
    </hooks>
</addon>`
      },
      {
        path: "install.php",
        required: true,
        description: "Скрипт установки. Создаёт таблицы БД через $this->db->query().",
        template: `<?php

class install{Name} extends cmsInstaller {

    public function install() {

        $this->db->query("CREATE TABLE IF NOT EXISTS \`{prefix}{name}_items\` (
            \`id\`       int(10) unsigned NOT NULL AUTO_INCREMENT,
            \`user_id\`  int(10) unsigned NOT NULL DEFAULT '0',
            \`title\`    varchar(255) NOT NULL DEFAULT '',
            \`text\`     text,
            \`date_pub\` datetime NOT NULL,
            \`is_pub\`   tinyint(1) unsigned NOT NULL DEFAULT '1',
            PRIMARY KEY (\`id\`),
            KEY \`user_id\` (\`user_id\`),
            KEY \`is_pub\` (\`is_pub\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        return true;
    }

}`
      },
      {
        path: "uninstall.php",
        required: true,
        description: "Скрипт удаления. Удаляет таблицы и данные.",
        template: `<?php

class uninstall{Name} extends cmsInstaller {

    public function uninstall() {
        $this->db->query("DROP TABLE IF EXISTS \`{prefix}{name}_items\`");
        return true;
    }

}`
      }
    ]
  },

  with_admin: {
    type: "with_admin",
    description: "Дополнение с полноценной админ-панелью: backend.php + backend/actions/ + backend/grids/ + backend/forms/",
    notes: [
      "backend.php содержит getBackendMenu() и before() — НЕ содержит методы-экшены",
      "Каждый бэкенд экшен — отдельный файл в backend/actions/",
      "Списки используют trait listgrid: table_name + grid_name + tool_buttons в __construct()",
      "Формы используют trait formItem: table_name + form_name + success_url в __construct()",
      "Гриды — ФУНКЦИИ (не классы): function grid_{name}($controller) { return ['options'=>..., 'columns'=>..., 'actions'=>...] }",
      "Формы для бэкенда — КЛАССЫ: class form{Name}Item extends cmsForm { public function init($do, ...) {...} }"
    ],
    files: [
      {
        path: "frontend.php",
        required: true,
        description: "Фронтенд контроллер (см. basic)",
        template: `// Аналогично basic, см. выше`
      },
      {
        path: "backend.php",
        required: true,
        description: "Контроллер бэкенда. Содержит getBackendMenu(), before(), опции. НЕ содержит inline экшены — они в backend/actions/.",
        template: `<?php
/**
 * @property \\modelBackend{Name} $model
 */
class backend{Name} extends cmsBackend {

    // Автоматически генерирует экшен 'options' для формы настроек
    public $useDefaultOptionsAction = true;

    // Загружать настройки дополнения
    protected $useOptions = true;

    public function __construct(cmsRequest $request) {
        parent::__construct($request);
        // Передать настройки в модель, если нужно:
        // $this->model->setControllerOptions($this->options);
    }

    // Вызывается перед каждым экшеном бэкенда
    public function before($action_name) {
        if (!parent::before($action_name)) {
            return false;
        }
        // Дополнительные проверки доступа
        return true;
    }

    // Меню в левой панели бэкенда
    public function getBackendMenu() {
        return [
            [
                'title'   => LANG_{NAME}_CP_ITEMS,
                'url'     => href_to($this->root_url, 'items'),
                'options' => ['icon' => 'list']
            ],
            [
                'title'   => LANG_OPTIONS,
                'url'     => href_to($this->root_url, 'options'),
                'options' => ['icon' => 'cog']
            ],
            // Пункт с счётчиком (pending items):
            // [
            //     'title'   => LANG_{NAME}_CP_PENDING,
            //     'counter' => $this->model->getPendingCount(),
            //     'url'     => href_to($this->root_url, 'pending'),
            //     'options' => ['icon' => 'clock']
            // ],
            // Пункт с подменю (childs_count = количество дочерних):
            // [
            //     'title'        => LANG_{NAME}_CP_PRICES,
            //     'url'          => href_to($this->root_url, 'prices'),
            //     'childs_count' => 3,
            //     'options'      => ['icon' => 'money-bill']
            // ],
            // [
            //     'title' => LANG_{NAME}_CP_PRICES_BASIC,
            //     'level' => 2,
            //     'url'   => href_to($this->root_url, 'prices', 'basic')
            // ],
        ];
    }

}`
      },
      {
        path: "backend/model.php",
        required: false,
        description: "Расширение модели для бэкенда. Добавляет JOIN-ы и агрегации для отображения в гридах.",
        template: `<?php
/**
 * Расширение модели для нужд бэкенда
 */
class modelBackend{Name} extends model{Name} {

    // Статистика для дашборда бэкенда
    public function getStats() {
        return [
            'total'    => $this->getCount('{name}_items'),
            'published' => $this->filterEqual('is_pub', 1)->getCount('{name}_items'),
        ];
    }

    // Список с дополнительными полями (JOIN с users)
    public function getItemsWithUsers() {
        return $this->joinLeft('users u', 'u.id = t.user_id', ['u.nickname as user_nickname'])
                    ->get('{name}_items');
    }

}`
      },
      {
        path: "backend/actions/items.php",
        required: true,
        description: "Бэкенд экшен — список элементов. Использует trait listgrid. Вся логика через свойства в __construct().",
        template: `<?php

class action{Name}Items extends cmsAction {

    use icms\\traits\\controllers\\actions\\listgrid;

    public function __construct($controller, $params = []) {

        parent::__construct($controller, $params);

        // Обязательные свойства трейта listgrid:
        $this->table_name = '{name}_items';
        $this->grid_name  = 'items';            // соответствует backend/grids/grid_items.php
        $this->title      = LANG_{NAME}_CP_ITEMS;

        // Кнопка "Добавить" в тулбаре
        $this->tool_buttons = [
            [
                'class' => 'add',
                'title' => LANG_{NAME}_CP_ADD,
                'href'  => $this->cms_template->href_to('items', 'add')
            ]
        ];

        // Дополнительная обработка модели (JOIN-ы, фильтры):
        $this->list_callback = function (\\cmsModel $model) {
            return $model->joinLeft('users u', 'u.id = t.user_id', ['u.nickname as user_nickname']);
        };

        // Обработка после получения данных:
        // $this->items_callback = function ($items) { return $items; };

        // Префикс для вложенных экшенов (items_add → prefix 'items_')
        $this->external_action_prefix = 'items_';
    }

}`
      },
      {
        path: "backend/actions/items_add.php",
        required: true,
        description: "Бэкенд экшен — добавление/редактирование. Использует trait formItem. Обрабатывает и add, и edit через один файл.",
        template: `<?php

class action{Name}ItemsAdd extends cmsAction {

    use icms\\traits\\controllers\\actions\\formItem;

    public function __construct($controller, $params = []) {

        parent::__construct($controller, $params);

        $list_url = $this->cms_template->href_to('items');

        // Обязательные свойства трейта formItem:
        $this->table_name = '{name}_items';
        $this->form_name  = 'item';             // соответствует backend/forms/form_item.php
        $this->success_url = $list_url;

        // Заголовок: строка или массив ['add' => '...', 'edit' => '{title}']
        $this->title = [
            'add'  => LANG_{NAME}_CP_ADD,
            'edit' => '{title}'             // {title} заменяется значением поля title записи
        ];

        // Хлебные крошки
        $this->breadcrumbs = [
            [LANG_{NAME}_CP_ITEMS, $list_url],
            isset($params[0]) ? '{title}' : LANG_{NAME}_CP_ADD
        ];

        // Показать стандартные кнопки Сохранить/Отменить
        $this->use_default_tool_buttons = true;

        // Значения по умолчанию для новой записи:
        // $this->default_item = ['is_pub' => 1];

        // Коллбэк после добавления: function($id, $data) {...}
        // $this->add_callback = function($id, $data) { ... };

        // Коллбэк после обновления: function($data) {...}
        // $this->update_callback = function($data) { ... };
    }

}`
      },
      {
        path: "backend/actions/index.php",
        required: false,
        description: "Дашборд бэкенда (главная страница раздела). Кастомный экшен без трейтов.",
        template: `<?php
/**
 * @property \\modelBackend{Name} $model
 */
class action{Name}Index extends cmsAction {

    public function run($do = false) {

        // Передача на вложенный экшен: /admin/{name}/index/something
        if ($do) {
            return $this->runAction('index_' . $do, array_slice($this->params, 1));
        }

        $stats = $this->model->getStats();

        // cms_template->render() ищет шаблон:
        //   /templates/{frontend-theme}/controllers/{name}/backend/index.tpl.php
        // или системный:
        //   /system/controllers/{name}/templates/index.tpl.php
        return $this->cms_template->render([
            'stats' => $stats,
        ]);
    }

}`
      },
      {
        path: "backend/grids/grid_items.php",
        required: true,
        description: "Определение грида для списка. ФУНКЦИЯ, не класс. Возвращает массив с options, columns, actions.",
        template: `<?php
// ВАЖНО: грид — это ФУНКЦИЯ, не класс!
// Имя функции = grid_ + имя грида (то, что указано в $this->grid_name)

function grid_items($controller) {

    $options = [
        'is_sortable'   => true,   // Сортировка по столбцам
        'is_filter'     => true,   // Панель фильтров
        'is_pagination' => true,   // Пагинация
        'is_draggable'  => false,  // Перетаскивание строк (для ordering)
        'is_selectable' => false,  // Чекбоксы для массовых операций
        'order_by'      => 'id',   // Поле сортировки по умолчанию
        'order_to'      => 'desc', // Направление (asc/desc)
        'show_id'       => true    // Показать колонку ID
        // 'drag_save_url' => href_to('admin', 'reorder', '{name}_items'),
    ];

    $columns = [
        // Простая колонка
        'id' => [
            'title' => 'ID',
            'width' => 60
        ],
        // Колонка со ссылкой на редактирование
        'title' => [
            'title'    => LANG_TITLE,
            'href'     => href_to($controller->root_url, 'items', ['edit', '{id}']),
            'order_by' => 't.title',    // для JOIN-ов указывайте алиас таблицы
            'filter'   => 'like'        // текстовый поиск
        ],
        // Колонка с JOIN-ом (user_nickname из LEFT JOIN users)
        'user_nickname' => [
            'title'     => LANG_USER,
            'width'     => 150,
            'href'      => href_to('users', '{user_id}'),
            'order_by'  => 'u.nickname',
            'filter'    => 'like',
            'filter_by' => 'u.nickname'
        ],
        // Дата с форматированием
        'date_pub' => [
            'title'   => LANG_DATE_PUB,
            'width'   => 150,
            'filter'  => 'date',
            'handler' => function ($value) {
                return html_date_time($value);
            }
        ],
        // Флаг с переключателем inline
        'is_pub' => [
            'title'       => LANG_IS_PUB,
            'width'       => 60,
            'flag'        => true,
            'flag_toggle' => href_to($controller->root_url, 'toggle_item', ['{id}', '{name}_items', 'is_pub'])
        ],
        // Выбор из списка с фильтром
        'status' => [
            'title'  => LANG_STATUS,
            'width'  => 100,
            'filter' => 'exact',
            'filter_select' => [
                'items' => function($name) {
                    return ['' => LANG_ALL, 0 => LANG_INACTIVE, 1 => LANG_ACTIVE];
                }
            ],
            'handler' => function ($value, $row) {
                return $value ? '<span class="text-success">'.LANG_ACTIVE.'</span>'
                              : '<span class="text-muted">'.LANG_INACTIVE.'</span>';
            }
        ],
        // Числовой диапазон фильтра
        'amount' => [
            'title'  => LANG_AMOUNT,
            'filter' => 'range'
        ],
        // Кастомный обработчик для подсветки строки
        'priority' => [
            'title'         => LANG_PRIORITY,
            'class_handler' => function($row) {
                if ($row['priority'] > 5) { return 'bg-warning'; }
            }
        ]
    ];

    $actions = [
        // Кнопка редактирования
        [
            'title' => LANG_EDIT,
            'icon'  => 'pen',
            'href'  => href_to($controller->root_url, 'items', ['edit', '{id}'])
        ],
        // Кнопка копирования
        [
            'title' => LANG_COPY,
            'icon'  => 'copy',
            'href'  => href_to($controller->root_url, 'items_add', ['{id}', 1])
        ],
        // Условная кнопка (только если handler вернул true)
        [
            'title'   => LANG_{NAME}_APPROVE,
            'icon'    => 'check',
            'href'    => href_to($controller->root_url, 'items', ['approve', '{id}']),
            'handler' => function ($item) {
                return $item['is_pub'] == 0; // показать только для неопубликованных
            }
        ],
        // Опасная кнопка с подтверждением
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
}`
      },
      {
        path: "backend/forms/form_item.php",
        required: true,
        description: "Форма добавления/редактирования элемента в бэкенде. Класс наследует cmsForm. Метод init($do, ...) принимает 'add' или 'edit'.",
        template: `<?php

class form{Name}Item extends cmsForm {

    // init() получает параметры из $this->form_opts (установлены в экшене)
    // $do = 'add' или 'edit'
    public function init($do) {

        return [
            // Секция (fieldset)
            'basic' => [
                'title'  => LANG_CP_BASIC,  // заголовок секции
                'type'   => 'fieldset',
                'childs' => [
                    new fieldString('title', [
                        'title' => LANG_TITLE,
                        'rules' => [
                            ['required'],
                            ['max_length', 255]
                        ]
                    ]),
                    new fieldHtml('text', [
                        'title' => LANG_TEXT
                    ]),
                    new fieldCheckbox('is_pub', [
                        'title'   => LANG_IS_PUB,
                        'default' => 1
                    ]),
                    // Список с динамическими значениями
                    new fieldList('category_id', [
                        'title'     => LANG_CATEGORY,
                        'generator' => function () {
                            $model = cmsCore::getModel('content');
                            return [0 => LANG_NOT_SELECTED] + array_collection_to_list(
                                $model->getCategories('{name}'),
                                'id', 'title'
                            );
                        }
                    ]),
                    // Группы пользователей
                    new fieldListGroups('groups', [
                        'show_all'    => true,
                        'show_guests' => false
                    ]),
                    // Дата
                    new fieldDate('date_pub', [
                        'title'   => LANG_DATE_PUB,
                        'default' => date('Y-m-d H:i:s')
                    ])
                ]
            ],
            // Вторая секция
            'media' => [
                'title'  => LANG_MEDIA,
                'type'   => 'fieldset',
                'childs' => [
                    new fieldImage('image', [
                        'title'     => LANG_IMAGE,
                        'max_width' => 1200,
                        'max_size'  => 5120
                    ])
                ]
            ]
        ];
    }

}`
      },
      {
        path: "backend/forms/form_options.php",
        required: false,
        description: "Форма настроек дополнения. Используется автоматически при useDefaultOptionsAction = true.",
        template: `<?php

class form{Name}Options extends cmsForm {

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

}`
      }
    ]
  },

  with_hooks: {
    type: "with_hooks",
    description: "Дополнение, интегрирующееся с другими компонентами через хуки системы событий",
    notes: [
      "Каждый хук — отдельный файл в hooks/, имя файла = имя хука",
      "Класс: on{AddonName}{HookName} (CamelCase имя хука)",
      "Хук ДОЛЖЕН быть зарегистрирован в manifest.xml",
      "Хук ОБЯЗАТЕЛЬНО должен возвращать $data (для filter-хуков)"
    ],
    files: [
      {
        path: "hooks/content_after_add_approve.php",
        required: true,
        description: "Пример хука. Файл = имя хука. Класс: on{Name}ContentAfterAddApprove.",
        template: `<?php
// Файл: hooks/content_after_add_approve.php
// Хук срабатывает после одобрения нового материала контента

class on{Name}ContentAfterAddApprove extends cmsAction {

    /**
     * @param array $data Данные хука (зависят от конкретного хука)
     * @return mixed Для filter-хуков ОБЯЗАТЕЛЬНО вернуть $data
     */
    public function run($data) {

        $ctype_name = $data['ctype_name'];
        $item       = $data['item'];

        // Доступны стандартные свойства cmsAction:
        // $this->model        — модель текущего дополнения ({name})
        // $this->cms_user     — текущий пользователь
        // $this->request      — объект запроса
        // $this->cms_template — объект шаблона

        // Для работы с другими контроллерами:
        $activity = cmsCore::getController('activity');

        // Ваша логика...

        // ОБЯЗАТЕЛЬНО вернуть $data для filter-хуков!
        return $data;
    }

}`
      },
      {
        path: "hooks/user_registered.php",
        required: false,
        description: "Пример action-хука (не возвращает данные)",
        template: `<?php
// action-хук: вызывается как событие, возврат не обязателен

class on{Name}UserRegistered extends cmsAction {

    public function run($data) {

        $user_id = $data['user_id'];

        // Действие при регистрации нового пользователя
        $this->model->insert('{name}_user_data', [
            'user_id'   => $user_id,
            'date_reg'  => date('Y-m-d H:i:s')
        ]);

        return $data;
    }

}`
      },
      {
        path: "manifest.xml (с хуками)",
        required: true,
        description: "Хуки должны быть зарегистрированы в manifest.xml",
        template: `<?xml version="1.0" encoding="utf-8"?>
<addon>
    <name>{name}</name>
    <hooks>
        <!-- controller = имя дополнения, name = имя хука -->
        <hook controller="{name}" name="content_after_add_approve" />
        <hook controller="{name}" name="user_registered" />
    </hooks>
</addon>`
      }
    ]
  },

  with_routes: {
    type: "with_routes",
    description: "Дополнение с кастомными маршрутами URL. routes.php — функция, возвращающая массив правил.",
    notes: [
      "Функция routes_{name}() должна возвращать массив маршрутов",
      "Паттерн — регулярное выражение, числовые ключи — карта capture-групп к параметрам",
      "action — имя экшена (файл actions/{action}.php, класс action{Name}{Action})"
    ],
    files: [
      {
        path: "routes.php",
        required: false,
        description: "Кастомные маршруты URL. Функция routes_{name}() возвращает массив правил.",
        template: `<?php

function routes_{name}() {

    return [
        // /myaddon/{slug}.html → actions/view.php → run($slug)
        [
            'pattern' => '/^([a-z0-9\\-_]+)\\.html$/',
            'action'  => 'view',
            1         => 'slug'
        ],
        // /myaddon/cat/{category-slug}/{page}
        [
            'pattern' => '/^cat\\/([a-z0-9\\-_]+)(\\/([0-9]+))?$/',
            'action'  => 'category',
            1         => 'cat_slug',
            3         => 'page'
        ],
        // /myaddon/tag/{tag}
        [
            'pattern' => '/^tag\\/([a-z0-9\\-_]+)$/',
            'action'  => 'tag',
            1         => 'tag'
        ],
        // /myaddon/{ctype}/{item}.html — с фиксированным значением
        [
            'pattern'    => '/^([a-z0-9\\-_]+)\\/([a-z0-9\\-]+)\\.html$/',
            'action'     => 'item',
            'ctype_name' => 'articles',  // фиксированный параметр
            1            => 'category',
            2            => 'slug'
        ]
    ];

}`
      }
    ]
  },

  with_widget: {
    type: "with_widget",
    description: "Дополнение с виджетом для публичных страниц. Виджет: widget.php + options.form.php.",
    notes: [
      "Класс виджета: widget{Name}{WidgetName} extends cmsWidget",
      "Метод run() возвращает массив переменных для шаблона или false (не выводить)",
      "Шаблон виджета: /templates/{theme}/controllers/{name}/{widget_name}.tpl.php",
      "Опции читаются через $this->getOption('key', default)",
      "Для отключения кэша: public $is_cacheable = false",
      "Доступны: $this->cms_user, $this->cms_template, $this->cms_config, $this->cms_core"
    ],
    files: [
      {
        path: "widgets/{widget_name}/widget.php",
        required: true,
        description: "Класс виджета. Наследует cmsWidget. Метод run() — основная логика.",
        template: `<?php
/**
 * Виджет списка элементов
 * Шаблон: /templates/{theme}/controllers/{name}/list.tpl.php
 *         (имя шаблона = имя виджета по умолчанию)
 */
class widget{Name}List extends cmsWidget {

    // Отключить кэширование (для динамического контента):
    // public $is_cacheable = false;

    public function run() {

        // Читать настройки виджета (устанавливаются в админке)
        $limit   = $this->getOption('limit', 5);
        $is_pub  = $this->getOption('is_pub', 1);
        $dataset = $this->getOption('dataset', '');

        // Загрузить контроллер для доступа к его модели
        $controller = cmsCore::getController('{name}');

        $items = $controller->model
            ->filterEqual('is_pub', $is_pub)
            ->orderBy('date_pub', 'desc')
            ->limit($limit)
            ->get('{name}_items');

        // Если нет данных — не отображать виджет
        if (!$items) {
            return false;
        }

        // Возвращаем массив переменных для шаблона
        return [
            'items' => $items,
            'limit' => $limit,
            // Доступ к текущему пользователю:
            // 'is_logged' => $this->cms_user->is_logged
        ];
    }

}`
      },
      {
        path: "widgets/{widget_name}/options.form.php",
        required: false,
        description: "Форма настроек виджета в админке. Класс: formWidget{Name}{WidgetName}Options.",
        template: `<?php
// ВАЖНО: класс формы = formWidget + PascalCase(controller) + PascalCase(widget_name) + Options

class formWidget{Name}ListOptions extends cmsForm {

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
                        'title'   => 'Показывать',
                        'default' => 1,
                        'items'   => [1 => 'Опубликованные', 0 => 'Все']
                    ]),
                    // Динамический список категорий
                    new fieldList('options:category_id', [
                        'title'     => LANG_CATEGORY,
                        'generator' => function () {
                            $model = cmsCore::getModel('content');
                            return [0 => LANG_ALL_CATEGORIES] + array_collection_to_list(
                                $model->getCategories('{name}'), 'id', 'title'
                            );
                        }
                    ])
                ]
            ]
        ];
    }

}`
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// СТРУКТУРА ШАБЛОНА (ТЕМЫ)
// ─────────────────────────────────────────────────────────────────────────────
export const templateStructure = {
  description: "Структура шаблона (темы) для InstantCMS. Все шаблоны в /templates/{theme}/. Бэкенд-шаблоны контроллеров: /templates/{theme}/controllers/{name}/backend/{action}.tpl.php. Тема admincoreui предоставляет только layout-оболочку (navbar/sidebar), а НЕ шаблоны контента контроллеров.",
  install_note: "Шаблоны находятся в /templates/, а НЕ в /system/templates/. Бэкенд-шаблоны в подпапке backend/ внутри папки контроллера frontend-темы.",
  directory_layout: `
/templates/{theme_name}/
├── manifest.php                          ← ОБЯЗАТЕЛЬНО: метаданные шаблона
├── main.tpl.php                          ← ОБЯЗАТЕЛЬНО: главный макет HTML
├── options.form.php                      ← форма настроек шаблона в админке
├── options.css.php                       ← динамический CSS из настроек
├── scheme.php                            ← цветовые схемы
├── scss/                                 ← SCSS-исходники (style_middleware => 'scss')
├── css/                                  ← скомпилированные стили
│   ├── main.css
│   └── ...
├── js/                                   ← скрипты
│   ├── main.js
│   └── ...
├── images/                               ← изображения шаблона
├── assets/                               ← прочие статические ресурсы
├── layout_childs/                        ← фрагменты для динамического layout (is_dynamic_layout=true)
│   └── main_scheme.tpl.php               ← схема рядов/колонок Bootstrap; вызывается через renderLayoutChild()
├── widgets/                              ← глобальные шаблоны виджетов
│   ├── wrapper.tpl.php                   ← стандартная обёртка виджета
│   ├── wrapper_tabbed.tpl.php
│   ├── wrapper_plain.tpl.php
│   └── {widget_type}/
│       └── {widget_name}.tpl.php
└── controllers/                          ← шаблоны контроллеров (переопределяют системные)
    └── {controller_name}/
        ├── index.tpl.php                 ← фронтенд: экшен index
        ├── view.tpl.php                  ← фронтенд: экшен view
        ├── ...                           ← прочие фронтенд-экшены
        ├── backend/                      ← БЭКЕНД-шаблоны (НЕ в admincoreui/!)
        │   ├── index.tpl.php             ← бэкенд: дашборд-страница
        │   ├── items.tpl.php             ← бэкенд: список (генерируется listgrid)
        │   ├── items_add.tpl.php         ← бэкенд: форма добавления/редактирования
        │   └── ...
        └── widgets/                      ← шаблоны виджетов этого контроллера
            └── {widget_name}/
                └── {widget_name}.tpl.php
`,
  widget_positions: `
Стандартные позиции виджетов (вызов в main.tpl.php):
  <?= $this->widgets('header') ?>       ← шапка
  <?= $this->widgets('top') ?>          ← навигация
  <?= $this->widgets('left-top') ?>     ← левая колонка верх
  <?= $this->widgets('left-bottom') ?>  ← левая колонка низ
  <?= $this->widgets('right-top') ?>    ← правая колонка верх
  <?= $this->widgets('right-center') ?> ← правая колонка середина
  <?= $this->widgets('right-bottom') ?> ← правая колонка низ
  <?= $this->widgets('footer') ?>       ← подвал
  <?= $this->body() ?>                  ← основной контент страницы

Проверка наличия виджетов:
  <?php if ($this->hasWidgetsOn('right-top')): ?>
`,
  template_variables: `
Переменные доступные в .tpl.php шаблонах:
  $this->title()                    — заголовок страницы (метод с (), не свойство!)
  $this->body()                     — основной контент (HTML)
  $this->widgets($pos)              — вывод виджетов позиции
  $this->widgetsInHtml($pos, $w)    — виджеты позиции в HTML-обёртке
  $this->hasWidgetsOn($pos)         — проверка наличия виджетов на позиции
  $this->breadcrumbs()              — хлебные крошки
  $this->head(true, ...)            — теги <head>; первый параметр = include_css_js
  $this->bottom()                   — скрипты перед </body>
  $this->linkCSS('css/main.css')    — подключение CSS файла темы
  $this->linkJS('js/main.js')       — подключение JS файла темы
  $this->addMainTplCSSName(...)     — добавить CSS класс к <html>/<body>
  $this->addMainTplJSName(...)      — добавить JS класс
  $this->renderLayoutChild($name, $vars) — рендер фрагмента из layout_childs/
  $this->href_to($action, $params)  — формирование URL к экшену контроллера
  $config                           — объект конфигурации сайта
  $cms_user                         — текущий пользователь (cmsUser)
  cmsUser::isAdmin()                — проверка на администратора
  cmsUser::isLogged()               — проверка авторизации
  $device_type                      — 'mobile' или 'desktop'
  LANG_CODE                         — код активного языка (ru, en, ...)
`,
  inheritance: {
    description: "Система наследования шаблонов через manifest.php. Тема может наследовать файлы из других тем.",
    chain_resolution: "Алгоритм: setInheritNames() строит [default, ...inherited, current] → reverses → current проверяется ПЕРВЫМ. Первое найденное совпадение выигрывает.",
    admincoreui_role: "admincoreui — ТОЛЬКО layout-оболочка для бэкенда (admin.tpl.php содержит navbar + sidebar Bootstrap 4 CoreUI). Шаблоны контента контроллеров находятся в frontend-теме (modern/controllers/{name}/backend/).",
    manifest_inherit_example: `<?php
// templates/modern/manifest.php
return [
    'inherit' => ['admincoreui'],       // наследовать файлы из admincoreui
    'title'   => 'Modern',
    'properties' => [
        'vendor'           => 'bootstrap4',
        'style_middleware' => 'scss',       // SCSS компиляция
        'has_options'      => true,
        'is_dynamic_layout' => true,        // использует layout_childs/
        'is_backend'       => false,        // НЕ backend-тема
        'is_frontend'      => true,
        'html_attr'        => ['class' => 'min-vh-100']
    ]
];

// templates/admincoreui/manifest.php
return [
    'inherit' => ['modern'],            // наследовать из modern (взаимное наследование!)
    'title'   => 'CoreUI',
    'properties' => [
        'has_options'      => false,
        'is_dynamic_layout' => false,
        'is_backend'       => true,         // backend-тема (layout для админки)
        'is_frontend'      => false
    ]
];`,
    dynamic_layout: `// is_dynamic_layout = true (в manifest.php)
// В main.tpl.php вместо явных вызовов $this->widgets('left-top') и т.д.:
$this->renderLayoutChild('scheme', ['rows' => $rows]);
// Шаблон layout_childs/main_scheme.tpl.php получает $rows (массив рядов/колонок)
// и итерирует их, выводя виджеты по позициям Bootstrap-сеткой`,
    inheritance_chain_example: [
      "modern: 'inherit' => ['admincoreui'] — frontend-тема, наследует layout из admincoreui",
      "admincoreui: 'inherit' => ['modern'] — backend layout, наследует компоненты из modern",
      "Поиск файла шаблона: modern → admincoreui → default (current FIRST)"
    ]
  },
  required_files: [
    {
      path: "manifest.php",
      description: "Метаданные шаблона. Возвращает массив с title, author, properties.",
      template: `<?php
return [
    // 'inherit' => ['admincoreui'],   // наследование: modern наследует из admincoreui
    'title'  => 'My Theme',
    'author' => [
        'name' => 'Author Name',
        'url'  => 'https://example.com',
        'help' => 'https://docs.example.com'
    ],
    'properties' => [
        'has_options'                => true,    // есть форма настроек шаблона
        'has_profile_themes_support' => false,   // поддержка профильных тем
        'has_profile_themes_options' => false,
        'is_dynamic_layout'          => false,   // true = использует layout_childs/ + renderLayoutChild()
        'is_backend'                 => false,   // true = шаблон для admin-layout (как admincoreui)
        'is_frontend'                => true,    // шаблон доступен для фронтенда
        'vendor'                     => 'bootstrap4',  // CSS-фреймворк
        'style_middleware'           => 'scss'   // 'scss' если используется SCSS компиляция
    ]
];`
    },
    {
      path: "main.tpl.php",
      description: "Главный макет. HTML-скелет. Вызывает позиции виджетов и основной контент.",
      template: `<!DOCTYPE html>
<html lang="<?= LANG_CODE ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $this->title() ?></title>
    <?= $this->head() ?>
    <?= $this->linkCSS('css/theme-layout.css') ?>
    <?= $this->linkCSS('css/theme-gui.css') ?>
</head>
<body>
    <header>
        <?= $this->widgets('header') ?>
        <?= $this->widgets('top') ?>
    </header>

    <?= $this->breadcrumbs() ?>

    <div class="container">
        <?php if ($this->hasWidgetsOn('left-top') || $this->hasWidgetsOn('left-bottom')): ?>
        <aside class="sidebar-left">
            <?= $this->widgets('left-top') ?>
            <?= $this->widgets('left-bottom') ?>
        </aside>
        <?php endif ?>

        <main>
            <?= $this->body() ?>
        </main>

        <?php if ($this->hasWidgetsOn('right-top')): ?>
        <aside class="sidebar-right">
            <?= $this->widgets('right-top') ?>
            <?= $this->widgets('right-center') ?>
            <?= $this->widgets('right-bottom') ?>
        </aside>
        <?php endif ?>
    </div>

    <footer>
        <?= $this->widgets('footer') ?>
    </footer>

    <?= $this->bottom() ?>
</body>
</html>`
    }
  ],
  optional_files: [
    { path: "options.form.php", description: "Форма настроек шаблона в админке" },
    { path: "options.css.php", description: "CSS-переменные из настроек шаблона" },
    { path: "scheme.php", description: "Описание цветовых схем" },
    { path: "css/main.css", description: "Основные стили" },
    { path: "js/main.js", description: "Основные скрипты" },
    { path: "images/", description: "Изображения шаблона" }
  ],
  controller_templates: {
    description: "Шаблоны для конкретных контроллеров. Переопределяют системные шаблоны. Фронтенд и бэкенд — в одной папке frontend-темы.",
    frontend_path: "/templates/{theme}/controllers/{name}/{action}.tpl.php",
    backend_path: "/templates/{theme}/controllers/{name}/backend/{action}.tpl.php",
    widget_path: "/templates/{theme}/controllers/{name}/widgets/{widget_name}/{widget_name}.tpl.php",
    critical_note: "ВАЖНО: бэкенд-шаблоны в подпапке backend/ внутри папки frontend-темы (modern/), НЕ в папке admincoreui/!",
    examples: [
      "templates/modern/controllers/content/default_list.tpl.php — список материалов (фронтенд)",
      "templates/modern/controllers/content/default_item.tpl.php — просмотр материала (фронтенд)",
      "templates/modern/controllers/users/profile.tpl.php — профиль пользователя (фронтенд)",
      "templates/modern/controllers/{name}/index.tpl.php — главная страница дополнения (фронтенд)",
      "templates/modern/controllers/{name}/backend/index.tpl.php — дашборд бэкенда",
      "templates/modern/controllers/{name}/backend/items.tpl.php — список (бэкенд)",
      "templates/modern/controllers/{name}/widgets/{wname}/{wname}.tpl.php — виджет"
    ],
    note: "Шаблоны в папке темы ПЕРЕОПРЕДЕЛЯЮТ системные шаблоны из /system/controllers/. Если файл не найден в теме — ищется в inherited темах, затем в default."
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ТИПЫ ПОЛЕЙ ФОРМ
// ─────────────────────────────────────────────────────────────────────────────
export const fieldTypes: Record<string, { description: string; example: string }> = {
  fieldString: {
    description: "Однострочное текстовое поле (input text)",
    example: `new fieldString('title', [
    'title' => LANG_TITLE,
    'rules' => [['required'], ['max_length', 255]],
    'hint'  => 'Подсказка под полем'
])`
  },
  fieldText: {
    description: "Многострочное текстовое поле (textarea)",
    example: `new fieldText('description', [
    'title' => LANG_DESCRIPTION,
    'rows'  => 5
])`
  },
  fieldHtml: {
    description: "HTML редактор (WYSIWYG/TinyMCE)",
    example: `new fieldHtml('content', [
    'title' => LANG_CONTENT,
    'rules' => [['required']]
])`
  },
  fieldNumber: {
    description: "Числовое поле с опциями is_abs (только положительные), is_ceil (целые), save_zero",
    example: `new fieldNumber('amount', [
    'title'   => LANG_AMOUNT,
    'default' => 0,
    'options' => [
        'is_abs'    => true,  // только положительные
        'is_ceil'   => true,  // только целые
        'save_zero' => false  // не сохранять ноль
    ],
    'rules' => [['min', 0], ['max', 999999]]
])`
  },
  fieldList: {
    description: "Выпадающий список (select). Поддерживает generator для динамического наполнения.",
    example: `new fieldList('status', [
    'title'   => LANG_STATUS,
    'default' => 1,
    'items'   => [0 => LANG_INACTIVE, 1 => LANG_ACTIVE],
    // Или динамически:
    // 'generator' => function() { return [...]; }
])`
  },
  fieldListMultiple: {
    description: "Множественный выбор (checkbox list или multiselect)",
    example: `new fieldListMultiple('categories', [
    'title'     => LANG_CATEGORIES,
    'generator' => function () {
        return array_collection_to_list(
            cmsCore::getModel('content')->getCategories('articles'),
            'id', 'title'
        );
    }
])`
  },
  fieldListGroups: {
    description: "Выбор групп пользователей. Специализированный вариант fieldList.",
    example: `new fieldListGroups('groups', [
    'hint'        => 'Группы с доступом к плану',
    'show_all'    => false,  // не показывать "Все"
    'show_guests' => false   // не показывать гостей
])`
  },
  fieldCheckbox: {
    description: "Чекбокс (булево поле). default = 0 или 1.",
    example: `new fieldCheckbox('is_enabled', [
    'title'   => LANG_IS_ENABLED,
    'label'   => 'Включить эту функцию',
    'default' => 1
])`
  },
  fieldImage: {
    description: "Загрузка одного изображения с превью",
    example: `new fieldImage('photo', [
    'title'      => LANG_PHOTO,
    'max_width'  => 1200,
    'max_height' => 900,
    'max_size'   => 5120  // KB
])`
  },
  fieldFile: {
    description: "Загрузка произвольного файла",
    example: `new fieldFile('attachment', [
    'title'    => LANG_ATTACHMENT,
    'max_size' => 10240
])`
  },
  fieldDate: {
    description: "Поле выбора даты и времени (datepicker)",
    example: `new fieldDate('date_pub', [
    'title'   => LANG_DATE_PUB,
    'default' => date('Y-m-d H:i:s')
])`
  },
  fieldUrl: {
    description: "Поле для URL с валидацией",
    example: `new fieldUrl('website', [
    'title' => LANG_WEBSITE,
    'rules' => [['url']]
])`
  },
  fieldHidden: {
    description: "Скрытое поле (не отображается пользователю)",
    example: `new fieldHidden('user_id', [
    'default' => $this->cms_user->id
])`
  },
  fieldCategory: {
    description: "Выбор категории типа контента",
    example: `new fieldCategory('category_id', [
    'title'      => LANG_CATEGORY,
    'ctype_name' => 'articles'
])`
  },
  fieldFieldsgroup: {
    description: "Повторяющаяся группа полей (динамический список вложенных полей). Используется для сложных структур данных.",
    example: `new fieldFieldsgroup('prices', [
    'add_title'  => LANG_PRICES_ADD,
    'is_sortable' => true,
    'childs' => [
        new fieldNumber('amount', [
            'title' => LANG_AMOUNT,
            'rules' => [['required']]
        ]),
        new fieldList('period', [
            'title' => LANG_PERIOD,
            'items' => ['DAY' => LANG_DAY1, 'MONTH' => LANG_MONTH1]
        ])
    ]
])`
  }
};
