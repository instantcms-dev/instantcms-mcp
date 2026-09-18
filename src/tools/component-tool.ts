/**
 * @fileoverview Component scaffolding tool for InstantCMS
 * Generates real multi-controller addon packages: frontend, model, backend,
 * actions, routes, language files and templates.
 *
 * Проверено по исходникам InstantCMS 2.18.2:
 * - frontend-контроллер — файл `system/controllers/<ctrl>/frontend.php`,
 *   класс называется ровно `<ctrl>` (`cmsCore::getController()`);
 * - backend — `system/controllers/<ctrl>/backend.php`, класс `backend<Ctrl>`;
 *   `cmsBackend::__construct()` снимает префикс `backend` из имени класса;
 * - модель — `model<Ctrl>` автозагружается из `system/controllers/<ctrl>/model.php`;
 * - экшены — отдельные файлы `actions/<action>.php`, класс
 *   `action` + string_to_camel(controller) + string_to_camel(action);
 * - пакет устанавливается по `manifest.ru.ini` (INI), все каталоги
 *   `system/controllers/*` регистрируются автоматически;
 * - шаблоны — `templates/<theme>/controllers/<ctrl>/<action>.tpl.php`.
 */

import { z } from 'zod';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { quoteIni, quotePhp } from '../utils/serialization';
import { rejectUnsupportedOptions } from '../utils/generator-options';

/**
 * Single controller definition
 */
interface ComponentController {
  /** Controller name */
  name: string;
  /** List of actions */
  actions: string[];
  /** Whether to use model for this controller */
  use_model?: boolean;
}

/**
 * Options for component generation
 */
interface ScaffoldComponentOptions {
  /** System name of the component */
  addon_name: string;
  /** List of controllers */
  controllers?: ComponentController[];
  /** Additional configuration */
  options?: {
    /** Title used in manifest and language files */
    title?: string;
    /** Frontend theme for templates */
    theme?: string;
    /** Generate frontend controller */
    with_frontend?: boolean;
    /** Generate admin backend */
    with_admin?: boolean;
    /** Generate model */
    with_model?: boolean;
    /** Generate routes */
    with_routes?: boolean;
    /** Menu registration: не поддерживается (см. limitations) */
    with_menu?: boolean;
  };
}

const CONTROLLER_NAME = /^[a-z][a-z0-9_]{1,63}$/;
const ACTION_NAME = /^[a-z][a-z0-9_]*$/;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function upperCamel(value: string): string {
  return value
    .split('_')
    .map(part => (part ? capitalize(part) : ''))
    .join('');
}

interface NormalizedController {
  name: string;
  Name: string;
  actions: string[];
  model: boolean;
}

/**
 * Генерирует manifest.ru.ini пакета (INI, а не JSON).
 */
function generateManifest(
  name: string,
  title: string,
  controllers: NormalizedController[]
): string {
  return `[info]
title = ${quoteIni(title)}
description = ${quoteIni(`Компонент ${title}`)}
image_hint =

[version]
major = 1
minor = 0
build = 0

[author]
name = ${quoteIni('Author')}
url = ${quoteIni('https://example.com')}

[install]
type = component
name = ${controllers[0]?.name ?? name}`;
}

function generateFrontend(ctrl: NormalizedController, withRoutes: boolean): string {
  const routeMethod = withRoutes
    ? `
    /**
     * Разбор ЧПУ из routes.php. Ядро вызывает route(), когда экшен по имени
     * не найден (cmsController::executeAction), а parseRoute() кладёт
     * именованные параметры маршрута в request.
     */
    public function route($uri) {

        $action_name = $this->parseRoute($uri);

        if (!$action_name) {
            return cmsCore::error404();
        }

        return $this->runAction($action_name);
    }
`
    : '';

  return `<?php

class ${ctrl.name} extends cmsFrontend {

    public const ROUTE_NAME = ${quotePhp(ctrl.name)};

    protected $useOptions = true;
${routeMethod}}`;
}

function generateRoutes(ctrl: NormalizedController): string {
  return `<?php

function routes_${ctrl.name}() {

    return [
        [
            'pattern' => '/^view\\/(\\d+)$/i',
            'action'  => 'view',
            1         => 'id'
        ],
        [
            'pattern' => '/^page\\/(\\d+)$/i',
            'action'  => 'index',
            1         => 'page'
        ],
        [
            'pattern' => '/^$/',
            'action'  => 'index'
        ]
    ];

}`;
}

function generateModel(ctrl: NormalizedController): string {
  return `<?php

class model${ctrl.Name} extends cmsModel {

    public function getItems(int $limit = 10, int $offset = 0): array {
        return $this->filterEqual('is_pub', 1)
                    ->orderBy('date_pub', 'desc')
                    ->limit($offset, $limit)
                    ->get('${ctrl.name}_items') ?: [];
    }

    public function getCountItems(): int {
        return (int) $this->filterEqual('is_pub', 1)->getCount('${ctrl.name}_items');
    }

    public function findItem($id) {
        return $this->getItemById('${ctrl.name}_items', (int) $id);
    }

    public function addItem(array $data) {
        $data['user_id']  = cmsUser::getInstance()->id;
        $data['date_pub'] = $data['date_pub'] ?? date('Y-m-d H:i:s');

        return $this->insert('${ctrl.name}_items', $data);
    }
}`;
}

function generateBackend(ctrl: NormalizedController): string {
  const NAME = ctrl.name.toUpperCase();
  return `<?php

class backend${ctrl.Name} extends cmsBackend {

    public $useDefaultOptionsAction = true;
    public $useDefaultPermissionsAction = true;

    public function getBackendMenu() {
        return [
            [
                'title'   => LANG_${NAME}_TITLE,
                'url'     => href_to($this->root_url),
                'options' => ['icon' => 'list'],
            ],
        ];
    }
}`;
}

function generateActionIndex(ctrl: NormalizedController): string {
  const NAME = ctrl.name.toUpperCase();
  return `<?php

class action${ctrl.Name}Index extends cmsAction {

    public function run() {

        $items = [];
        if (isset($this->model) && method_exists($this->model, 'getItems')) {
            $items = $this->model->getItems(10, 0);
        }

        $this->cms_template->setPageTitle(LANG_${NAME}_TITLE);
        $this->cms_template->addBreadcrumb(LANG_${NAME}_TITLE);

        return $this->cms_template->render('index', [
            'items'  => $items,
            'action' => 'index',
        ]);
    }
}`;
}

function generateActionView(ctrl: NormalizedController): string {
  return `<?php

class action${ctrl.Name}View extends cmsAction {

    public function run($id = null) {

        $id = (int) $this->request->get('id', $id);

        $item = null;
        if (isset($this->model) && method_exists($this->model, 'findItem')) {
            $item = $this->model->findItem($id);
        }

        if (!$item) {
            return cmsCore::error404();
        }

        $this->cms_template->setPageTitle($item['title']);

        return $this->cms_template->render('view', [
            'item' => $item,
        ]);
    }
}`;
}

function generateActionGeneric(ctrl: NormalizedController, action: string): string {
  const NAME = ctrl.name.toUpperCase();
  return `<?php

class action${ctrl.Name}${upperCamel(action)} extends cmsAction {

    public function run($id = null) {

        $this->cms_template->setPageTitle(LANG_${NAME}_TITLE);

        return $this->cms_template->render(${quotePhp(action)}, [
            'id'     => $id,
            'action' => ${quotePhp(action)},
            'items'  => [],
        ]);
    }
}`;
}

function generateLang(ctrl: NormalizedController, title: string): string {
  const NAME = ctrl.name.toUpperCase();
  const defines = [
    `define('LANG_${NAME}_TITLE', ${quotePhp(title)});`,
    `define('LANG_${NAME}_DESC', ${quotePhp(`Компонент ${title}`)});`,
  ];
  for (const action of ctrl.actions) {
    defines.push(
      `define('LANG_${NAME}_ACTION_${action.toUpperCase()}', ${quotePhp(`${title}: ${action}`)});`
    );
  }
  return `<?php

${defines.join('\n')}
`;
}

function generateTplIndex(ctrl: NormalizedController): string {
  const NAME = ctrl.name.toUpperCase();
  return `<?php
/**
 * @var array $items
 */
?>
<h1><?php echo html(LANG_${NAME}_TITLE); ?></h1>

<?php if ($items) { ?>
    <ul class="list-unstyled mb-4">
        <?php foreach ($items as $item) { ?>
            <li class="mb-2">
                <a href="<?php echo href_to('${ctrl.name}', 'view', $item['id']); ?>">
                    <?php echo html($item['title']); ?>
                </a>
                <span class="text-muted small"><?php echo html_date($item['date_pub'], true); ?></span>
            </li>
        <?php } ?>
    </ul>
<?php } else { ?>
    <p class="text-muted"><?php echo html(LANG_${NAME}_DESC); ?></p>
<?php } ?>
`;
}

function generateTplView(ctrl: NormalizedController): string {
  const NAME = ctrl.name.toUpperCase();
  return `<?php
/**
 * @var array $item
 */
?>
<article>
    <h1><?php echo html($item['title']); ?></h1>

    <div class="text-muted small mb-3"><?php echo html_date($item['date_pub'], true); ?></div>

    <?php if (!empty($item['text'])) { ?>
        <div class="mb-4"><?php echo $item['text']; ?></div>
    <?php } ?>

    <p>
        <a href="<?php echo href_to('${ctrl.name}'); ?>"><?php echo html(LANG_${NAME}_TITLE); ?></a>
    </p>
</article>
`;
}

function generateTplGeneric(ctrl: NormalizedController): string {
  const NAME = ctrl.name.toUpperCase();
  return `<?php
/**
 * @var mixed  $id
 * @var string $action
 */
?>
<h1><?php echo html(LANG_${NAME}_TITLE); ?></h1>

<p>
    <?php echo html($action); ?>
    <?php if ($id !== null) { ?>
        (id: <?php echo (int) $id; ?>)
    <?php } ?>
</p>
`;
}

function generateSql(controllers: NormalizedController[]): string {
  const tables = controllers
    .filter(ctrl => ctrl.model)
    .map(
      ctrl => `CREATE TABLE IF NOT EXISTS \`cms_${ctrl.name}_items\` (
    \`id\`       int(10) unsigned NOT NULL AUTO_INCREMENT,
    \`user_id\`  int(10) unsigned NOT NULL DEFAULT 0,
    \`title\`    varchar(255) NOT NULL DEFAULT '',
    \`text\`     text,
    \`date_pub\` datetime NOT NULL,
    \`is_pub\`   tinyint(1) unsigned NOT NULL DEFAULT 1,
    PRIMARY KEY (\`id\`),
    KEY \`user_id\` (\`user_id\`),
    KEY \`is_pub\` (\`is_pub\`),
    KEY \`date_pub\` (\`date_pub\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    )
    .join('\n\n');

  return `-- Замените cms_ на реальный префикс БД из system/config/config.php
${tables}`;
}

/**
 * install.php: контроллеры пакета регистрирует сам менеджер дополнений
 * (`componentInstall()`), а `install.sql` импортируется автоматически.
 * Здесь только дополнительная инициализация.
 */
function generateInstallPhp(name: string): string {
  return `<?php

/**
 * Дополнительная инициализация при установке пакета ${name}.
 * SQL из install.sql импортируется автоматически, контроллеры регистрирует
 * менеджер дополнений (installer::componentInstall()).
 *
 * @param array $install_options Опции установки из формы пакета
 * @return bool|string true при успехе либо текст ошибки
 */
function install_package(array $install_options = []) {
    cmsCore::loadControllerLanguage(${quotePhp(name)});
    return true;
}

/**
 * Вызывается после завершения установки пакета.
 */
function after_install_package(array $install_options = []) {
    return true;
}`;
}

/**
 * Generates a real multi-controller component package for InstantCMS.
 *
 * @param opts - Configuration options for the component
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldComponent({
 *   addon_name: 'board',
 *   controllers: [{ name: 'board', actions: ['index', 'view'], use_model: true }],
 *   options: { with_frontend: true, with_model: true, with_routes: true }
 * });
 * ```
 */
export function scaffoldComponent(opts: ScaffoldComponentOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_component', opts.options, {
    with_menu:
      'пункты меню регистрируются страницами/настройками сайта, а не файлом menu.php; добавьте их после установки',
  });

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);

  const options = {
    title: opts.options?.title ?? UpperCamelCase,
    theme: opts.options?.theme ?? 'modern',
    with_frontend: opts.options?.with_frontend ?? true,
    with_admin: opts.options?.with_admin ?? true,
    with_model: opts.options?.with_model ?? true,
    with_routes: opts.options?.with_routes ?? true,
  };

  const rawControllers =
    opts.controllers && opts.controllers.length
      ? opts.controllers
      : [{ name: lowercase, actions: ['index', 'view'], use_model: true }];

  const seen = new Set<string>();
  const controllers: NormalizedController[] = rawControllers.map(controller => {
    if (!CONTROLLER_NAME.test(controller.name)) {
      throw new Error(
        `component: неверное имя контроллера «${controller.name}» — нужны строчные латинские буквы, цифры и _`
      );
    }
    if (seen.has(controller.name)) {
      throw new Error(`component: контроллер «${controller.name}» указан дважды`);
    }
    seen.add(controller.name);

    const actions = Array.from(
      new Set(
        (controller.actions?.length ? controller.actions : ['index']).map(a => a.toLowerCase())
      )
    );
    for (const action of actions) {
      if (!ACTION_NAME.test(action) || action === 'route') {
        throw new Error(
          `component: неверное имя экшена «${action}» у контроллера ${controller.name}`
        );
      }
    }

    const model =
      controller.use_model === true || (controller.use_model !== false && options.with_model);

    return { name: controller.name, Name: upperCamel(controller.name), actions, model };
  });

  const files: Record<string, string> = {};

  files['[pkg] manifest.ru.ini'] = generateManifest(lowercase, options.title, controllers);
  files['[pkg] install.php'] = generateInstallPhp(lowercase);

  const sql = generateSql(controllers);
  if (sql.includes('CREATE TABLE')) {
    files['[pkg] install.sql'] = sql;
  }

  for (const ctrl of controllers) {
    const ctrlPath = `package/system/controllers/${ctrl.name}`;

    if (options.with_frontend) {
      files[`${ctrlPath}/frontend.php`] = generateFrontend(ctrl, options.with_routes);

      if (options.with_routes) {
        files[`${ctrlPath}/routes.php`] = generateRoutes(ctrl);
      }

      for (const action of ctrl.actions) {
        if (action === 'index') {
          files[`${ctrlPath}/actions/index.php`] = generateActionIndex(ctrl);
        } else if (action === 'view') {
          files[`${ctrlPath}/actions/view.php`] = generateActionView(ctrl);
        } else {
          files[`${ctrlPath}/actions/${action}.php`] = generateActionGeneric(ctrl, action);
        }

        const tpl =
          action === 'index'
            ? generateTplIndex(ctrl)
            : action === 'view'
              ? generateTplView(ctrl)
              : generateTplGeneric(ctrl);
        files[`package/templates/${options.theme}/controllers/${ctrl.name}/${action}.tpl.php`] =
          tpl;
      }
    }

    if (ctrl.model) {
      files[`${ctrlPath}/model.php`] = generateModel(ctrl);
    }

    if (options.with_admin) {
      files[`${ctrlPath}/backend.php`] = generateBackend(ctrl);
    }

    files[`package/system/languages/ru/controllers/${ctrl.name}/${ctrl.name}.php`] = generateLang(
      ctrl,
      options.title
    );
  }

  return {
    addon_name: lowercase,
    files,
    controllers_count: controllers.length,
    controllers: controllers.map(ctrl => ({
      name: ctrl.name,
      class: ctrl.name,
      model_class: ctrl.model ? `model${ctrl.Name}` : null,
      backend_class: options.with_admin ? `backend${ctrl.Name}` : null,
      actions: ctrl.actions,
      table: ctrl.model ? `${ctrl.name}_items` : null,
    })),
    options,
    supported_options: [
      'title',
      'theme',
      'with_frontend',
      'with_admin',
      'with_model',
      'with_routes',
    ],
    structure_notes: [
      `Один пакет — много контроллеров: system/controllers/<ctrl>/{frontend.php,model.php,backend.php,actions/*.php}`,
      'Frontend-класс называется ровно как контроллер, backend — backend<Ctrl>',
      `Шаблоны: templates/${options.theme}/controllers/<ctrl>/<action>.tpl.php`,
      `Языковые файлы: system/languages/ru/controllers/<ctrl>/<ctrl>.php`,
      'Манифест пакета — manifest.ru.ini; все каталоги system/controllers/* регистрируются менеджером дополнений',
    ],
    limitations: [
      'Backend-класс генерируется без экшенов и шаблонов: добавьте нужные backend/actions/*.php и шаблоны admincoreui.',
      'Экшены, кроме index/view, отдают заготовку: реализуйте логику под конкретный сценарий.',
      options.with_routes
        ? 'ЧПУ покрывает только index/view; для своих правил дополните routes.php и метод route().'
        : 'Routes не создавались (with_routes: false): доступ по /<ctrl>/<action>/<params>.',
      'Регистрация пунктов меню не генерируется (with_menu отклоняется).',
    ],
  };
}

export const componentToolSchema = {
  name: 'scaffold_component',
  description: 'Генерация полного компонента InstantCMS с backend, frontend, model',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя компонента' },
      controllers: z
        .array(
          z.object({
            name: z.string().describe('Имя контроллера'),
            actions: z.array(z.string()).describe('Экшены'),
            use_model: z.boolean().optional().describe('Использовать модель'),
          })
        )
        .optional()
        .describe('Контроллеры'),
      options: z
        .object({
          title: z.string().optional().describe('Название компонента'),
          theme: z.string().optional().describe('Тема для шаблонов (по умолчанию modern)'),
          with_frontend: z.boolean().optional().describe('С frontend'),
          with_admin: z.boolean().optional().describe('С админкой'),
          with_model: z.boolean().optional().describe('С моделью'),
          with_routes: z.boolean().optional().describe('С роутами'),
          with_menu: z.boolean().optional().describe('Не поддерживается: отклоняется'),
        })
        .optional()
        .describe('Опции'),
    },
    required: ['addon_name'],
  },
  inputExamples: [
    {
      addon_name: 'board',
      controllers: [{ name: 'board', actions: ['index', 'view'], use_model: true }],
      options: { with_frontend: true, with_model: true, with_routes: true },
    },
  ],
};
