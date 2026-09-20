import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { hooks, hookCategories } from '../data/hooks.js';
import { paginate } from '../utils/pagination.js';
import { lazyModule } from '../utils/lazy-module.js';

// components и schemas читаются только в resource-callback'ах — лениво.
const loadComponents = lazyModule<typeof import('../data/components.js')>('../data/components.js');
const loadSchemas = lazyModule<typeof import('../data/schemas.js')>('../data/schemas.js');

export function registerResources(server: McpServer): void {
  // ═══════════════════════════════════════════════════════════════════════════

  server.resource(
    'instantcms-hooks-all',
    'instantcms://hooks/all',
    { mimeType: 'application/json', description: 'Полный список хуков InstantCMS' },
    async () => ({
      contents: [
        {
          uri: 'instantcms://hooks/all',
          mimeType: 'application/json',
          text: JSON.stringify({ total: hooks.length, categories: hookCategories, hooks }, null, 2),
        },
      ],
    })
  );

  server.resource(
    'instantcms-hooks-page',
    new ResourceTemplate('instantcms://hooks/page/{cursor}', { list: undefined }),
    { mimeType: 'application/json', description: 'Страница хуков / Hook page / 钩子分页' },
    async (uri, variables) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            paginate(hooks, {
              cursor: variables.cursor === 'first' ? undefined : String(variables.cursor),
              limit: 50,
            })
          ),
        },
      ],
    })
  );

  server.resource(
    'instantcms-components-page',
    new ResourceTemplate('instantcms://components/page/{cursor}', { list: undefined }),
    {
      mimeType: 'application/json',
      description: 'Страница компонентов / Component page / 组件分页',
    },
    async (uri, variables) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            paginate(loadComponents().components, {
              cursor: variables.cursor === 'first' ? undefined : String(variables.cursor),
              limit: 10,
            })
          ),
        },
      ],
    })
  );

  server.resource(
    'instantcms-components-all',
    'instantcms://components/all',
    { mimeType: 'application/json', description: 'Все компоненты и их API' },
    async () => ({
      contents: [
        {
          uri: 'instantcms://components/all',
          mimeType: 'application/json',
          text: JSON.stringify(
            { total: loadComponents().components.length, components: loadComponents().components },
            null,
            2
          ),
        },
      ],
    })
  );

  server.resource(
    'instantcms-components-summary',
    'instantcms://components/summary',
    {
      mimeType: 'application/json',
      description:
        'Компактный список компонентов: имя, класс, число методов. Полные API — instantcms://components/all или постранично. / Compact component list / 组件紧凑列表',
    },
    async () => ({
      contents: [
        {
          uri: 'instantcms://components/summary',
          mimeType: 'application/json',
          text: JSON.stringify({
            total: loadComponents().components.length,
            components: loadComponents().components.map(component => ({
              name: component.name,
              class: component.class,
              methods: component.methods.length,
              description: component.description.slice(0, 120),
            })),
          }),
        },
      ],
    })
  );

  server.resource(
    'instantcms-hooks-summary',
    'instantcms://hooks/summary',
    {
      mimeType: 'application/json',
      description:
        'Компактный список хуков: имя, категория, тип. Полные данные — instantcms://hooks/all или постранично. / Compact hook list / 钩子紧凑列表',
    },
    async () => ({
      contents: [
        {
          uri: 'instantcms://hooks/summary',
          mimeType: 'application/json',
          text: JSON.stringify({
            total: hooks.length,
            categories: hookCategories,
            hooks: hooks.map(hook => ({
              name: hook.name,
              category: hook.category,
              type: hook.type,
            })),
          }),
        },
      ],
    })
  );

  server.resource(
    'instantcms-addon-types',
    'instantcms://addon/types',
    { mimeType: 'application/json', description: 'Типы дополнений и их структуры' },
    async () => ({
      contents: [
        {
          uri: 'instantcms://addon/types',
          mimeType: 'application/json',
          text: JSON.stringify(loadSchemas().addonStructures, null, 2),
        },
      ],
    })
  );

  server.resource(
    'instantcms-quickstart',
    'instantcms://quickstart',
    { mimeType: 'text/markdown', description: 'Быстрый старт / Quickstart / 快速入门' },
    async () => ({
      contents: [
        {
          uri: 'instantcms://quickstart',
          mimeType: 'text/markdown',
          text: `# Быстрый старт / Quickstart / 快速入门: InstantCMS 2

## 1. Минимальный набор файлов / Minimum files / 最少文件
\`\`\`
manifest.ru.ini
install.sql
install.php
package/system/controllers/myaddon/
├── manifest.xml
├── install.php
├── frontend.php
├── model.php
└── actions/index.php
\`\`\`

## 2. Имена классов / Class names / 类名
| Файл / File / 文件 | Класс / Class / 类 |
|------|-------|
| frontend.php | \`class myaddon extends cmsFrontend\` |
| actions/index.php | \`class actionMyaddonIndex extends cmsAction\` |
| backend.php | \`class backendMyaddon extends cmsBackend\` |
| model.php | \`class modelMyaddon extends cmsModel\` |
| hooks/hook_name.php | \`class onMyaddonHookName extends cmsAction\` |
| forms/form_item.php | \`class formMyaddonItem extends cmsForm\` |
| grids/grid_items.php | \`function grid_items($controller) { return [...]; }\` |
| widgets/list/widget.php | \`class widgetMyaddonList extends cmsWidget\` |

## 3. Action в отдельном файле / Action in a separate file / 独立文件中的 Action
\`\`\`php
<?php
// package/system/controllers/myaddon/actions/index.php
class actionMyaddonIndex extends cmsAction {
    public function run() {
        $items = $this->model->filterEqual('is_pub', 1)->get('myaddon_items');
        return $this->cms_template->render('index', ['items' => $items]);
    }
}
\`\`\`

## 4. Регистрация хука / Hook registration / 注册钩子: manifest.xml
\`\`\`xml
<hooks>
    <hook controller="myaddon" name="content_after_add_approve" />
</hooks>
\`\`\`

## 5. Файл хука / Hook file / 钩子文件: hooks/content_after_add_approve.php
\`\`\`php
<?php
class onMyaddonContentAfterAddApprove extends cmsAction {
    public function run($data) {
        // Логика / Logic / 逻辑
        return $data;
    }
}
\`\`\`

## Инструменты MCP / MCP tools / MCP 工具
- \`scaffold_addon\` — создать файлы / generate files / 生成文件
- \`get_hook_details\` — детали хука / hook details / 钩子详情
- \`get_component_api\` — API класса / class API / 类 API
- \`validate_addon\` — проверить структуру / validate structure / 验证结构
`,
        },
      ],
    })
  );
}
