import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
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
  server.tool(
    'list_widgets',
    'Список всех доступных виджетов InstantCMS. Можно фильтровать по контроллеру.',
    {
      controller: z.string().optional().describe('Фильтр по контроллеру. Пример: content, users'),
    },
    async ({ controller }) => {
      const result = listWidgets(controller);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 30. Информация о виджете ────────────────────────────────────────────
  server.tool(
    'get_widget_info',
    'Подробная информация о виджете: класс, файл, настройки.',
    {
      name: z.string().describe('Имя виджета. Пример: text, menu, html'),
    },
    async ({ name }) => {
      const result = getWidgetInfo(name);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 31. Список трейтов ─────────────────────────────────────────────────
  server.tool(
    'list_traits',
    'Список всех системных трейтов. Можно фильтровать по namespace.',
    {
      namespace: z
        .string()
        .optional()
        .describe('Фильтр по namespace. Пример: services, controllers'),
    },
    async ({ namespace }) => {
      const result = listTraits(namespace);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 32. Информация о трейте ────────────────────────────────────────────
  server.tool(
    'get_trait_info',
    'Подробная информация о трейте: методы, параметры, описание.',
    {
      name: z.string().describe('Имя трейта. Пример: fieldsParseable, listgrid'),
    },
    async ({ name }) => {
      const result = getTraitInfo(name);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 33. Список типов полей ─────────────────────────────────────────────
  server.tool(
    'list_field_types',
    'Список всех типов полей для форм InstantCMS: string, text, image, list и др.',
    {},
    async () => {
      const result = listFields();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 34. Информация о поле ─────────────────────────────────────────────
  server.tool(
    'get_field_type_info',
    'Подробная информация о типе поля: класс, опции, описание.',
    {
      name: z.string().describe('Имя типа поля. Пример: string, list, image, date'),
    },
    async ({ name }) => {
      const result = getFieldInfo(name);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 35. Список маршрутов ───────────────────────────────────────────────
  server.tool(
    'list_routes',
    'Список всех маршрутов (routes) системы. Маршруты определяют URL-паттерны и действия контроллеров.',
    {
      controller: z
        .string()
        .optional()
        .describe('Имя контроллера для фильтрации (content, photos)'),
    },
    async ({ controller }) => {
      const result = listRoutes(controller);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 36. Генерация миграции ────────────────────────────────────────────
  server.tool(
    'generate_migration',
    'Генерация SQL и PHP кода для создания таблицы. Генерирует install.php, SQL CREATE TABLE и соглашения по именованию.',
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
    async ({ name, fields }) => {
      const result = generateMigration(name, fields);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 36. Подсказки по полям ────────────────────────────────────────────
  server.tool(
    'get_field_suggestions',
    'Подсказки по типичным полям для генерации миграций: string, text, number, datetime, user, bool.',
    {
      field_type: z
        .enum(['string', 'text', 'number', 'datetime', 'user', 'bool'])
        .describe('Тип категории полей'),
    },
    async ({ field_type }) => {
      const result = generateFieldSuggestions(field_type);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 37. Анализ требований ──────────────────────────────────────────
  server.tool(
    'analyze_requirement',
    'AI анализ запроса пользователя и предложение структуры дополнения. Определяет тип дополнения, необходимые хуки, таблицы, контроллеры.',
    {
      requirement: z
        .string()
        .describe(
          "Описание задачи. Пример: 'каталог товаров с корзиной', 'блог с комментариями', 'RSS лента новостей'"
        ),
    },
    async ({ requirement }) => {
      const result = analyzeRequirement(requirement);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 38. Структура по типу ─────────────────────────────────────────
  server.tool(
    'suggest_addon_structure',
    'Предложить структуру файлов для типа дополнения (basic, with_admin, with_hooks, with_routes, with_widget).',
    {
      type: z
        .enum(['basic', 'with_admin', 'with_hooks', 'with_routes', 'with_widget'])
        .describe('Тип дополнения'),
    },
    async ({ type }) => {
      const result = suggestAddonStructure(type);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── 39. Генерация хука ───────────────────────────────────────────────
  server.tool(
    'scaffold_hook',
    'Генерирует PHP файл хука с полным кодом класса. Автоматически определяет параметры, тип (action/filter), формирует className.',
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
    async ({ addon_name, hook_name, type }) => {
      const result = scaffoldHook({ addon_name, hook_name, type });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
