import { phpValue, quotePhp } from '../utils/serialization.js';
import { appliedOptions, rejectUnsupportedOptions } from '../utils/generator-options.js';

interface CrdField {
  name: string;
  type: string;
  title: string;
  comment?: string;
  is_system?: boolean;
  default?: string | number | boolean;
  key?: string;
}

interface ScaffoldCrudOptions {
  addon_name: string;
  fields: CrdField[];
  options?: {
    use_category?: boolean;
    use_tags?: boolean;
    use_comments?: boolean;
    use_rating?: boolean;
    use_moderation?: boolean;
    use_seo?: boolean;
    use_content?: boolean;
    list_template?: 'grid' | 'list' | 'table';
    theme?: string;
  };
}

const SYSTEM_FIELDS = new Set(['id', 'title', 'user_id', 'date_pub', 'is_pub', 'category_id']);

/**
 * Генерирует CRUD-дополнение InstantCMS.
 *
 * Совместимость проверена по исходникам InstantCMS 2.18.2:
 * cmsModel::limit($from, $howmany), cmsTemplate::setPageTitle/setMeta,
 * html_pagebar(), icms\traits\controllers\actions\{listgrid,formItem,deleteItem},
 * cmsBackend::getForm() с префиксом backend/.
 */
export function scaffoldCrud(opts: ScaffoldCrudOptions): object {
  rejectUnsupportedOptions('scaffold_crud', opts.options, {
    use_tags: 'теги контента не генерируются — добавьте таблицу и хук вручную',
    use_comments: 'подключите контроллер comments через хук content_after_add_approve',
    use_rating: 'рейтинг настраивается на уровне контент-типа, генератор его не создаёт',
    use_moderation: 'модерация требует отдельного экшена и прав — не генерируется',
    use_seo: 'SEO-поля и метатеги добавляются вручную',
    use_content: 'регистрация типа контента не автоматизирована',
    list_template: 'вариант шаблона списка не генерируется — правьте index.tpl.php вручную',
  });

  const name = opts.addon_name;
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(name)) throw new Error('Invalid addon name');
  if (opts.fields.length === 0) throw new Error('At least one field is required');

  const fieldNames = new Set<string>();
  for (const field of opts.fields) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(field.name) || fieldNames.has(field.name)) {
      throw new Error('Invalid or duplicate field name');
    }
    fieldNames.add(field.name);
  }

  const Name = name.split('_').map(capitalize).join('');
  const NAME = name.toUpperCase();
  const useCategory = Boolean(opts.options?.use_category);
  const theme = opts.options?.theme || 'modern';
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(theme)) throw new Error('Invalid theme name');

  const files: Record<string, string> = {};

  const ctrl = `package/system/controllers/${name}`;

  files[`${ctrl}/model.php`] = generateModel(name, Name, useCategory);
  files[`${ctrl}/frontend.php`] = generateFrontend(name);
  files[`${ctrl}/actions/index.php`] = generateActionIndex(name, Name, NAME);
  files[`${ctrl}/actions/view.php`] = generateActionView(name, Name, NAME);
  files[`${ctrl}/actions/add.php`] = generateActionAdd(name, Name, NAME);
  files[`${ctrl}/actions/edit.php`] = generateActionEdit(name, Name, NAME);
  files[`${ctrl}/actions/delete.php`] = generateActionDelete(name, Name, NAME);

  if (useCategory) {
    files[`${ctrl}/actions/category.php`] = generateActionCategory(name, Name, NAME);
  }

  files[`${ctrl}/backend.php`] = generateBackend(name, Name, NAME);
  files[`${ctrl}/backend/actions/index.php`] = generateBackendIndex(Name);
  files[`${ctrl}/backend/actions/items.php`] = generateBackendItems(name, Name, NAME);
  files[`${ctrl}/backend/actions/items_add.php`] = generateBackendItemsAdd(name, Name, NAME);
  files[`${ctrl}/backend/actions/items_edit.php`] = generateBackendItemsEdit(name, Name, NAME);
  files[`${ctrl}/backend/actions/items_delete.php`] = generateBackendItemsDelete(name, Name);
  files[`${ctrl}/backend/grids/grid_items.php`] = generateGridItems(name, NAME);
  files[`${ctrl}/backend/forms/form_item.php`] = generateFormItem(opts.fields, Name, NAME, 'Item');
  files[`${ctrl}/forms/form_item_public.php`] = generateFormItem(
    opts.fields,
    Name,
    NAME,
    'ItemPublic'
  );

  files[`package/system/languages/ru/controllers/${name}/${name}.php`] = generateLang(
    name,
    NAME,
    opts.fields
  );

  const tpl = `package/templates/${theme}/controllers/${name}`;
  files[`${tpl}/index.tpl.php`] = generateTplIndex(name, NAME);
  files[`${tpl}/view.tpl.php`] = generateTplView(name, NAME);
  files[`${tpl}/add.tpl.php`] = generateTplForm(NAME, '_ADD');
  files[`${tpl}/edit.tpl.php`] = generateTplForm(NAME, '_EDIT');
  files[`${tpl}/delete.tpl.php`] = generateTplDelete(NAME);
  if (useCategory) {
    files[`${tpl}/category.tpl.php`] = generateTplCategory(name, NAME);
  }

  files['[pkg] install.sql'] = generateSql(name, opts.fields, useCategory);

  return {
    addon_name: name,
    addon_class: Name,
    files_count: Object.keys(files).length,
    files,
    scaffold_status: 'partial',
    structure_notes: [
      `CRUD для контент-типа: ${name}`,
      `backend.php: getBackendMenu() + before()`,
      `Экшены используют traits listgrid + formItem + deleteItem`,
      `Языковой файл: /system/languages/ru/controllers/${name}/${name}.php`,
      `Шаблоны темы: /templates/${theme}/controllers/${name}/`,
      `Таблица: ${name}_items`,
    ],
    limitations: [
      'install.sql создаёт таблицу с префиксом cms_ — замените префикс на реальный из system/config/config.php.',
      'Маршрут контроллера не создаётся: добавьте routes.php или используйте адреса вида /{controller}/view/{id}.',
      'Права доступа и модерация не генерируются.',
      useCategory
        ? 'Режим категорий создаёт действия и модель, но таблицу категорий нужно создать отдельно.'
        : 'Категории не используются.',
      'Синтаксическая проверка не подтверждает поведение в конкретной сборке InstantCMS.',
    ],
    options: opts.options || {},
    supported_options: ['theme', 'use_category'],
    options_applied: appliedOptions(opts.options, ['theme', 'use_category']),
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateModel(name: string, Name: string, useCategory: boolean): string {
  const categoryMethods = useCategory
    ? `
    public function getItemCategoryBySlug(string $slug) {
        return $this->getItemByField('${name}_categories', 'slug', $slug);
    }

    public function getCountByCategory(int $category_id): int {
        return (int) $this->filterEqual('category_id', $category_id)
                           ->filterEqual('is_pub', 1)
                           ->getCount('${name}_items');
    }

    public function getByCategory(int $category_id, int $limit = 10, int $offset = 0): array {
        return $this->filterEqual('category_id', $category_id)
                    ->filterEqual('is_pub', 1)
                    ->orderBy('date_pub', 'desc')
                    ->limit($offset, $limit)
                    ->get('${name}_items') ?: [];
    }
`
    : '';

  return `<?php

class model${Name} extends cmsModel {

    public function getPublished(int $limit = 10, int $offset = 0): array {
        return $this->filterEqual('is_pub', 1)
                    ->orderBy('date_pub', 'desc')
                    ->limit($offset, $limit)
                    ->get('${name}_items') ?: [];
    }

    public function getCountPublished(): int {
        return (int) $this->filterEqual('is_pub', 1)->getCount('${name}_items');
    }

    public function addItem(array $item) {
        return $this->insert('${name}_items', $item);
    }

    public function updateItem($id, array $item) {
        return $this->update('${name}_items', $id, $item);
    }

    public function deleteItem($id) {
        return $this->delete('${name}_items', $id);
    }
${categoryMethods}
}`;
}

function generateFrontend(name: string): string {
  return `<?php

class ${name} extends cmsFrontend {

    public const ROUTE_NAME = '${name}';

    protected $useOptions = true;

    public function run() {
        return $this->redirect(href_to(${name}::ROUTE_NAME));
    }

}`;
}

function generateActionIndex(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Index extends cmsAction {

    public function run($page = 1) {

        $perpage = !empty($this->options['perpage']) ? (int) $this->options['perpage'] : 10;
        $page    = max(1, (int) $page);

        $total = $this->model->getCountPublished();
        $items = $this->model->getPublished($perpage, ($page - 1) * $perpage);

        $this->cms_template->setPageTitle(LANG_${NAME}_TITLE);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE);

        return $this->cms_template->render('index', [
            'items'    => $items,
            'total'    => $total,
            'page'     => $page,
            'perpage'  => $perpage,
            'page_url' => href_to(${name}::ROUTE_NAME),
        ]);
    }

}`;
}

function generateActionView(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}View extends cmsAction {

    public function run($id = 0) {

        $item = $this->model->getItemById('${name}_items', (int) $id);

        if (!$item || empty($item['is_pub'])) {
            return cmsCore::error404();
        }

        $item = cmsEventsManager::hook('${name}_before_item', $item);

        $this->cms_template->setPageTitle($item['title']);
        $this->cms_template->setMeta('', $item['description'] ?? '');
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to(${name}::ROUTE_NAME));
        $this->cms_template->addBreadcrumb($item['title']);

        return $this->cms_template->render('view', [
            'item' => $item,
        ]);
    }

}`;
}

function generateActionAdd(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Add extends cmsAction {

    public function run() {

        if (!$this->cms_user->is_logged) {
            return $this->redirectToLogin(href_to(${name}::ROUTE_NAME));
        }

        $form   = $this->getForm('item_public');
        $errors = [];
        $item   = [];

        if ($this->request->has('submit')) {

            $item = $form->parse($this->request, $errors);

            if (!$errors) {

                $item['user_id']  = $this->cms_user->id;
                $item['date_pub'] = date('Y-m-d H:i:s');

                $id = $this->model->addItem($item);

                cmsEventsManager::hook('${name}_after_add', $item, $id);

                return $this->redirect(href_to(${name}::ROUTE_NAME, 'view', $id));
            }
        }

        $this->cms_template->setPageTitle(LANG_${NAME}_ADD);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to(${name}::ROUTE_NAME));
        $this->cms_template->addBreadcrumb(LANG_${NAME}_ADD);

        return $this->cms_template->render('add', [
            'form'   => $form,
            'item'   => $item,
            'errors' => $errors,
        ]);
    }

}`;
}

function generateActionEdit(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Edit extends cmsAction {

    public function run($id = 0) {

        $item = $this->model->getItemById('${name}_items', (int) $id);

        if (!$item) {
            return cmsCore::error404();
        }

        if ($item['user_id'] != $this->cms_user->id && !$this->cms_user->is_admin) {
            return cmsCore::error404();
        }

        $form   = $this->getForm('item_public');
        $errors = [];

        if ($this->request->has('submit')) {

            $item = array_merge($item, $form->parse($this->request, $errors));

            if (!$errors) {

                $this->model->updateItem($id, $item);

                cmsEventsManager::hook('${name}_after_update', $item, $id);

                return $this->redirect(href_to(${name}::ROUTE_NAME, 'view', $id));
            }
        }

        $this->cms_template->setPageTitle(LANG_${NAME}_EDIT);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to(${name}::ROUTE_NAME));
        $this->cms_template->addBreadcrumb(LANG_${NAME}_EDIT);

        return $this->cms_template->render('edit', [
            'form'   => $form,
            'item'   => $item,
            'errors' => $errors,
        ]);
    }

}`;
}

function generateActionDelete(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Delete extends cmsAction {

    public function run($id = 0) {

        $item = $this->model->getItemById('${name}_items', (int) $id);

        if (!$item) {
            return cmsCore::error404();
        }

        if ($item['user_id'] != $this->cms_user->id && !$this->cms_user->is_admin) {
            return cmsCore::error404();
        }

        if ($this->request->has('submit')) {

            if (!cmsForm::validateCSRFToken($this->request->get('csrf_token', ''))) {
                return cmsCore::error404();
            }

            $this->model->deleteItem($item['id']);

            cmsEventsManager::hook('${name}_after_delete', $item);

            cmsUser::addSessionMessage(LANG_${NAME}_DELETE_SUCCESS, 'success');

            return $this->redirect(href_to(${name}::ROUTE_NAME));
        }

        $this->cms_template->setPageTitle(LANG_${NAME}_DELETE);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to(${name}::ROUTE_NAME));
        $this->cms_template->addBreadcrumb(LANG_${NAME}_DELETE);

        return $this->cms_template->render('delete', [
            'item' => $item,
        ]);
    }

}`;
}

function generateActionCategory(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Category extends cmsAction {

    public function run($slug = '') {

        $category = $this->model->getItemCategoryBySlug((string) $slug);

        if (!$category) {
            return cmsCore::error404();
        }

        $perpage = !empty($this->options['perpage']) ? (int) $this->options['perpage'] : 10;
        $page    = max(1, (int) $this->request->get('page', 1));

        $total = $this->model->getCountByCategory($category['id']);
        $items = $this->model->getByCategory($category['id'], $perpage, ($page - 1) * $perpage);

        $this->cms_template->setPageTitle($category['title']);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to(${name}::ROUTE_NAME));
        $this->cms_template->addBreadcrumb($category['title']);

        return $this->cms_template->render('category', [
            'category' => $category,
            'items'    => $items,
            'total'    => $total,
            'page'     => $page,
            'perpage'  => $perpage,
            'page_url' => href_to(${name}::ROUTE_NAME, 'category', $category['slug']),
        ]);
    }

}`;
}

function generateBackend(name: string, Name: string, NAME: string): string {
  return `<?php

class backend${Name} extends cmsBackend {

    public $useDefaultOptionsAction = true;
    protected $useOptions = true;

    public function getBackendMenu() {
        return [
            [
                'title'   => LANG_${NAME}_CP_ITEMS,
                'url'     => href_to($this->root_url, 'items'),
                'options' => ['icon' => 'list'],
            ],
            [
                'title'   => LANG_OPTIONS,
                'url'     => href_to($this->root_url, 'options'),
                'options' => ['icon' => 'cog'],
            ],
        ];
    }

}`;
}

function generateBackendIndex(Name: string): string {
  return `<?php

class action${Name}Index extends cmsAction {

    public function run($do = false) {

        if ($do) {
            return $this->runAction('index_' . $do);
        }

        return $this->redirect(href_to($this->root_url, 'items'));
    }

}`;
}

function generateBackendItems(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Items extends cmsAction {

    use icms\\traits\\controllers\\actions\\listgrid;

    public function __construct($controller, $params = []) {
        parent::__construct($controller, $params);

        $this->table_name = '${name}_items';
        $this->grid_name  = 'items';
        $this->title      = LANG_${NAME}_CP_ITEMS;

        $this->tool_buttons = [
            [
                'class' => 'add',
                'title' => LANG_${NAME}_CP_ADD,
                'href'  => href_to($this->root_url, 'items_add'),
            ],
        ];
    }

}`;
}

function generateBackendItemsAdd(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}ItemsAdd extends cmsAction {

    use icms\\traits\\controllers\\actions\\formItem;

    public function __construct($controller, $params = []) {
        parent::__construct($controller, $params);

        $this->table_name  = '${name}_items';
        $this->form_name   = 'item';
        $this->success_url = href_to($this->root_url, 'items');

        $this->title = [
            'add'  => LANG_${NAME}_CP_ADD,
            'edit' => LANG_${NAME}_CP_EDIT,
        ];

        $this->breadcrumbs = [
            [LANG_${NAME}_CP_ITEMS, href_to($this->root_url, 'items')],
            LANG_${NAME}_CP_ADD,
        ];

        $this->use_default_tool_buttons = true;

        $this->default_item = [
            'is_pub'   => 1,
            'date_pub' => date('Y-m-d H:i:s'),
        ];
    }

}`;
}

function generateBackendItemsEdit(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}ItemsEdit extends cmsAction {

    use icms\\traits\\controllers\\actions\\formItem;

    public function __construct($controller, $params = []) {
        parent::__construct($controller, $params);

        $this->table_name  = '${name}_items';
        $this->form_name   = 'item';
        $this->success_url = href_to($this->root_url, 'items');

        $this->title = [
            'add'  => LANG_${NAME}_CP_ADD,
            'edit' => LANG_${NAME}_CP_EDIT,
        ];

        $this->breadcrumbs = [
            [LANG_${NAME}_CP_ITEMS, href_to($this->root_url, 'items')],
            LANG_${NAME}_CP_EDIT,
        ];

        $this->use_default_tool_buttons = true;
    }

}`;
}

function generateBackendItemsDelete(name: string, Name: string): string {
  return `<?php

class action${Name}ItemsDelete extends cmsAction {

    use icms\\traits\\controllers\\actions\\deleteItem;

    public function __construct($controller, $params = []) {
        parent::__construct($controller, $params);

        $this->table_name  = '${name}_items';
        $this->success_url = href_to($this->root_url, 'items');
    }

}`;
}

function generateGridItems(name: string, NAME: string): string {
  return `<?php

function grid_items($controller) {

    $columns = [
        'id' => [
            'title' => 'ID',
            'width' => 60,
        ],
        'title' => [
            'title'  => LANG_TITLE,
            'filter' => 'like',
            'href'   => href_to($controller->root_url, 'items_edit', ['{id}']),
        ],
        'date_pub' => [
            'title'  => LANG_DATE_PUB,
            'width'  => 150,
            'filter' => 'date',
        ],
        'user_id' => [
            'title' => LANG_AUTHOR,
            'width' => 120,
        ],
        'is_pub' => [
            'title'       => LANG_${NAME}_IS_PUB,
            'width'       => 80,
            'flag'        => true,
            'flag_toggle' => href_to($controller->root_url, 'toggle_item', ['{id}', '${name}_items', 'is_pub']),
        ],
    ];

    $actions = [
        [
            'title' => LANG_EDIT,
            'icon'  => 'pen',
            'href'  => href_to($controller->root_url, 'items_edit', ['{id}']),
        ],
        [
            'title'   => LANG_DELETE,
            'class'   => 'text-danger',
            'icon'    => 'times-circle',
            'confirm' => LANG_${NAME}_DELETE_CONFIRM,
            'href'    => href_to($controller->root_url, 'items_delete', ['{id}']),
        ],
    ];

    return [
        'options' => [
            'is_sortable'   => true,
            'is_filter'     => true,
            'is_pagination' => true,
            'is_draggable'  => false,
            'order_by'      => 'date_pub',
            'order_to'      => 'desc',
        ],
        'columns' => $columns,
        'actions' => $actions,
    ];
}`;
}

function generateFormItem(
  fields: CrdField[],
  Name: string,
  NAME: string,
  formClassSuffix: string
): string {
  let formCode = `<?php

class form${Name}${formClassSuffix} extends cmsForm {

    public function init($do = 'add') {

        return [
            'basic' => [
                'title'  => LANG_${NAME}_BASIC,
                'type'   => 'fieldset',
                'childs' => [
                    new fieldString('title', [
                        'title' => LANG_TITLE,
                        'rules' => [
                            ['required'],
                            ['max_length', 255],
                        ],
                    ]),
`;

  for (const field of fields) {
    if (SYSTEM_FIELDS.has(field.name) || field.is_system) {
      continue;
    }

    const fieldClass = getFieldClass(field.type);
    const fieldOptions: Record<string, unknown> = {
      title: field.title || capitalize(field.name.replace(/_/g, ' ')),
    };

    if (field.type === 'varchar') {
      fieldOptions.rules = [['max_length', 255]];
    }

    if (field.default !== undefined) {
      fieldOptions.default = field.default;
    }

    formCode += `                    new ${fieldClass}('${field.name}', ${phpValue(fieldOptions)}),
`;
  }

  formCode += `                    new fieldCheckbox('is_pub', [
                        'title'   => LANG_${NAME}_IS_PUB,
                        'default' => 1,
                    ]),
                    new fieldDate('date_pub', [
                        'title'   => LANG_DATE_PUB,
                        'default' => date('Y-m-d H:i'),
                        'options' => [
                            'show_time' => true,
                        ],
                    ]),
                ],
            ],
        ];
    }

}`;
  return formCode;
}

function getFieldClass(type: string): string {
  const map: Record<string, string> = {
    varchar: 'fieldString',
    text: 'fieldText',
    html: 'fieldHtml',
    int: 'fieldNumber',
    tinyint: 'fieldNumber',
    decimal: 'fieldNumber',
    float: 'fieldNumber',
    date: 'fieldDate',
    datetime: 'fieldDate',
    timestamp: 'fieldDate',
    select: 'fieldList',
    enum: 'fieldList',
    radio: 'fieldRadio',
    checkbox: 'fieldCheckbox',
    file: 'fieldFile',
    image: 'fieldImage',
    images: 'fieldImages',
    user: 'fieldUser',
    users: 'fieldUsers',
  };
  return map[type] || 'fieldString';
}

function sqlType(type: string): string {
  const map: Record<string, string> = {
    varchar: `varchar(255) NOT NULL DEFAULT ''`,
    text: 'text',
    html: 'mediumtext',
    int: 'int(11) NOT NULL DEFAULT 0',
    tinyint: 'tinyint(1) NOT NULL DEFAULT 0',
    decimal: 'decimal(10,2) NOT NULL DEFAULT 0.00',
    float: 'decimal(10,2) NOT NULL DEFAULT 0.00',
    date: 'datetime',
    datetime: 'datetime',
    timestamp: 'datetime',
  };
  return map[type] || `varchar(255) NOT NULL DEFAULT ''`;
}

function sqlColumnName(field: CrdField): string {
  return field.name.replace(/[^a-z0-9_]/g, '_');
}

function generateSql(name: string, fields: CrdField[], useCategory: boolean): string {
  const custom = fields
    .filter(field => !SYSTEM_FIELDS.has(field.name) && !field.is_system)
    .map(field => `    \`${sqlColumnName(field)}\` ${sqlType(field.type)},`);

  const categoryColumn = useCategory
    ? `    \`category_id\` int(10) unsigned NOT NULL DEFAULT 0,`
    : '';

  const categoryTable = useCategory
    ? `
CREATE TABLE IF NOT EXISTS \`cms_${name}_categories\` (
    \`id\`       int(10) unsigned NOT NULL AUTO_INCREMENT,
    \`parent_id\` int(10) unsigned NOT NULL DEFAULT 0,
    \`title\`    varchar(255) NOT NULL DEFAULT '',
    \`slug\`     varchar(255) NOT NULL DEFAULT '',
    PRIMARY KEY (\`id\`),
    KEY \`slug\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`
    : '';

  return `-- Замените cms_ на реальный префикс БД из system/config/config.php
CREATE TABLE IF NOT EXISTS \`cms_${name}_items\` (
    \`id\`       int(10) unsigned NOT NULL AUTO_INCREMENT,
${categoryColumn}
    \`user_id\`  int(10) unsigned NOT NULL DEFAULT 0,
    \`title\`    varchar(255) NOT NULL DEFAULT '',
${custom.join('\n')}
    \`date_pub\` datetime NOT NULL,
    \`is_pub\`   tinyint(1) unsigned NOT NULL DEFAULT 1,
    PRIMARY KEY (\`id\`),
    KEY \`user_id\` (\`user_id\`),
    KEY \`is_pub\` (\`is_pub\`),
    KEY \`date_pub\` (\`date_pub\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
${categoryTable}`;
}

function generateLang(name: string, NAME: string, fields: CrdField[]): string {
  let lang = `<?php

define('LANG_${NAME}_TITLE', ${quotePhp(capitalize(name.replace(/_/g, ' ')))});
define('LANG_${NAME}_ADD', ${quotePhp('Добавить')});
define('LANG_${NAME}_EDIT', ${quotePhp('Редактировать')});
define('LANG_${NAME}_DELETE', ${quotePhp('Удалить')});
define('LANG_${NAME}_DELETE_SUCCESS', ${quotePhp('Запись успешно удалена')});
define('LANG_${NAME}_NOT_FOUND', ${quotePhp('Ничего не найдено')});
define('LANG_${NAME}_IS_PUB', ${quotePhp('Опубликовано')});
define('LANG_${NAME}_BASIC', ${quotePhp('Основное')});
define('LANG_${NAME}_DELETE_CONFIRM', ${quotePhp('Удалить запись?')});

define('LANG_${NAME}_CP_TITLE', ${quotePhp('Управление')});
define('LANG_${NAME}_CP_ITEMS', ${quotePhp('Элементы')});
define('LANG_${NAME}_CP_ADD', ${quotePhp('Добавить элемент')});
define('LANG_${NAME}_CP_EDIT', ${quotePhp('Редактирование элемента')});
define('LANG_${NAME}_CP_DELETE', ${quotePhp('Удаление элемента')});

`;

  for (const field of fields) {
    if (field.is_system || SYSTEM_FIELDS.has(field.name)) {
      continue;
    }
    const key = `LANG_${NAME}_${field.name.toUpperCase()}`;
    const value = field.title || capitalize(field.name.replace(/_/g, ' '));
    lang += `define(${quotePhp(key)}, ${quotePhp(value)});
`;
  }

  return lang;
}

function generateTplIndex(name: string, NAME: string): string {
  return `<?php
/**
 * @var array  $items
 * @var int    $total
 * @var int    $page
 * @var int    $perpage
 * @var string $page_url
 */
?>
<h1><?php echo html(LANG_${NAME}_TITLE); ?></h1>

<?php if ($items) { ?>
    <div class="row">
        <?php foreach ($items as $item) { ?>
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <h2 class="h5 mb-2">
                            <a href="<?php echo href_to('${name}', 'view', $item['id']); ?>">
                                <?php echo html($item['title']); ?>
                            </a>
                        </h2>
                        <div class="text-muted small"><?php echo html_date($item['date_pub'], true); ?></div>
                    </div>
                </div>
            </div>
        <?php } ?>
    </div>

    <?php echo html_pagebar($page, $perpage, $total, $page_url); ?>
<?php } else { ?>
    <p class="text-muted"><?php echo html(LANG_${NAME}_NOT_FOUND); ?></p>
<?php } ?>
`;
}

function generateTplView(name: string, NAME: string): string {
  return `<?php
/**
 * @var array $item
 */
?>
<article>
    <h1><?php echo html($item['title']); ?></h1>

    <div class="text-muted small mb-3"><?php echo html_date($item['date_pub'], true); ?></div>

    <?php if (!empty($item['description'])) { ?>
        <div class="mb-4"><?php echo html($item['description']); ?></div>
    <?php } ?>

    <p>
        <a href="<?php echo href_to('${name}'); ?>"><?php echo html(LANG_${NAME}_TITLE); ?></a>
    </p>
</article>
`;
}

function generateTplForm(NAME: string, suffix: '_ADD' | '_EDIT'): string {
  return `<?php
/**
 * @var cmsForm $form
 * @var array   $item
 * @var array   $errors
 */
?>
<h1><?php echo html(LANG_${NAME}${suffix}); ?></h1>

<?php $this->renderForm($form, $item, [
    'action' => '',
    'method' => 'post',
], $errors); ?>
`;
}

function generateTplDelete(NAME: string): string {
  return `<?php
/**
 * @var array $item
 */
?>
<h1><?php echo html(LANG_${NAME}_DELETE); ?></h1>

<form action="" method="post">
    <?php echo html_csrf_token(); ?>
    <p><?php echo html($item['title']); ?></p>
    <button type="submit" name="submit" value="1" class="btn btn-danger">
        <?php echo html(LANG_DELETE); ?>
    </button>
</form>
`;
}

function generateTplCategory(name: string, NAME: string): string {
  return `<?php
/**
 * @var array  $category
 * @var array  $items
 * @var int    $total
 * @var int    $page
 * @var int    $perpage
 * @var string $page_url
 */
?>
<h1><?php echo html($category['title']); ?></h1>

<?php if ($items) { ?>
    <ul>
        <?php foreach ($items as $item) { ?>
            <li>
                <a href="<?php echo href_to('${name}', 'view', $item['id']); ?>">
                    <?php echo html($item['title']); ?>
                </a>
            </li>
        <?php } ?>
    </ul>

    <?php echo html_pagebar($page, $perpage, $total, $page_url); ?>
<?php } else { ?>
    <p class="text-muted"><?php echo html(LANG_${NAME}_NOT_FOUND); ?></p>
<?php } ?>
`;
}
