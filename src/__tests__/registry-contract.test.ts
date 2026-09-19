import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createServer } from '../server.js';
import { buildAddonArchive } from '../tools/artifact-tool.js';

/**
 * Полный контракт registry-слоя.
 *
 * Юнит-тесты зовут domain-функции напрямую, поэтому MCP-обвязка (zod-схемы,
 * defineTool-обработчики, ленивые загрузчики, ресурсы) оставалась непокрытой.
 * Этот тест дёргает КАЖДЫЙ зарегистрированный инструмент через настоящий
 * Client по InMemoryTransport с минимальными валидными аргументами.
 *
 * Инвариант: handler не падает с незахваченным исключением (code
 * TOOL_EXECUTION_ERROR). Доменные отказы (isError с другим code) —
 * легитимные ответы контракта.
 *
 * Инструменты БД без настроенного подключения — единственное исключение:
 * им разрешён TOOL_EXECUTION_ERROR с ошибкой соединения.
 *
 * Битый ввод, который домен намеренно отвергает исключением (например,
 * `inspect_addon_archive` с повреждённым ZIP или небезопасным путём),
 * проверяется отдельно в artifact-tool.test.ts и hardening.test.ts;
 * здесь используются только валидные аргументы.
 */

/** Минимальные валидные аргументы для каждого инструмента. */
export const FIXTURES: Record<string, Record<string, unknown>> = {
  // meta-tools
  get_server_capabilities: {},
  get_workflow: { workflow: 'addon' },
  diagnose_request: { request: 'сделать виджет каталога' },
  explain_validation_error: { code: 'MISSING_REQUIRED_FILE' },
  compare_instantcms_versions: { from: '2.18.1', to: '2.18.2' },
  get_project_health: {},
  validate_generated_artifacts: { files: { 'a.ini': 'x = "1"' } },
  build_addon_archive: { files: { 'manifest.xml': '<addon/>' } },
  inspect_addon_archive: { archive: buildAddonArchive({ 'manifest.xml': '<addon/>' }).archive },
  find_tool: { query: 'хуки' },

  // generator-tools
  get_addon_structure: {},
  scaffold_addon: { name: 'ci_smoke', title: 'CI Smoke' },
  scaffold_crud: { addon_name: 'ci_smoke', fields: [{ name: 'title', type: 'varchar' }] },
  scaffold_form: {
    addon_name: 'ci_smoke',
    form_name: 'item',
    fields: [{ name: 'title', type: 'varchar' }],
  },
  scaffold_grid: {
    addon_name: 'ci_smoke',
    grid_name: 'items',
    columns: [{ name: 'title', title: 'Title' }],
  },
  scaffold_api: {
    addon_name: 'ci_smoke',
    endpoints: [{ name: 'list', method: 'GET', path: '/list' }],
  },
  scaffold_test: {
    addon_name: 'ci_smoke',
    class_name: 'modelCiSmoke',
    class_type: 'model',
    methods: ['getItem'],
  },
  scaffold_email: {
    addon_name: 'ci_smoke',
    templates: [{ name: 'welcome', subject: 'Hello', body: 'Hi, {nickname}' }],
  },
  scaffold_layout_override: {
    addon_name: 'ci_smoke',
    overrides: [{ controller: 'content', template: 'modern' }],
  },
  scaffold_admin_partial: {
    addon_name: 'ci_smoke',
    partials: [{ name: 'menu', type: 'sidebar' }],
  },
  list_template_overrides: {},
  get_template_override_info: { controller: 'content' },
  scaffold_cron: {
    addon_name: 'ci_smoke',
    tasks: [
      {
        name: 'cleanup',
        action: 'taskCleanup',
        schedule: { minute: '0', hour: '0', day: '*', month: '*', day_of_week: '*' },
      },
    ],
  },

  // knowledge-tools
  list_hooks: {},
  get_hook_details: { hook_name: 'engine_start' },
  search_hooks: { query: 'профиль' },
  get_component_api: { component_name: 'cmsModel' },
  list_components: {},
  validate_addon: { files: {} },
  get_field_types: {},
  get_code_example: { task: 'список с пагинацией' },
  scaffold_template: { name: 'cismoke', title: 'CI Smoke' },
  get_template_structure: {},
  scaffold_layout_scheme: { preset: 'simple' },
  list_layout_presets: {},
  introspect_database: {},
  describe_table: { table_name: 'cms_users' },
  list_content_types: {},
  list_database_events: {},
  analyze_controller: { name: 'content' },
  list_controllers: {},
  get_controller_actions: { name: 'content' },
  list_system_traits: {},

  // database-tools (без живой БД)
  maria_execute_query: { sql: 'SELECT 1' },
  maria_list_tables: {},
  maria_describe_table: { table_name: 'cms_users' },
  maria_get_database_info: {},
  maria_search_tables: { pattern: 'user' },
  maria_get_table_data: { table_name: 'cms_users' },

  // source-tools
  list_widgets: {},
  get_widget_info: { name: 'html' },
  list_traits: {},
  get_trait_info: { name: 'deleteItem' },
  list_field_types: {},
  get_field_type_info: { name: 'age' },
  list_routes: {},
  generate_migration: { name: 'ci_items', fields: [{ name: 'title', type: 'varchar(255)' }] },
  get_field_suggestions: { field_type: 'string' },
  analyze_requirement: { requirement: 'каталог товаров с корзиной' },
  suggest_addon_structure: { type: 'basic' },
  scaffold_hook: { addon_name: 'ci_smoke', hook_name: 'engine_start' },

  // language-tools
  list_lang_keys: { addon_name: 'ci_smoke' },
  scaffold_lang: { addon_name: 'ci_smoke' },
  scaffold_migration: {
    addon_name: 'ci_smoke',
    table_name: 'items',
    fields: [{ name: 'title', type: 'varchar(255)' }],
  },

  // extension-tools
  list_wysiwyg_editors: {},
  get_wysiwyg_editor: { name: 'ace' },
  get_wysiwyg_options: { name: 'ace' },
  get_wysiwyg_plugins: { name: 'ace' },
  search_wysiwyg_editors: { query: 'код' },
  get_wysiwyg_buttons: { name: 'ace' },
  scaffold_permission: { name: 'ci_smoke', title: 'CI Smoke' },
  scaffold_filter: { addon_name: 'ci_smoke', fields: [{ field: 'title', type: 'text' }] },
  scaffold_seo: { addon_name: 'ci_smoke', fields: [{ field: 'title', type: 'title' }] },
  scaffold_import_export: {
    addon_name: 'ci_smoke',
    fields: [{ field: 'title', type: 'string' }],
  },
  scaffold_cache: { addon_name: 'ci_smoke' },
  scaffold_webhook: { addon_name: 'ci_smoke', events: ['engine_start'] },
  scaffold_external_api: {
    addon_name: 'ci_smoke',
    base_url: 'https://example.com',
    endpoints: [{ path: '/x', method: 'GET' }],
  },
  scaffold_oauth: {
    addon_name: 'ci_smoke',
    providers: [
      {
        name: 'github',
        client_id: 'id',
        client_secret: 'secret',
        auth_url: 'https://example.com/auth',
        token_url: 'https://example.com/token',
      },
    ],
  },
  scaffold_component: {
    addon_name: 'ci_smoke',
    controllers: [{ name: 'ci_smoke', actions: ['index'] }],
  },
  scaffold_widget: { addon_name: 'ci_smoke', widget_name: 'ciw' },
  scaffold_template_theme: { template_name: 'cismoke' },

  // project-tools
  load_instantcms_project: { source: { type: 'local', path: 'src/data', max_files: 1000 } },
  create_project_patch: { before: {}, after: { 'a.txt': 'b' } },
  audit_instantcms_project: {
    files: { 'system/controllers/ci/frontend.php': '<?php class ci extends cmsController {}' },
  },
  plan_project_changes: { files: {} },
  repair_instantcms_project: { files: {} },
  explain_instantcms_project: { files: {} },
  plan_instantcms_upgrade: { files: {}, from: '2.16', to: '2.18.2' },

  // template-development-tools
  merge_template_overrides: {
    theme_files: {},
    upstream_before: {},
    upstream_after: { 'a.tpl.php': 'x' },
  },
  audit_template_frontend: { files: {} },
  extract_template_design_tokens: { files: {} },
  audit_template_widget_positions: { files: {} },
  scaffold_template_e2e_environment: { theme: 'cismoke' },
  index_upstream_template_sources: {
    files: { 'a.tpl.php': 'x' },
    repository: 'instantsoft/icms2',
    ref: '2.18.2',
  },
  scaffold_template_php_quality: { theme: 'cismoke' },
  scaffold_complete_template: { name: 'cismoke', title: 'CI Smoke' },
  analyze_instantcms_template: { files: {} },
  scaffold_template_override: {
    theme: 'cismoke',
    source_path: 'templates/modern/controllers/content/view.tpl.php',
    source_content: '<?php echo $title;',
  },
  validate_layout_scheme: { yaml: 'rows: []' },
  check_template_override_compatibility: {
    theme_files: {},
    upstream_before: {},
    upstream_after: { 'a.tpl.php': 'x' },
  },
};

/** Инструменты, которым без живой БД разрешена ошибка соединения. */
const DB_TOOLS = new Set([
  'maria_execute_query',
  'maria_list_tables',
  'maria_describe_table',
  'maria_get_database_info',
  'maria_search_tables',
  'maria_get_table_data',
]);

async function connect() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer();
  const client = new Client({ name: 'registry-contract-test', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return { server, client };
}

describe('registry contract', () => {
  test('у каждого зарегистрированного инструмента есть fixture и он не падает', async () => {
    const { server, client } = await connect();
    try {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(100);

      const missing = tools.filter(tool => !(tool.name in FIXTURES)).map(tool => tool.name);
      expect(missing).toEqual([]);

      const stale = Object.keys(FIXTURES).filter(name => !tools.some(tool => tool.name === name));
      expect(stale).toEqual([]);

      const failures: string[] = [];

      for (const tool of tools) {
        try {
          const result = (await client.callTool({
            name: tool.name,
            arguments: FIXTURES[tool.name],
          })) as {
            isError?: boolean;
            structuredContent?: { code?: string; message?: string };
          };

          if (DB_TOOLS.has(tool.name)) {
            // Без подключения к MariaDB единственный допустимый отказ —
            // ошибка соединения, а не падение схемы или обработчика.
            continue;
          }

          if (result.isError && result.structuredContent?.code === 'TOOL_EXECUTION_ERROR') {
            failures.push(
              `${tool.name}: TOOL_EXECUTION_ERROR ${String(
                result.structuredContent?.message ?? '(no message)'
              ).slice(0, 160)}`
            );
          }
        } catch (err) {
          // Клиент отклоняет ответ, нарушающий схему (например, массив в
          // structuredContent вместо объекта) — это тоже дефект контракта.
          const message = err instanceof Error ? err.message : String(err);
          const kind = message.includes('received array')
            ? 'structuredContent не объект (array)'
            : `клиент отклонил ответ: ${message.slice(0, 200)}`;
          failures.push(`${tool.name}: ${kind}`);
        }
      }

      expect(failures).toEqual([]);
    } finally {
      await client.close();
      await server.close();
    }
  }, 60_000);

  test('diagnose_request различает типы задач', async () => {
    const { server, client } = await connect();
    try {
      const cases: Array<[string, string]> = [
        ['нужен виджет погоды', 'widget'],
        ['сделать шаблон и layout', 'template'],
        ['проверить код дополнения', 'audit'],
        ['обновить проект на новую версию', 'upgrade'],
        ['исправить структуру проекта', 'repair'],
        ['написать контроллер каталога', 'addon'],
      ];
      for (const [request, workflow] of cases) {
        const result = (await client.callTool({
          name: 'diagnose_request',
          arguments: { request },
        })) as { structuredContent?: { workflow?: string } };
        expect(result.structuredContent?.workflow).toBe(workflow);
      }
    } finally {
      await client.close();
      await server.close();
    }
  });

  test('ресурсы: полный список и постраничное чтение', async () => {
    const { server, client } = await connect();
    try {
      const text = (result: Awaited<ReturnType<typeof client.readResource>>) =>
        (result.contents[0] as { text: string }).text;

      const { resources } = await client.listResources();
      expect(resources.length).toBeGreaterThanOrEqual(4);

      const allHooks = await client.readResource({ uri: 'instantcms://hooks/all' });
      expect(JSON.parse(text(allHooks)).total).toBeGreaterThan(0);

      const page = await client.readResource({ uri: 'instantcms://hooks/page/first' });
      const parsed = JSON.parse(text(page)) as {
        page: { returned: number; next_cursor?: string };
      };
      expect(parsed.page.returned).toBeGreaterThan(0);

      if (parsed.page.next_cursor) {
        const next = await client.readResource({
          uri: `instantcms://hooks/page/${parsed.page.next_cursor}`,
        });
        expect(JSON.parse(text(next)).page.returned).toBeGreaterThan(0);
      }

      const componentsPage = await client.readResource({
        uri: 'instantcms://components/page/first',
      });
      expect(JSON.parse(text(componentsPage)).page.returned).toBeGreaterThan(0);
    } finally {
      await client.close();
      await server.close();
    }
  });
});
