import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { hooks, hookCategories } from '../data/hooks.js';
import { components } from '../data/components.js';
import { addonStructures } from '../data/schemas.js';

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
    'instantcms-components-all',
    'instantcms://components/all',
    { mimeType: 'application/json', description: 'Все компоненты и их API' },
    async () => ({
      contents: [
        {
          uri: 'instantcms://components/all',
          mimeType: 'application/json',
          text: JSON.stringify({ total: components.length, components }, null, 2),
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
          text: JSON.stringify(addonStructures, null, 2),
        },
      ],
    })
  );

  server.resource(
    'instantcms-quickstart',
    'instantcms://quickstart',
    { mimeType: 'text/markdown', description: 'Краткое руководство по созданию дополнения' },
    async () => ({
      contents: [
        {
          uri: 'instantcms://quickstart',
          mimeType: 'text/markdown',
          text: `# Быстрый старт: создание дополнения InstantCMS 2

## 1. Минимальный набор файлов
\`\`\`
/system/controllers/myaddon/
├── manifest.xml      ← метаданные и хуки
├── install.php       ← создание таблиц
├── uninstall.php     ← удаление таблиц
├── frontend.php      ← контроллер (class myaddon extends cmsFrontend)
└── model.php         ← модель (class modelMyaddon extends cmsModel)
\`\`\`

## 2. Соглашения об именовании классов
| Файл | Класс |
|------|-------|
| frontend.php | \`class myaddon extends cmsFrontend\` |
| backend.php | \`class backendMyaddon extends cmsBackend\` |
| model.php | \`class modelMyaddon extends cmsModel\` |
| hooks/hook_name.php | \`class onMyaddonHookName extends cmsAction\` |
| forms/form_item.php | \`class formMyaddonItem extends cmsForm\` |
| grids/grid_items.php | \`function grid_items($controller) { return [...]; }\` |
| widgets/list/widget.php | \`class widgetMyaddonList extends cmsWidget\` |

## 3. Базовый паттерн action
\`\`\`php
public function actionIndex() {
    $items = $this->model->filterEqual('is_pub', 1)->get('myaddon_items');
    return $this->cms_template->render('index', ['items' => $items]);
}
\`\`\`

## 4. Регистрация хука в manifest.xml
\`\`\`xml
<hooks>
    <hook controller="myaddon" name="content_after_add_approve" />
</hooks>
\`\`\`

## 5. Файл хука hooks/content_after_add_approve.php
\`\`\`php
class onMyaddonContentAfterAddApprove extends cmsAction {
    public function run($data) {
        // логика
        return $data; // ОБЯЗАТЕЛЬНО
    }
}
\`\`\`

## Инструменты MCP
- \`scaffold_addon\` — сгенерировать все файлы дополнения
- \`get_hook_details\` — детали хука с примером кода
- \`get_component_api\` — API класса (cmsModel, cmsTemplate и др.)
- \`validate_addon\` — проверить корректность структуры
`,
        },
      ],
    })
  );
}
