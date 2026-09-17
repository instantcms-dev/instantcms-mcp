import { phpValue, quotePhp } from '../utils/serialization.js';

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
  };
}

export function scaffoldCrud(opts: ScaffoldCrudOptions): object {
  const name = opts.addon_name;
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(name)) throw new Error('Invalid addon name');
  const fieldNames = new Set<string>();
  for (const field of opts.fields) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(field.name) || fieldNames.has(field.name)) {
      throw new Error('Invalid or duplicate field name');
    }
    fieldNames.add(field.name);
  }
  const Name = name.split('_').map(capitalize).join('');
  const NAME = name.toUpperCase();

  const files: Record<string, string> = {};

  const ctrl = `package/system/controllers/${name}`;

  files[`${ctrl}/model.php`] = generateModel(name, Name, opts.fields);
  files[`${ctrl}/frontend.php`] = generateFrontend(name, Name);
  files[`${ctrl}/actions/index.php`] = generateActionIndex(name, Name, NAME);
  files[`${ctrl}/actions/view.php`] = generateActionView(name, Name, NAME);
  files[`${ctrl}/actions/add.php`] = generateActionAdd(name, Name, NAME);
  files[`${ctrl}/actions/edit.php`] = generateActionEdit(name, Name, NAME);
  files[`${ctrl}/actions/delete.php`] = generateActionDelete(name, Name);

  if (opts.options?.use_category) {
    files[`${ctrl}/actions/category.php`] = generateActionCategory(name, Name, NAME);
  }

  files[`${ctrl}/backend.php`] = generateBackend(name, Name, NAME);
  files[`${ctrl}/backend/actions/index.php`] = generateBackendIndex(name, Name, NAME);
  files[`${ctrl}/backend/actions/items.php`] = generateBackendItems(name, Name, NAME);
  files[`${ctrl}/backend/actions/items_add.php`] = generateBackendItemsAdd(name, Name, NAME);
  files[`${ctrl}/backend/actions/items_edit.php`] = generateBackendItemsEdit(name, Name, NAME);
  files[`${ctrl}/backend/actions/items_delete.php`] = generateBackendItemsDelete(name, Name);
  files[`${ctrl}/backend/grids/grid_items.php`] = generateGridItems(name, Name, NAME);
  files[`${ctrl}/backend/forms/form_item.php`] = generateFormItem(opts.fields, Name, NAME);

  files[`package/system/languages/ru/controllers/${name}/${name}.php`] = generateLang(
    name,
    NAME,
    opts.fields
  );

  return {
    addon_name: name,
    addon_class: Name,
    files_count: Object.keys(files).length,
    files,
    structure_notes: [
      `CRUD для контент-типа: ${name}`,
      `backend.php содержит getBackendMenu() + before()`,
      `Используется trait listgrid + trait formItem`,
      `Языковой файл: /system/languages/ru/controllers/${name}/${name}.php`,
      `Таблица: ${name}_items`,
    ],
    options: opts.options || {},
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateModel(name: string, Name: string, fields: CrdField[]): string {
  const basicFields = fields.filter(f => !f.is_system && f.type !== 'text' && f.type !== 'html');

  let modelCode = `<?php

class model${Name} extends cmsModel {

    protected $table = '${name}_items';

`;

  if (basicFields.length > 0) {
    modelCode += `    // Геттеры для полей
`;
    for (const field of basicFields) {
      const methodName = field.name.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
      modelCode += `    public function get${capitalize(methodName)}($value) {
        return $this->filterEqual('${field.name}', $value);
    }

`;
    }
  }

  modelCode += `    public function getPublished(int $limit = 10, int $offset = 0): array {
        return $this->filterEqual('is_pub', 1)
                    ->orderBy('date_pub', 'desc')
                    ->limit($offset, $limit)
                    ->get('${name}_items');
    }

    public function getByUser(int $user_id, int $limit = 10): array {
        return $this->filterEqual('user_id', $user_id)
                    ->orderBy('date_pub', 'desc')
                    ->limit($limit)
                    ->get('${name}_items');
    }

    public function getCountPublished(): int {
        return (int) $this->filterEqual('is_pub', 1)->getCount('${name}_items');
    }

    public function getItem($id) {
        return $this->getItemById('${name}_items', $id);
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

}`;
  return modelCode;
}

function generateFrontend(name: string, _Name: string): string {
  return `<?php

class ${name} extends cmsFrontend {

    public const ROUTE_NAME = '${name}';

    protected $useOptions = true;

    public function run() {
        return $this->redirect(href_to(${name}::ROUTE_NAME));
    }

}
`;
}

function generateActionIndex(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Index extends cmsAction {

    public function run($page = 1) {
        $perpage = $this->options['perpage'] ?? 10;

        $total = $this->model->getCountPublished();
        $items = $this->model->getPublished($perpage, ($page - 1) * $perpage);

        $pagination = cmsPagination::getInstance($total, $perpage, $page);

        $this->cms_template->setTitle(LANG_${NAME}_TITLE);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE);

        return $this->cms_template->render('index', [
            'items'      => $items,
            'total'      => $total,
            'pagination' => $pagination,
            'page'       => (int) $page,
            'perpage'    => $perpage,
        ]);
    }

}`;
}

function generateActionView(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}View extends cmsAction {

    public function run($id = 0, $slug = '') {
        $item = $this->model->getItem((int) $id);

        if (!$item || !$item['is_pub']) {
            return cmsCore::error404();
        }

        if ($slug && $slug !== html_uid($item['title'])) {
            return cmsCore::error404();
        }

        $item = cmsEventsManager::hook('${name}_before_item', $item);

        $this->cms_template->setTitle($item['title']);
        $this->cms_template->setMetaDescription($item['description'] ?? '');
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
            return $this->cms_template->render('login_required', [
                'login_url' => href_to('auth', 'login'),
            ]);
        }

        $form = $this->getForm('item');

        $errors = [];

        if ($this->request->has('submit')) {
            $data = $form->parse($this->request, $errors);

            if (!$errors) {
                $data['user_id'] = $this->cms_user->id;
                $data['date_pub'] = date("Y-m-d H:i:s");

                $id = $this->model->addItem($data);

                cmsEventsManager::hook('${name}_after_add', $id, $data);

                $this->redirect(href_to(${name}::ROUTE_NAME, $id));
            }
        }

        $this->cms_template->setTitle(LANG_${NAME}_ADD);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to(${name}::ROUTE_NAME));
        $this->cms_template->addBreadcrumb(LANG_${NAME}_ADD);

        return $this->cms_template->render('add', [
            'form'   => $form,
            'errors' => $errors,
        ]);
    }

}`;
}

function generateActionEdit(name: string, Name: string, NAME: string): string {
  return `<?php

class action${Name}Edit extends cmsAction {

    public function run($id) {
        $item = $this->model->getItem((int) $id);

        if (!$item) {
            return cmsCore::error404();
        }

        if ($item['user_id'] !== $this->cms_user->id && !$this->cms_user->is_admin) {
            return cmsCore::error404();
        }

        $form = $this->getForm('item');

        $errors = [];

        if ($this->request->has('submit')) {
            $data = $form->parse($this->request, $errors);

            if (!$errors) {
                $this->model->updateItem($id, $data);

                cmsEventsManager::hook('${name}_after_update', $id, $data);

                $this->redirect(href_to(${name}::ROUTE_NAME, $id));
            }
        }

        $this->cms_template->setTitle(LANG_${NAME}_EDIT);
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

function generateActionDelete(name: string, Name: string): string {
  return `<?php

class action${Name}Delete extends cmsAction {

    public function run($id) {
        $item = $this->model->getItem((int) $id);

        if (!$item) {
            return cmsCore::error404();
        }

        if ($item['user_id'] !== $this->cms_user->id && !$this->cms_user->is_admin) {
            return cmsCore::error404();
        }

        if ($this->request->has('submit')) {
            $this->model->deleteItem($id);

            cmsEventsManager::hook('${name}_after_delete', $id);

            $this->redirect(href_to(${name}::ROUTE_NAME));
        }

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
        $category = $this->model->getCategoryBySlug($slug);

        if (!$category) {
            return cmsCore::error404();
        }

        $page = $this->request->get('page', 1);
        $perpage = $this->options['perpage'] ?? 10;

        $total = $this->model->getCountByCategory($category['id']);
        $items = $this->model->getByCategory($category['id'], $perpage, ($page - 1) * $perpage);

        $this->cms_template->setTitle($category['title']);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE, href_to(${name}::ROUTE_NAME));
        $this->cms_template->addBreadcrumb($category['title']);

        return $this->cms_template->render('category', [
            'category'   => $category,
            'items'      => $items,
            'total'      => $total,
            'page'       => (int) $page,
            'perpage'    => $perpage,
        ]);
    }

}`;
}

function generateBackend(name: string, Name: string, NAME: string): string {
  return `<?php

class backend${Name} extends cmsBackend {

    public $useDefaultOptionsAction = true;
    protected $useOptions = true;

    public function before($action_name) {
        if (!parent::before($action_name)) {
            return false;
        }
        return true;
    }

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

function generateBackendIndex(name: string, Name: string, _NAME: string): string {
  return `<?php

class action${Name}Index extends cmsAction {

    public function run($do = false) {
        if ($do) {
            return $this->runAction('index_' . $do);
        }

        $stats = [
            'total'     => $this->model->getCount('${name}_items'),
            'published' => $this->model->getCountPublished(),
        ];

        return $this->cms_template->render('backend/index', [
            'stats' => $stats,
        ]);
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
                'href'  => $this->cms_template->href_to('items', 'add'),
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
        $this->success_url = $this->cms_template->href_to('items');

        $this->title = [
            'add'  => LANG_${NAME}_CP_ADD,
            'edit' => '{title}',
        ];

        $this->breadcrumbs = [
            [LANG_${NAME}_CP_ITEMS, $this->cms_template->href_to('items')],
            LANG_${NAME}_CP_ADD,
        ];

        $this->use_default_tool_buttons = true;

        $this->default_item = [
            'is_pub'   => 1,
            'date_pub' => date("Y-m-d H:i:s"),
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
        $this->success_url = $this->cms_template->href_to('items');

        $this->title = [
            'add'  => LANG_${NAME}_CP_ADD,
            'edit' => '{title}',
        ];

        $this->breadcrumbs = [
            [LANG_${NAME}_CP_ITEMS, $this->cms_template->href_to('items')],
            LANG_${NAME}_CP_EDIT,
        ];

        $this->use_default_tool_buttons = true;
    }

}`;
}

function generateBackendItemsDelete(name: string, Name: string): string {
  return `<?php

class action${Name}ItemsDelete extends cmsAction {

    use icms\\traits\\controllers\\actions\\delete\\backend;

    public function __construct($controller, $params = []) {
        parent::__construct($controller, $params);

        $this->table_name  = '${name}_items';
        $this->success_url = $this->cms_template->href_to('items');
    }

}`;
}

function generateGridItems(name: string, _Name: string, _NAME: string): string {
  return `<?php

function grid_items($controller) {
    $columns = [
        'id' => [
            'title'   => 'ID',
            'width'   => 60,
            'show'    => true,
        ],
        'title' => [
            'title'   => LANG_TITLE,
            'filter'  => 'like',
            'href'    => href_to($controller->root_url, 'items', ['edit', '{id}']),
        ],
        'date_pub' => [
            'title'   => LANG_DATE_PUB,
            'width'   => 150,
            'filter'  => 'date',
        ],
        'user_id' => [
            'title'   => LANG_AUTHOR,
            'width'   => 120,
        ],
        'is_pub' => [
            'title'   => LANG_IS_PUB,
            'width'   => 80,
            'flag'    => true,
            'flag_toggle' => href_to($controller->root_url, 'toggle_item', ['{id}', '${name}_items', 'is_pub']),
        ],
    ];

    $actions = [
        [
            'title' => LANG_EDIT,
            'icon'  => 'pen',
            'href'  => href_to($controller->root_url, 'items', ['edit', '{id}']),
        ],
        [
            'title'   => LANG_DELETE,
            'class'   => 'text-danger',
            'icon'    => 'times-circle',
            'confirm' => LANG_DELETE_CONFIRM,
            'href'    => href_to($controller->root_url, 'items', ['delete', '{id}']),
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

function generateFormItem(fields: CrdField[], Name: string, _NAME: string): string {
  let formCode = `<?php

class form${Name}Item extends cmsForm {

    public function init($do) {

        $is_edit = ($do === 'edit');

        return [
            'basic' => [
                'title'  => LANG_CP_BASIC,
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
    if (field.name === 'title' || field.is_system) {
      continue;
    }

    const fieldClass = getFieldClass(field.type);
    const fieldOptions: Record<string, unknown> = {
      title: field.title || capitalize(field.name.replace(/_/g, ' ')),
    };

    if (field.type === 'varchar' || field.type === 'text') {
      fieldOptions.rules = [['max_length', 255]];
    }

    if (field.default !== undefined) {
      fieldOptions.default = field.default;
    }

    const optionsStr = phpValue(fieldOptions);

    formCode += `                    new ${fieldClass}('${field.name}', ${optionsStr}),
`;
  }

  formCode += `                    new fieldCheckbox('is_pub', [
                        'title'   => LANG_IS_PUB,
                        'default' => 1,
                    ]),
                    new fieldDate('date_pub', [
                        'title'   => LANG_DATE_PUB,
                        'default' => date("Y-m-d H:i:s"),
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

function generateLang(name: string, NAME: string, fields: CrdField[]): string {
  let lang = `<?php

define('LANG_${NAME}_TITLE',     '${capitalize(name.replace(/_/g, ' '))}');
define('LANG_${NAME}_ADD',       'Добавить');
define('LANG_${NAME}_EDIT',      'Редактировать');
define('LANG_${NAME}_DELETE',    'Удалить');
define('LANG_${NAME}_NOT_FOUND', 'Ничего не найдено');

define('LANG_${NAME}_CP_TITLE',  'Управление');
define('LANG_${NAME}_CP_ITEMS',  'Элементы');
define('LANG_${NAME}_CP_ADD',    'Добавить элемент');
define('LANG_${NAME}_CP_EDIT',   'Редактирование элемента');
define('LANG_${NAME}_CP_DELETE',  'Удаление элемента');

`;

  for (const field of fields) {
    if (field.is_system) {
      continue;
    }
    const key = `LANG_${NAME}_${field.name.toUpperCase().replace(/_/g, '_')}`;
    const value = field.title || capitalize(field.name.replace(/_/g, ' '));
    lang += `define(${quotePhp(key)}, ${quotePhp(value)});
`;
  }

  lang += `
define('LANG_${NAME}_PERPAGE', 'Элементов на странице');
define('LANG_${NAME}_DATE_FROM', 'Дата от');
define('LANG_${NAME}_DATE_TO', 'Дата до');
`;

  return lang;
}
