import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { defineTool } from '../utils/define-tool.js';
import { scaffoldHook } from '../tools/addon-tool.js';
import {
  listWidgets,
  getWidgetInfo,
  listTraits,
  getTraitInfo,
  listFields,
  getFieldInfo,
  listRoutes,
} from '../tools/source-tool.js';
import { generateMigration, generateFieldSuggestions } from '../tools/migration-tool.js';
import { analyzeRequirement, suggestAddonStructure } from '../tools/requirement-tool.js';

export function registerSourceTools(server: McpServer): void {
  // ═══════════════════════════════════════════════════════════════════════════
  // SOURCE CODE TOOLS (Фаза 2: Виджеты, трейты, поля)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 29. Список виджетов ─────────────────────────────────────────────────
  defineTool(
    server,
    'list_widgets',
    'Список всех доступных виджетов InstantCMS. Можно фильтровать по контроллеру. / Lists all available InstantCMS widgets, filterable by controller.',
    {
      controller: z.string().optional().describe('Фильтр по контроллеру. Пример: content, users'),
    },
    async ({ controller }: any) => listWidgets(controller) as Record<string, unknown>
  );

  // ── 30. Информация о виджете ────────────────────────────────────────────
  defineTool(
    server,
    'get_widget_info',
    'Подробная информация о виджете: класс, файл, настройки. / Returns detailed widget info: class, file, settings.',
    {
      name: z.string().describe('Имя виджета. Пример: text, menu, html'),
    },
    async ({ name }: any) => getWidgetInfo(name) as Record<string, unknown>
  );

  // ── 31. Список трейтов ─────────────────────────────────────────────────
  defineTool(
    server,
    'list_traits',
    'Список всех системных трейтов. Можно фильтровать по namespace. / Lists all system traits. Filterable by namespace.',
    {
      namespace: z
        .string()
        .optional()
        .describe('Фильтр по namespace. Пример: services, controllers'),
    },
    async ({ namespace }: any) => listTraits(namespace) as Record<string, unknown>
  );

  // ── 32. Информация о трейте ────────────────────────────────────────────
  defineTool(
    server,
    'get_trait_info',
    'Подробная информация о трейте: методы, параметры, описание. / Detailed trait info: methods, parameters, description.',
    {
      name: z.string().describe('Имя трейта. Пример: fieldsParseable, listgrid'),
    },
    async ({ name }: any) => getTraitInfo(name) as Record<string, unknown>
  );

  // ── 33. Список типов полей ─────────────────────────────────────────────
  defineTool(
    server,
    'list_field_types',
    'Список всех типов полей для форм InstantCMS: string, text, image, list и др. / Lists all InstantCMS form field types: string, text, image, list and more.',
    {},
    async () => listFields() as Record<string, unknown>
  );

  // ── 34. Информация о поле ─────────────────────────────────────────────
  defineTool(
    server,
    'get_field_type_info',
    'Подробная информация о типе поля: класс, опции, описание. / Detailed field type info: class, options, description.',
    {
      name: z.string().describe('Имя типа поля. Пример: string, list, image, date'),
    },
    async ({ name }: any) => getFieldInfo(name) as Record<string, unknown>
  );

  // ── 35. Список маршрутов ───────────────────────────────────────────────
  defineTool(
    server,
    'list_routes',
    'Список всех маршрутов (routes) системы. Маршруты определяют URL-паттерны и действия контроллеров. / Lists all system routes. Routes define URL patterns and controller actions.',
    {
      controller: z
        .string()
        .optional()
        .describe('Имя контроллера для фильтрации (content, photos)'),
    },
    async ({ controller }: any) => listRoutes(controller) as Record<string, unknown>
  );

  // ── 36. Генерация миграции ────────────────────────────────────────────
  defineTool(
    server,
    'generate_migration',
    'Генерация SQL и PHP кода для создания таблицы. Генерирует install.php, SQL CREATE TABLE и соглашения по именованию. / Generates SQL and PHP code for creating a table: install.php, SQL CREATE TABLE and naming conventions.',
    {
      name: z
        .string()
        .describe('Имя таблицы (без префикса cms_). Пример: my_items, catalog_products'),
      fields: z
        .array(
          z.object({
            name: z.string().describe('Имя поля'),
            type: z
              .string()
              .describe('Тип: varchar(255), text, int(11), datetime, tinyint(1), decimal(10,2)'),
            nullable: z.boolean().optional().describe('Может быть NULL'),
            default: z.string().optional().describe('Значение по умолчанию'),
            comment: z.string().optional().describe('Комментарий к полю'),
          })
        )
        .describe('Массив полей таблицы'),
    },
    async ({ name, fields }: any) => generateMigration(name, fields) as Record<string, unknown>
  );

  // ── 36. Подсказки по полям ────────────────────────────────────────────
  defineTool(
    server,
    'get_field_suggestions',
    'Подсказки по типичным полям для генерации миграций: string, text, number, datetime, user, bool. / Hints for typical migration fields: string, text, number, datetime, user, bool.',
    {
      field_type: z
        .enum(['string', 'text', 'number', 'datetime', 'user', 'bool'])
        .describe('Тип категории полей'),
    },
    async ({ field_type }: any) =>
      generateFieldSuggestions(field_type) as unknown as Record<string, unknown>
  );

  // ── 37. Анализ требований ──────────────────────────────────────────
  defineTool(
    server,
    'analyze_requirement',
    'AI анализ запроса пользователя и предложение структуры дополнения. Определяет тип дополнения, необходимые хуки, таблицы, контроллеры. / AI analysis of a user request suggesting an addon structure. Detects the addon type, required hooks, tables, controllers.',
    {
      requirement: z
        .string()
        .describe(
          "Описание задачи. Пример: 'каталог товаров с корзиной', 'блог с комментариями', 'RSS лента новостей'"
        ),
    },
    async ({ requirement }: any) =>
      analyzeRequirement(requirement) as unknown as Record<string, unknown>
  );

  // ── 38. Структура по типу ─────────────────────────────────────────
  defineTool(
    server,
    'suggest_addon_structure',
    'Предложить структуру файлов для типа дополнения (basic, with_admin, with_hooks, with_routes, with_widget). / Suggests the file structure for an addon type (basic, with_admin, with_hooks, with_routes, with_widget).',
    {
      type: z
        .enum(['basic', 'with_admin', 'with_hooks', 'with_routes', 'with_widget'])
        .describe('Тип дополнения'),
    },
    async ({ type }: any) => suggestAddonStructure(type) as Record<string, unknown>
  );

  // ── 39. Генерация хука ───────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_hook',
    'Генерирует PHP файл хука с полным кодом класса. Автоматически определяет параметры, тип (action/filter), формирует className. / Generates a PHP hook file with full class code. Auto-detects parameters, type (action/filter) and builds the className.',
    {
      addon_name: z.string().describe('Имя дополнения (техническое). Пример: myaddon'),
      hook_name: z
        .string()
        .describe('Имя хука. Пример: content_after_add_approve, user_registered'),
      type: z
        .enum(['action', 'filter'])
        .optional()
        .describe('Тип хука: action (реагирует на событие) или filter (изменяет данные)'),
    },
    async ({ addon_name, hook_name, type }: any) =>
      scaffoldHook({ addon_name, hook_name, type }) as Record<string, unknown>
  );
}
