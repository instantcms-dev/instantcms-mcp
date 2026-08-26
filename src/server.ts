import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { listHooks, getHookDetails, searchHooks } from './tools/hooks-tool.js';
import {
  getAddonStructure,
  getComponentApi,
  listComponents,
  validateAddon,
  getFieldTypes,
  getCodeExample,
  scaffoldHook,
} from './tools/addon-tool.js';
import { scaffoldAddon, scaffoldTemplate } from './tools/scaffold-tool.js';
import { scaffoldLayoutScheme, listLayoutPresets, layoutPresets } from './tools/layout-tool.js';
import {
  introspectDatabase,
  listContentTypes,
  listDatabaseEvents,
  describeTable,
} from './tools/db-tool.js';
import {
  analyzeController,
  listControllers,
  getControllerActionsList,
  listSystemTraits,
} from './tools/controllers-tool.js';
import {
  mariaExecuteQuery,
  mariaListTables,
  mariaDescribeTable,
  mariaGetDatabaseInfo,
  mariaSearchTables,
  mariaGetTableData,
} from './tools/maria-tool.js';
import {
  listWidgets,
  getWidgetInfo,
  listTraits,
  getTraitInfo,
  listFields,
  getFieldInfo,
  listRoutes,
} from './tools/source-tool.js';
import {
  listWysiwygEditors,
  getWysiwygEditor,
  getWysiwygOptions,
  getWysiwygPlugins,
  searchWysiwygEditors,
  getWysiwygButtons,
} from './tools/wysiwyg-tool.js';
import {
  generateMigration,
  generateFieldSuggestions,
  scaffoldMigration,
} from './tools/migration-tool.js';
import { listLangKeys, scaffoldLang } from './tools/lang-tool.js';
import { scaffoldCrud } from './tools/crud-tool.js';
import { scaffoldForm } from './tools/form-tool.js';
import { scaffoldGrid } from './tools/grid-tool.js';
import { scaffoldApi } from './tools/api-tool.js';
import { scaffoldTest } from './tools/test-tool.js';
import { scaffoldEmail } from './tools/email-tool.js';
import { scaffoldLayoutOverride } from './tools/layout-override-tool.js';
import { scaffoldAdminPartial } from './tools/admin-partial-tool.js';
import { listTemplateOverrides, getTemplateOverrideInfo } from './tools/template-overrides-tool.js';
import { scaffoldCron } from './tools/cron-tool.js';
import { scaffoldPermission } from './tools/permission-tool.js';
import { scaffoldFilter } from './tools/filter-tool.js';
import { scaffoldSeo } from './tools/seo-tool.js';
import { scaffoldImportExport } from './tools/import-export-tool.js';
import { scaffoldCache } from './tools/cache-tool.js';
import { scaffoldWebhook } from './tools/webhook-tool.js';
import { scaffoldExternalApi } from './tools/external-api-tool.js';
import { scaffoldOAuth } from './tools/oauth-tool.js';
import { scaffoldComponent } from './tools/component-tool.js';
import { scaffoldWidget } from './tools/widget-tool.js';
import { scaffoldTemplate as scaffoldTheme } from './tools/template-tool.js';
import { analyzeRequirement, suggestAddonStructure } from './tools/requirement-tool.js';

import { hooks, hookCategories } from './data/hooks.js';
import { components } from './data/components.js';
import { addonStructures, templateStructure } from './data/schemas.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'instantcms-mcp',
    version: '1.1.0',
    description: 'MCP сервер для разработки дополнений и шаблонов InstantCMS 2',
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 1. Структура дополнения ──────────────────────────────────────────────
  server.tool(
    'get_addon_structure',
    'Возвращает полную структуру файлов и папок для дополнения InstantCMS с описанием каждого файла и шаблонами кода',
    {
      addon_type: z
        .enum(['basic', 'with_admin', 'with_hooks', 'with_routes', 'with_widget'])
        .default('basic')
        .describe(
          'Тип дополнения: basic (только фронтенд), with_admin (с CRUD панелью), with_hooks (с хуками), with_routes (кастомные URL), with_widget (с виджетом)'
        ),
    },
    async ({ addon_type }) => {
      const result = getAddonStructure(addon_type);
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

  // ── 2. Генерация скаффолда дополнения ────────────────────────────────────
  server.tool(
    'scaffold_addon',
    'Генерирует готовый код всех файлов дополнения InstantCMS на основе параметров. Возвращает map {имя_файла: содержимое}',
    {
      name: z
        .string()
        .regex(/^[a-z][a-z0-9_]{1,63}$/)
        .describe('Техническое имя: 2–64 строчных латинских символа, цифры и подчёркивания'),
      title: z.string().trim().min(1).max(200).describe('Отображаемое название дополнения'),
      type: z
        .enum(['basic', 'with_admin', 'with_hooks', 'with_routes', 'with_widget'])
        .default('basic')
        .describe('Тип дополнения'),
      author: z.string().trim().min(1).max(200).optional().describe('Имя автора'),
      author_url: z.string().url().optional().describe('URL сайта автора'),
      version: z
        .string()
        .regex(/^\d+\.\d+\.\d+$/)
        .optional()
        .default('1.0.0')
        .describe('Версия X.Y.Z'),
      description: z.string().trim().max(1000).optional().describe('Описание дополнения'),
      hooks: z
        .array(z.string().refine(value => hooks.some(h => h.name === value), 'Неизвестный хук'))
        .max(100)
        .optional()
        .describe(
          "Список хуков для интеграции. Пример: ['content_after_add_approve', 'user_registered']"
        ),
    },
    async opts => {
      const result = scaffoldAddon(opts as Parameters<typeof scaffoldAddon>[0]);
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

  // ── 2.1. Генерация CRUD для контент-типа ─────────────────────────────────
  server.tool(
    'scaffold_crud',
    'Генерирует полный CRUD для контент-типа InstantCMS: модель, контроллеры фронтенда и бэкенда, гриды, формы',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_crud'),
      fields: z
        .array(
          z.object({
            name: z.string().describe('Имя поля БД. Пример: title'),
            type: z.string().describe('Тип поля: varchar, text, html, int, date, etc.'),
            title: z.string().optional().describe('Заголовок поля для формы'),
            comment: z.string().optional().describe('Комментарий поля'),
            is_system: z.boolean().optional().describe('Системное поле'),
            default: z
              .union([z.string(), z.number(), z.boolean()])
              .optional()
              .describe('Значение по умолчанию'),
            key: z.string().optional().describe('Ключ: MUL, PRI, etc.'),
          })
        )
        .describe('Список полей таблицы'),
      options: z
        .object({
          use_category: z.boolean().optional().describe('Использовать категории'),
          use_tags: z.boolean().optional().describe('Использовать теги'),
          use_comments: z.boolean().optional().describe('Использовать комментарии'),
          use_rating: z.boolean().optional().describe('Использовать рейтинг'),
          use_moderation: z.boolean().optional().describe('Использовать модерацию'),
          use_seo: z.boolean().optional().describe('Использовать SEO'),
          use_content: z.boolean().optional().describe('Использовать контент-тип'),
          list_template: z.enum(['grid', 'list', 'table']).optional().describe('Шаблон списка'),
        })
        .optional()
        .describe('Дополнительные опции'),
    },
    async opts => {
      const result = scaffoldCrud(opts as Parameters<typeof scaffoldCrud>[0]);
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

  // ── 2.2. Генерация формы ──────────────────────────────────────────────────
  server.tool(
    'scaffold_form',
    'Генерирует PHP класс формы для бэкенда InstantCMS с указанными полями и правилами валидации',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_addon'),
      form_name: z
        .string()
        .describe('Имя формы (без префикса form_). Пример: item, options, profile'),
      fields: z
        .array(
          z.object({
            name: z.string().describe('Имя поля. Пример: title, content, price'),
            type: z
              .string()
              .describe(
                'Тип поля: varchar, text, html, int, date, datetime, checkbox, select, file, image, user, etc.'
              ),
            title: z.string().optional().describe('Заголовок поля в форме'),
            rules: z
              .array(z.union([z.string(), z.array(z.unknown())]))
              .optional()
              .describe("Правила валидации: [['required'], ['max_length', 255]]"),
            options: z
              .record(z.string(), z.unknown())
              .optional()
              .describe('Дополнительные опции поля'),
            is_system: z.boolean().optional().describe("Добавить в секцию 'system' вместо 'basic'"),
          })
        )
        .describe('Список полей формы'),
      options: z
        .object({
          use_tabs: z.boolean().optional().describe('Использовать табы для группировки полей'),
          use_separate_save: z
            .boolean()
            .optional()
            .describe('Генерировать отдельный класс для сохранения'),
          generate_rules: z
            .boolean()
            .optional()
            .describe('Автоматически генерировать правила валидации'),
        })
        .optional()
        .describe('Опции формы'),
    },
    async opts => {
      const result = scaffoldForm(opts as Parameters<typeof scaffoldForm>[0]);
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

  // ── 2.3. Генерация грида ──────────────────────────────────────────────────
  server.tool(
    'scaffold_grid',
    'Генерирует PHP функцию грида для бэкенда InstantCMS с колонками, фильтрами и экшенами',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_addon'),
      grid_name: z
        .string()
        .describe('Имя грида (без префикса grid_). Пример: items, products, orders'),
      columns: z
        .array(
          z.object({
            name: z.string().describe('Имя колонки. Пример: title, date_pub, is_pub'),
            title: z.string().describe('Заголовок колонки'),
            width: z.number().optional().describe('Ширина колонки в пикселях'),
            filter: z.string().optional().describe('Тип фильтра: like, eq, gt, lt, date, etc.'),
            href: z
              .string()
              .optional()
              .describe(
                "URL для клика по ссылке. Пример: href_to($controller->root_url, 'items', ['edit', '{id}'])"
              ),
            show: z.boolean().optional().describe('Показывать колонку по умолчанию'),
            flag: z.boolean().optional().describe('Отображать как флаг (вкл/выкл)'),
            flag_toggle: z.string().optional().describe('URL для переключения флага'),
            handler: z
              .string()
              .optional()
              .describe('PHP функция-обработчик значения: function ($value) { return ...; }'),
            order_by: z.boolean().optional().describe('Разрешить сортировку по этой колонке'),
          })
        )
        .describe('Колонки грида'),
      options: z
        .object({
          is_sortable: z.boolean().optional().describe('Включить сортировку'),
          is_filter: z.boolean().optional().describe('Включить фильтры'),
          is_pagination: z.boolean().optional().describe('Включить пагинацию'),
          is_draggable: z.boolean().optional().describe('Включить drag-n-drop сортировку'),
          is_selectable: z.boolean().optional().describe('Включить чекбоксы для массовых операций'),
          is_collapsible: z
            .boolean()
            .optional()
            .describe('Позволить пользователям сворачивать колонки'),
          order_by: z.string().optional().describe('Поле сортировки по умолчанию'),
          order_to: z
            .enum(['asc', 'desc'])
            .optional()
            .describe('Направление сортировки по умолчанию'),
          show_id: z.boolean().optional().describe('Показывать колонку ID'),
          filter_button_title: z.string().optional().describe('Текст кнопки фильтра'),
        })
        .optional()
        .describe('Опции грида'),
      actions: z
        .array(
          z.object({
            title: z.string().describe('Заголовок кнопки. Пример: EDIT, DELETE'),
            href: z
              .string()
              .describe(
                "URL экшена. Пример: href_to($controller->root_url, 'items', ['edit', '{id}'])"
              ),
            icon: z.string().optional().describe('Иконка: pen, times-circle, eye, etc.'),
            class: z.string().optional().describe('Дополнительные CSS классы. Пример: text-danger'),
            confirm: z.string().optional().describe('Текст подтверждения действия'),
          })
        )
        .optional()
        .describe('Кнопки действий'),
    },
    async opts => {
      const result = scaffoldGrid(opts as Parameters<typeof scaffoldGrid>[0]);
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

  // ── 2.4. Генерация REST API ──────────────────────────────────────────────
  server.tool(
    'scaffold_api',
    'Генерирует REST API контроллер для InstantCMS с эндпоинтами, аутентификацией и опционально OpenAPI спецификацией',
    {
      addon_name: z.string().describe('Техническое имя API. Пример: my_api'),
      version: z.string().optional().default('v1').describe('Версия API. Пример: v1, v2'),
      endpoints: z
        .array(
          z.object({
            name: z.string().describe('Имя эндпоинта. Пример: list, get, create, update, delete'),
            method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).describe('HTTP метод'),
            path: z.string().describe('Путь эндпоинта. Пример: /list, /{id}, /search'),
            description: z.string().optional().describe('Описание эндпоинта'),
            auth_required: z.boolean().optional().describe('Требуется ли аутентификация'),
            params: z
              .array(
                z.object({
                  name: z.string().describe('Имя параметра'),
                  type: z.enum(['path', 'query', 'body']).describe('Тип параметра'),
                  required: z.boolean().optional().describe('Обязательный параметр'),
                  description: z.string().optional().describe('Описание параметра'),
                })
              )
              .optional()
              .describe('Параметры эндпоинта'),
          })
        )
        .describe('Список эндпоинтов API'),
      options: z
        .object({
          use_swagger: z.boolean().optional().describe('Генерировать OpenAPI спецификацию'),
          use_rate_limit: z.boolean().optional().describe('Включить rate limiting'),
          base_path: z
            .string()
            .optional()
            .describe('Базовая часть пути. По умолчанию: /api/{version}/{addon_name}'),
        })
        .optional()
        .describe('Опции API'),
    },
    async opts => {
      const result = scaffoldApi(opts as Parameters<typeof scaffoldApi>[0]);
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

  // ── 2.5. Генерация тестов ─────────────────────────────────────────────────
  server.tool(
    'scaffold_test',
    'Генерирует PHPUnit или Codeception тесты для дополнения InstantCMS',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_addon'),
      class_name: z.string().describe('Имя тестируемого класса. Пример: modelMyaddon'),
      class_type: z.enum(['model', 'controller', 'component', 'widget']).describe('Тип класса'),
      methods: z.array(z.string()).describe('Список методов для тестирования'),
      options: z
        .object({
          test_framework: z
            .enum(['phpunit', 'codeception'])
            .optional()
            .default('phpunit')
            .describe('Фреймворк для тестов'),
          mock_db: z.boolean().optional().default(true).describe('Создавать мок для базы данных'),
          mock_cache: z.boolean().optional().default(true).describe('Создавать мок для кэша'),
        })
        .optional()
        .describe('Опции генерации тестов'),
    },
    async opts => {
      const result = scaffoldTest(opts as Parameters<typeof scaffoldTest>[0]);
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

  // ── 2.6. Генерация email шаблонов ───────────────────────────────────────
  server.tool(
    'scaffold_email',
    'Генерирует HTML email шаблоны для уведомлений InstantCMS с переменными и стилями',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_addon'),
      templates: z
        .array(
          z.object({
            name: z.string().describe('Имя шаблона. Пример: welcome, notification, reminder'),
            subject: z.string().describe('Тема письма'),
            body: z
              .string()
              .describe('Тело письма с поддержкой переменных {user_name}, {site_name}, etc.'),
            variables: z
              .array(
                z.object({
                  name: z.string().describe('Имя переменной'),
                  description: z.string().optional().describe('Описание переменной'),
                  example: z.string().optional().describe('Пример значения'),
                })
              )
              .optional()
              .describe('Список переменных в шаблоне'),
          })
        )
        .describe('Список email шаблонов'),
      options: z
        .object({
          use_html: z.boolean().optional().default(true).describe('Использовать HTML разметку'),
          base_template: z
            .enum(['default', 'minimal', 'notifications'])
            .optional()
            .default('default')
            .describe('Базовый шаблон стилей'),
        })
        .optional()
        .describe('Опции email'),
    },
    async opts => {
      const result = scaffoldEmail(opts as Parameters<typeof scaffoldEmail>[0]);
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

  // ── 2.7. Генерация переопределений шаблонов ──────────────────────────────
  server.tool(
    'scaffold_layout_override',
    'Генерирует шаблоны для переопределения стандартных шаблонов контроллеров InstantCMS в пользовательских темах',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_overrides'),
      overrides: z
        .array(
          z.object({
            controller: z.string().describe('Имя контроллера. Пример: content, users, photos'),
            template: z.string().describe('Имя темы для переопределения. Пример: modern, default'),
            action: z
              .string()
              .optional()
              .describe('Имя экшена. Если не указано - переопределяется index'),
          })
        )
        .describe('Список переопределений'),
      options: z
        .object({
          use_wrapper: z.boolean().optional().describe('Добавить обёртку с сайдбаром'),
          add_breadcrumbs: z.boolean().optional().describe('Добавить хлебные крошки'),
        })
        .optional()
        .describe('Опции генерации'),
    },
    async opts => {
      const result = scaffoldLayoutOverride(opts as Parameters<typeof scaffoldLayoutOverride>[0]);
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

  // ── 2.8. Генерация частей админки ─────────────────────────────────────────
  server.tool(
    'scaffold_admin_partial',
    'Генерирует переиспользуемые части интерфейса админки: header, sidebar, toolbar, breadcrumbs, panels, modals',
    {
      addon_name: z.string().describe('Техническое имя набора. Пример: my_partials'),
      partials: z
        .array(
          z.object({
            name: z.string().describe('Имя части. Пример: menu, header, footer'),
            type: z
              .enum([
                'header',
                'sidebar',
                'footer',
                'toolbar',
                'breadcrumb',
                'panel',
                'modal',
                'notification',
              ])
              .describe('Тип части'),
            items: z.array(z.string()).optional().describe('Элементы меню или списка'),
          })
        )
        .describe('Список частей для генерации'),
      options: z
        .object({
          use_bootstrap: z
            .boolean()
            .optional()
            .default(true)
            .describe('Использовать Bootstrap классы'),
          use_icms_icons: z.boolean().optional().default(true).describe('Использовать иконки ICMS'),
        })
        .optional()
        .describe('Опции генерации'),
    },
    async opts => {
      const result = scaffoldAdminPartial(opts as Parameters<typeof scaffoldAdminPartial>[0]);
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

  // ── 2.9. Список переопределений шаблонов ──────────────────────────────────
  server.tool(
    'list_template_overrides',
    'Возвращает список всех доступных переопределений шаблонов контроллеров InstantCMS',
    {
      controller: z
        .string()
        .optional()
        .describe('Фильтр по имени контроллера. Пример: content, users, photos'),
    },
    async ({ controller }) => {
      const result = listTemplateOverrides(controller);
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

  // ── 2.10. Информация о переопределении ──────────────────────────────────
  server.tool(
    'get_template_override_info',
    'Возвращает подробную информацию о конкретном переопределении шаблона',
    {
      controller: z.string().describe('Имя контроллера. Пример: content, users'),
      action: z
        .string()
        .optional()
        .describe(
          'Имя экшена. Пример: view, index. Если не указано - возвращает информацию о index'
        ),
    },
    async ({ controller, action }) => {
      const result = getTemplateOverrideInfo(controller, action);
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

  // ── 2.11. Генерация cron задач ───────────────────────────────────────────
  server.tool(
    'scaffold_cron',
    'Генерирует PHP cron контроллер для периодических задач с настройкой расписания, блокировками и логированием',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_cron'),
      tasks: z
        .array(
          z.object({
            name: z.string().describe('Имя задачи. Пример: cleanup, send_emails, sync_data'),
            schedule: z
              .object({
                minute: z
                  .string()
                  .optional()
                  .describe('Минуты (0-59, * или */n). Пример: 0, */15, 30'),
                hour: z.string().optional().describe('Часы (0-23, * или */n). Пример: 0, */2, 12'),
                day: z
                  .string()
                  .optional()
                  .describe('День месяца (1-31, * или */n). Пример: 1, */7'),
                month: z.string().optional().describe('Месяц (1-12, * или */n). Пример: 1, */3'),
                day_of_week: z
                  .string()
                  .optional()
                  .describe('День недели (0-6, *). Пример: 0 (воскр), 1-5'),
              })
              .describe('Расписание в формате cron'),
            description: z.string().optional().describe('Описание задачи'),
            action: z.string().describe('Имя PHP функции для выполнения. Пример: taskCleanup'),
          })
        )
        .describe('Список cron задач'),
      options: z
        .object({
          use_lock_file: z
            .boolean()
            .optional()
            .default(true)
            .describe('Блокировка от повторного запуска'),
          log_execution: z.boolean().optional().default(true).describe('Логирование выполнения'),
        })
        .optional()
        .describe('Опции cron'),
    },
    async opts => {
      const result = scaffoldCron(opts as Parameters<typeof scaffoldCron>[0]);
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

  // ── 3. Список хуков ──────────────────────────────────────────────────────
  server.tool(
    'list_hooks',
    'Список всех доступных хуков InstantCMS с краткими описаниями. Поддерживает фильтрацию по категории и типу',
    {
      category: z
        .string()
        .optional()
        .describe(`Фильтр по категории. Доступные: ${hookCategories.join(', ')}`),
      type: z
        .enum(['filter', 'action'])
        .optional()
        .describe('Тип хука: filter (изменяет данные) или action (реагирует на событие)'),
    },
    async ({ category, type }) => {
      const result = listHooks(category, type);
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

  // ── 4. Детали хука ───────────────────────────────────────────────────────
  server.tool(
    'get_hook_details',
    'Подробная информация о конкретном хуке: параметры, возвращаемый тип, пример реализации, как зарегистрировать в manifest.xml',
    {
      hook_name: z
        .string()
        .describe('Имя хука. Пример: content_after_add_approve, user_registered, html_filter'),
    },
    async ({ hook_name }) => {
      const result = getHookDetails(hook_name);
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

  // ── 5. Поиск хуков ───────────────────────────────────────────────────────
  server.tool(
    'search_hooks',
    'Полнотекстовый поиск хуков по имени, описанию, категории или параметрам',
    {
      query: z
        .string()
        .describe("Поисковый запрос. Пример: 'после добавления материала', 'profile', 'email'"),
    },
    async ({ query }) => {
      const result = searchHooks(query);
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

  // ── 6. API компонента ────────────────────────────────────────────────────
  server.tool(
    'get_component_api',
    'API конкретного класса/компонента InstantCMS: методы, сигнатуры, описания, примеры вызовов',
    {
      component_name: z
        .string()
        .describe(
          'Имя компонента или класса. Пример: cmsModel, cmsTemplate, cmsRequest, cmsCache, cmsEventsManager'
        ),
    },
    async ({ component_name }) => {
      const result = getComponentApi(component_name);
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

  // ── 7. Список компонентов ────────────────────────────────────────────────
  server.tool(
    'list_components',
    'Список всех документированных компонентов и классов InstantCMS с кратким описанием и способом доступа',
    {},
    async () => {
      const result = listComponents();
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

  // ── 8. Валидация дополнения ──────────────────────────────────────────────
  server.tool(
    'validate_addon',
    'Валидация структуры дополнения InstantCMS. Проверяет наличие обязательных файлов, правильность классов, соглашения об именовании',
    {
      files: z
        .record(z.string().min(1).max(500), z.string().max(2_000_000))
        .refine(files => Object.keys(files).length <= 500, 'Не более 500 файлов')
        .describe(
          "Map файлов дополнения: {путь_к_файлу: содержимое}. Пример: {'frontend.php': '<?php class myaddon...'}"
        ),
    },
    async ({ files }) => {
      const result = validateAddon(files);
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

  // ── 9. Типы полей форм ───────────────────────────────────────────────────
  server.tool(
    'get_field_types',
    'Информация о типах полей для форм InstantCMS (fieldString, fieldList, fieldImage и др.) с примерами использования',
    {
      field_type: z
        .string()
        .optional()
        .describe(
          'Имя конкретного типа поля для детальной информации. Если не указан — возвращает все типы'
        ),
    },
    async ({ field_type }) => {
      const result = getFieldTypes(field_type);
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

  // ── 10. Примеры кода ─────────────────────────────────────────────────────
  server.tool(
    'get_code_example',
    'Получить готовый пример кода для типовой задачи в InstantCMS',
    {
      task: z
        .string()
        .describe(
          "Описание задачи. Пример: 'список с пагинацией', 'обработка AJAX', 'кэширование', 'работа с хуками', 'загрузка файлов'"
        ),
    },
    async ({ task }) => {
      const result = getCodeExample(task);
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

  // ── 11. Генерация шаблона ────────────────────────────────────────────────
  server.tool(
    'scaffold_template',
    'Генерирует скаффолд шаблона (темы) для InstantCMS: manifest.php, main.tpl.php, базовые CSS/JS',
    {
      name: z.string().describe('Техническое имя шаблона (латинские буквы). Пример: mytheme'),
      title: z.string().describe('Отображаемое название. Пример: My Beautiful Theme'),
      author: z.string().optional().describe('Имя автора'),
    },
    async opts => {
      const result = scaffoldTemplate(opts);
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

  // ── 12. Структура шаблона ────────────────────────────────────────────────
  server.tool(
    'get_template_structure',
    'Полная структура шаблона InstantCMS: обязательные и опциональные файлы, переменные доступные в .tpl.php, переопределение шаблонов контроллеров',
    {},
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                ...templateStructure,
                available_tpl_variables: {
                  $cms_template: 'Экземпляр cmsTemplate — управление выводом',
                  $cms_user: 'Текущий пользователь (id, login, is_logged, group_id, ...)',
                  $cms_config: 'Конфигурация сайта',
                  'Все ключи из render()':
                    "Переменные, переданные из контроллера через render('tpl', ['var' => val])",
                },
                tpl_helpers: {
                  "href_to('ctrl', 'action', $params)": 'Генерация URL',
                  "href_to_admin('ctrl', 'action')": 'URL в админку',
                  'htmlspecialchars($str)': 'Экранирование HTML',
                  LANG_CONST: 'Языковые константы',
                  'date_format($date)': 'Форматирование даты',
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ── 13. Генерация схемы виджетов (layout scheme) ─────────────────────────
  server.tool(
    'scaffold_layout_scheme',
    `Генерирует YAML-схему расположения виджетов для импорта в шаблон modern InstantCMS.
Схема описывает ряды (rows) и колонки (cols) Bootstrap 4 сетки с позициями для виджетов.
Результат импортируется через: Панель управления → Оформление → Шаблоны → Modern → Схема → Импорт.
Можно задать произвольную схему через параметр rows, или использовать готовый пресет через preset.`,
    {
      template: z
        .string()
        .optional()
        .default('modern')
        .describe('Имя шаблона. По умолчанию: modern'),

      preset: z.enum(['simple', 'with_sidebar_left', 'modern_full']).optional()
        .describe(`Готовый пресет схемы. Используйте вместо rows для быстрого старта:
  simple          — шапка + контент/сайдбар + подвал
  with_sidebar_left — три колонки: лево/контент/право + двухколоночный футер
  modern_full     — полная схема modern (топ-бар, лого, навбар, баннер, три колонки, префутер, футер)`),

      rows: z
        .array(
          z.object({
            title: z.string().describe('Отображаемое название ряда в админке'),
            tag: z
              .string()
              .nullish()
              .describe('HTML тег Bootstrap row-элемента. null = без тега. Примеры: div, main'),
            parent_col: z
              .string()
              .optional()
              .describe(
                'position_name колонки-родителя (для вложенных рядов). Ряд будет вложен внутрь этой позиции'
              ),
            nested_position: z
              .string()
              .optional()
              .default('after')
              .describe("Позиция вложения: 'after' (после виджетов, по умолчанию)"),
            class: z
              .string()
              .nullish()
              .describe('CSS классы на Bootstrap row-элементе. Bootstrap 4: py-3, mt-auto'),
            outer_tag: z
              .string()
              .optional()
              .describe(
                'Внешний HTML тег-обёртка вокруг ряда. Примеры: header, footer, section, div, nav'
              ),
            outer_class: z.string().optional().describe('CSS классы внешнего тега'),
            container: z
              .string()
              .optional()
              .describe(
                "Класс контейнера Bootstrap 4: 'container', 'container-fluid', '' (без контейнера). По умолчанию: 'container'"
              ),
            container_tag: z.string().optional().describe('HTML тег контейнера. По умолчанию: div'),
            container_class: z
              .string()
              .optional()
              .describe(
                "CSS классы контейнера. Примеры: 'd-flex justify-content-between align-items-center flex-nowrap'"
              ),
            no_gutters: z.boolean().optional().describe('Добавить Bootstrap no-gutters к ряду'),
            cols: z
              .array(
                z.object({
                  title: z.string().describe('Отображаемое название колонки'),
                  position: z
                    .string()
                    .optional()
                    .describe(
                      'Имя позиции для привязки виджетов. Авто-генерируется как pos_N если не задано. Используйте con_* для полноширинных позиций'
                    ),
                  tag: z
                    .string()
                    .optional()
                    .describe('HTML тег колонки. По умолчанию: div. Примеры: article, aside, nav'),
                  class: z
                    .string()
                    .nullish()
                    .describe('CSS классы на колонке. Bootstrap 4: mb-3 mb-md-4'),
                  type: z
                    .enum(['typical', 'custom'])
                    .optional()
                    .default('typical')
                    .describe(
                      'Тип колонки: typical = обычная Bootstrap-колонка, custom = кастомный HTML с {position}'
                    ),
                  wrapper: z
                    .string()
                    .optional()
                    .describe(
                      "Для type=custom: HTML-обёртка с плейсхолдером {position}. Примеры: '{position}' или '<div class=\"my-wrap\">{position}</div>'"
                    ),
                  col: z
                    .string()
                    .optional()
                    .describe(
                      'Bootstrap 4 col-класс (xs/default). Примеры: col, col-sm-12, col-sm'
                    ),
                  col_md: z
                    .string()
                    .optional()
                    .describe('Bootstrap 4 col-md класс. Примеры: col-md-6, col-md'),
                  col_lg: z
                    .string()
                    .optional()
                    .describe(
                      'Bootstrap 4 col-lg класс. Примеры: col-lg-8, col-lg-4, col-lg-3, col-lg'
                    ),
                  col_xl: z
                    .string()
                    .optional()
                    .describe('Bootstrap 4 col-xl класс. Примеры: col-xl-2'),
                  col_class: z
                    .string()
                    .optional()
                    .describe('Переопределить все responsive классы одним значением'),
                  order: z.number().optional().describe('Bootstrap order (default). 0 = без order'),
                  cut_before: z
                    .boolean()
                    .optional()
                    .describe(
                      'Вставить Bootstrap w-100 перед колонкой (принудительный перенос строки)'
                    ),
                })
              )
              .describe('Колонки ряда'),
          })
        )
        .min(1)
        .max(100)
        .optional()
        .describe('Массив рядов схемы. Используйте вместо preset для кастомной схемы'),
    },
    async ({ template, preset, rows }) => {
      let input;

      if (preset && !rows) {
        // Use preset
        const p = layoutPresets[preset];
        input = { ...p.scheme, template: template || p.scheme.template };
      } else if (rows) {
        input = { template: template || 'modern', rows };
      } else {
        // Default: list presets
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: 'Укажите preset или rows',
                  available_presets: listLayoutPresets(),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const result = scaffoldLayoutScheme(input as Parameters<typeof scaffoldLayoutScheme>[0]);
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

  // ── 14. Список пресетов схем виджетов ────────────────────────────────────
  server.tool(
    'list_layout_presets',
    'Список готовых пресетов схем расположения виджетов для шаблона modern InstantCMS. Используйте preset в scaffold_layout_scheme для быстрой генерации.',
    {},
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(listLayoutPresets(), null, 2),
          },
        ],
      };
    }
  );

  // ── 15. Анализ структуры базы данных ──────────────────────────────────────
  server.tool(
    'introspect_database',
    'Анализ структуры базы данных InstantCMS. Без параметров — список всех таблиц. С параметром table_name — детали конкретной таблицы.',
    {
      table_name: z
        .string()
        .optional()
        .describe('Имя таблицы (без префикса cms_). Пример: users, content_types, widgets'),
    },
    async ({ table_name }) => {
      const result = introspectDatabase(table_name);
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

  // ── 16. Описание конкретной таблицы ──────────────────────────────────────
  server.tool(
    'describe_table',
    'Подробное описание таблицы: поля, индексы, связи, типы данных. Генерирует примеры SQL-запросов.',
    {
      table_name: z
        .string()
        .describe('Имя таблицы (можно с префиксом cms_ или без). Пример: cms_users, content_types'),
    },
    async ({ table_name }) => {
      const result = describeTable(table_name);
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

  // ── 17. Типы контента ────────────────────────────────────────────────────
  server.tool(
    'list_content_types',
    'Информация о типах контента: cms_content_types, cms_con_pages, cms_users. Поля, ключи, связи.',
    {},
    async () => {
      const result = listContentTypes();
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

  // ── 18. Карта событий (events) ────────────────────────────────────────────
  server.tool(
    'list_database_events',
    'Все зарегистрированные события (хуки) из таблицы cms_events. Показывает какой контроллер на какое событие подписан.',
    {},
    async () => {
      const result = listDatabaseEvents();
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

  // ── 19. Анализ контроллера ───────────────────────────────────────────────
  server.tool(
    'analyze_controller',
    'Подробная информация о контроллере: класс, наследование, экшены, трейты, файлы.',
    {
      name: z.string().describe('Имя контроллера. Пример: content, users, messages'),
      type: z.enum(['frontend', 'backend']).optional().describe('Тип контроллера'),
    },
    async ({ name, type }) => {
      const result = analyzeController(name, type);
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

  // ── 20. Список контроллеров ──────────────────────────────────────────────
  server.tool(
    'list_controllers',
    'Список всех контроллеров: frontend и backend. Можно фильтровать по типу.',
    {
      filter: z.enum(['frontend', 'backend']).optional().describe('Фильтр по типу контроллера'),
    },
    async ({ filter }) => {
      const result = listControllers(filter);
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

  // ── 21. Экшены контроллера ───────────────────────────────────────────────
  server.tool(
    'get_controller_actions',
    'Список всех экшенов контроллера с параметрами, видимостью и трейтами.',
    {
      name: z.string().describe('Имя контроллера. Пример: content, users'),
      type: z.enum(['frontend', 'backend']).optional().describe('Тип контроллера'),
    },
    async ({ name, type }) => {
      const result = getControllerActionsList(name, type);
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

  // ── 22. Системные трейты ─────────────────────────────────────────────────
  server.tool(
    'list_system_traits',
    'Список всех системных трейтов icms используемых в контроллерах. Трейты предоставляют готовую функциональность.',
    {},
    async () => {
      const result = listSystemTraits();
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

  // ═══════════════════════════════════════════════════════════════════════════
  // MARIADB TOOLS (Фаза 1: Работа с базой данных)
  // ═══════════════════════════════════════════════════════════════════════════

  // Внимание: Для работы требуется настроить переменные окружения:
  // DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE

  // ── 23. Выполнить SQL запрос ─────────────────────────────────────────────
  server.tool(
    'maria_execute_query',
    'Выполняет произвольный SQL запрос к базе данных MariaDB. Возвращает результат с колонками, строками и временем выполнения.',
    {
      sql: z
        .string()
        .describe('SQL запрос для выполнения. Пример: SELECT * FROM cms_users LIMIT 10'),
    },
    async ({ sql }) => {
      const result = await mariaExecuteQuery(sql);
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

  // ── 24. Список таблиц ────────────────────────────────────────────────────
  server.tool(
    'maria_list_tables',
    'Возвращает список всех таблиц в текущей базе данных MariaDB.',
    {},
    async () => {
      const result = await mariaListTables();
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

  // ── 25. Описание таблицы ────────────────────────────────────────────────
  server.tool(
    'maria_describe_table',
    'Подробное описание структуры таблицы: колонки, типы, индексы, количество строк.',
    {
      table_name: z.string().describe('Имя таблицы. Пример: cms_users, cms_content'),
    },
    async ({ table_name }) => {
      const result = await mariaDescribeTable(table_name);
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

  // ── 26. Информация о базе данных ─────────────────────────────────────────
  server.tool(
    'maria_get_database_info',
    'Статистика базы данных: имя, количество таблиц, строк, размер.',
    {},
    async () => {
      const result = await mariaGetDatabaseInfo();
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

  // ── 27. Поиск таблиц ─────────────────────────────────────────────────────
  server.tool(
    'maria_search_tables',
    'Поиск таблиц по имени. Полезно когда не помните точное имя таблицы.',
    {
      pattern: z.string().describe('Строка для поиска. Пример: users, content, widget'),
    },
    async ({ pattern }) => {
      const result = await mariaSearchTables(pattern);
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

  // ── 28. Данные из таблицы ───────────────────────────────────────────────
  server.tool(
    'maria_get_table_data',
    'Получить данные из таблицы с поддержкой пагинации, сортировки и фильтрации.',
    {
      table_name: z.string().describe('Имя таблицы. Пример: cms_users'),
      limit: z.number().optional().default(20).describe('Количество строк (по умолчанию 20)'),
      offset: z.number().optional().default(0).describe('Смещение для пагинации'),
      order_by: z.string().optional().default('id').describe('Поле для сортировки'),
      order_dir: z
        .enum(['ASC', 'DESC'])
        .optional()
        .default('DESC')
        .describe('Направление сортировки'),
      filter: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('Фильтр в формате {поле: значение}'),
    },
    async ({ table_name, limit, offset, order_by, order_dir, filter }) => {
      const result = await mariaGetTableData(table_name, {
        limit,
        offset,
        orderBy: order_by,
        orderDir: order_dir,
        filter,
      });
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

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 40. Список языковых ключей ────────────────────────────────────────
  server.tool(
    'list_lang_keys',
    'Возвращает типовые языковые константы для дополнения. Генерирует LANG_* ключи с значениями по умолчанию.',
    {
      addon_name: z.string().describe('Имя дополнения. Пример: myaddon'),
      category: z
        .string()
        .optional()
        .describe(
          'Фильтр по категории: system, actions, pages, buttons, status, fields, errors, permissions, dates, messages, pagination, sort'
        ),
    },
    async ({ addon_name, category }) => {
      const result = listLangKeys({ addon_name, category });
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

  // ── 41. Генерация языкового файла ───────────────────────────────────
  server.tool(
    'scaffold_lang',
    'Генерирует готовый PHP файл с языковыми константами для дополнения.',
    {
      addon_name: z.string().describe('Имя дополнения. Пример: myaddon'),
      keys: z
        .array(z.string())
        .optional()
        .describe('Список ключей для генерации. Если пусто — все типовые.'),
      custom_keys: z
        .array(
          z.object({
            key: z.string().describe('Полный ключ, например: LANG_MYADDON_MY_KEY'),
            value: z.string().describe('Значение константы'),
            category: z.string().optional().describe('Категория'),
          })
        )
        .optional()
        .describe('Дополнительные кастомные ключи'),
    },
    async ({ addon_name, keys, custom_keys }) => {
      const result = scaffoldLang({ addon_name, keys, custom_keys });
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

  // ── 42. Генерация миграции с файлами ────────────────────────────────
  server.tool(
    'scaffold_migration',
    'Генерирует install.php и uninstall.php файлы для дополнения. Включает создание таблиц, опционально тип контента и SEO настройки.',
    {
      addon_name: z.string().describe('Имя дополнения. Пример: myaddon'),
      table_name: z.string().describe('Имя таблицы без префикса. Пример: items'),
      fields: z
        .array(
          z.object({
            name: z.string().describe('Имя поля'),
            type: z.string().describe('Тип SQL: varchar(255), text, int(11), datetime, tinyint(1)'),
            nullable: z.boolean().optional().describe('Может быть NULL'),
            default: z.union([z.string(), z.number()]).optional().describe('Значение по умолчанию'),
            extra: z.string().optional().describe('Дополнительно: AUTO_INCREMENT'),
            comment: z.string().optional().describe('Комментарий к полю'),
          })
        )
        .describe('Поля таблицы'),
      options: z
        .object({
          comment: z.string().optional().describe('Комментарий к таблице'),
          indexes: z
            .array(
              z.object({
                name: z.string().describe('Имя индекса'),
                fields: z.array(z.string()).describe('Поля через запятую'),
                type: z.enum(['INDEX', 'UNIQUE', 'FULLTEXT']).optional().describe('Тип индекса'),
              })
            )
            .optional()
            .describe('Дополнительные индексы'),
          permissions: z
            .array(z.string())
            .optional()
            .describe('Права доступа: view, add, edit, delete'),
          content_type: z.boolean().optional().describe('Создать тип контента'),
          has_seo: z.boolean().optional().describe('Добавить SEO настройки'),
        })
        .optional(),
    },
    async ({ addon_name, table_name, fields, options }) => {
      const result = scaffoldMigration({ addon_name, table_name, fields, options });
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

  // ═══════════════════════════════════════════════════════════════════════════
  // WYSIWYG EDITORS TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 43. Список WYSIWYG редакторов ─────────────────────────────────────
  server.tool(
    'list_wysiwyg_editors',
    'Список всех доступных WYSIWYG редакторов: ace (редактор кода), markitup (разметка), redactor (Imperavi), tinymce.',
    {},
    async () => {
      const result = listWysiwygEditors();
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

  // ── 40. Информация о WYSIWYG редакторе ───────────────────────────────
  server.tool(
    'get_wysiwyg_editor',
    'Подробная информация о WYSIWYG редакторе: класс, файл, опции, плагины, кнопки, пример использования.',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }) => {
      const result = getWysiwygEditor(name);
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

  // ── 41. Опции WYSIWYG редактора ──────────────────────────────────────
  server.tool(
    'get_wysiwyg_options',
    'Список всех настроек WYSIWYG редактора с типами, описаниями и значениями по умолчанию.',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }) => {
      const result = getWysiwygOptions(name);
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

  // ── 42. Плагины WYSIWYG редактора ────────────────────────────────────
  server.tool(
    'get_wysiwyg_plugins',
    'Список плагинов WYSIWYG редактора. Redactor и TinyMCE поддерживают плагины.',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }) => {
      const result = getWysiwygPlugins(name);
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

  // ── 43. Поиск WYSIWYG редакторов ─────────────────────────────────────
  server.tool(
    'search_wysiwyg_editors',
    'Поиск WYSIWYG редакторов по описанию, функциям или плагинам.',
    {
      query: z.string().describe("Поисковый запрос. Пример: 'код', 'видео', 'смайлы'"),
    },
    async ({ query }) => {
      const result = searchWysiwygEditors(query);
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

  // ── 44. Кнопки WYSIWYG редактора ─────────────────────────────────────
  server.tool(
    'get_wysiwyg_buttons',
    'Список кнопок тулбара WYSIWYG редактора. Для markitup возвращает объекты с настройками (openWith, closeWith).',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }) => {
      const result = getWysiwygButtons(name);
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

  // ── 45. Система прав доступа ────────────────────────────────────────────
  server.tool(
    'scaffold_permission',
    'Генерация системы прав доступа для дополнения InstantCMS с настройкой ролей и проверкой владельца',
    {
      name: z
        .string()
        .regex(/^[a-z][a-z0-9_]*$/)
        .describe('Системное имя (латинница, snake_case)'),
      title: z.string().describe('Название дополнения'),
      description: z.string().optional().describe('Описание'),
      controller: z.string().optional().describe('Имя контроллера'),
      permissions: z
        .array(z.enum(['view', 'add', 'edit', 'delete', 'publish', 'moderate', 'admin']))
        .optional()
        .describe('Список разрешений'),
      category: z.string().optional().describe('Категория прав'),
      options: z
        .object({
          withCategories: z.boolean().optional().describe('С категориями'),
          withOwnership: z.boolean().optional().describe('Проверка владельца'),
          withRoles: z.boolean().optional().describe('С ролями'),
        })
        .optional()
        .describe('Дополнительные опции'),
    },
    async opts => {
      const result = scaffoldPermission(opts as Parameters<typeof scaffoldPermission>[0]);
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

  // ── 46. Система фильтрации контента ─────────────────────────────────────
  server.tool(
    'scaffold_filter',
    'Генерация системы фильтрации контента с поддержкой различных типов фильтров',
    {
      addon_name: z.string().describe('Имя дополнения'),
      fields: z
        .array(
          z.object({
            field: z.string().describe('Имя поля в БД'),
            type: z
              .enum(['text', 'select', 'multiselect', 'checkbox', 'range', 'date', 'daterange'])
              .describe('Тип фильтра'),
            label: z.string().optional().describe('Название поля'),
            options: z
              .array(z.object({ value: z.string(), label: z.string() }))
              .optional()
              .describe('Опции для select/multiselect'),
            placeholder: z.string().optional().describe('Placeholder'),
          })
        )
        .describe('Поля фильтра'),
      options: z
        .object({
          use_ajax: z.boolean().optional().describe('AJAX фильтрация'),
          use_url_params: z.boolean().optional().describe('Параметры в URL'),
          save_filters: z.boolean().optional().describe('Сохранение фильтров'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldFilter(opts as Parameters<typeof scaffoldFilter>[0]);
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

  // ── 47. SEO мета-теги и sitemap ─────────────────────────────────────────
  server.tool(
    'scaffold_seo',
    'Генерация SEO мета-тегов, Open Graph разметки и sitemap для InstantCMS',
    {
      addon_name: z.string().describe('Имя дополнения'),
      fields: z
        .array(
          z.object({
            field: z.string().describe('Имя поля'),
            type: z
              .enum(['title', 'description', 'keywords', 'og_image', 'canonical', 'robots'])
              .describe('Тип поля'),
            value: z.string().optional().describe('Шаблон значения'),
          })
        )
        .optional()
        .describe('Поля SEO'),
      options: z
        .object({
          auto_generation: z.boolean().optional().describe('Автогенерация мета-тегов'),
          use_sitemap: z.boolean().optional().describe('Использовать sitemap'),
          use_og_tags: z.boolean().optional().describe('Open Graph теги'),
          use_schema_org: z.boolean().optional().describe('Schema.org разметка'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldSeo(opts as Parameters<typeof scaffoldSeo>[0]);
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

  // ── 48. Импорт/экспорт данных ─────────────────────────────────────────────
  server.tool(
    'scaffold_import_export',
    'Генерация системы импорта/экспорта данных с поддержкой CSV, Excel, JSON, XML',
    {
      addon_name: z.string().describe('Имя дополнения'),
      fields: z
        .array(
          z.object({
            field: z.string().describe('Имя поля'),
            type: z
              .enum([
                'string',
                'text',
                'number',
                'date',
                'datetime',
                'bool',
                'select',
                'image',
                'file',
              ])
              .describe('Тип поля'),
            label: z.string().optional().describe('Название в CSV/заголовке'),
            required: z.boolean().optional().describe('Обязательное'),
            default: z.string().optional().describe('Значение по умолчанию'),
          })
        )
        .optional()
        .describe('Поля для импорта/экспорта'),
      options: z
        .object({
          use_csv: z.boolean().optional().describe('Поддержка CSV'),
          use_xlsx: z.boolean().optional().describe('Поддержка Excel'),
          use_json: z.boolean().optional().describe('Поддержка JSON API'),
          use_xml: z.boolean().optional().describe('Поддержка XML'),
          batch_size: z.number().optional().describe('Размер батча'),
          skip_header: z.boolean().optional().describe('Пропускать заголовки'),
          update_existing: z.boolean().optional().describe('Обновлять существующие'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldImportExport(opts as Parameters<typeof scaffoldImportExport>[0]);
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

  // ── 49. Система кэширования ──────────────────────────────────────────────
  server.tool(
    'scaffold_cache',
    'Генерация системы кэширования для InstantCMS с поддержкой тегов и различных бэкендов',
    {
      addon_name: z.string().describe('Имя дополнения'),
      options: z
        .object({
          use_memcached: z.boolean().optional().describe('Использовать Memcached'),
          use_redis: z.boolean().optional().describe('Использовать Redis'),
          default_ttl: z.number().optional().describe('TTL по умолчанию (секунды)'),
          use_tags: z.boolean().optional().describe('Использовать теги кэша'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldCache(opts as Parameters<typeof scaffoldCache>[0]);
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

  // ── 50. Система веб-хуков ──────────────────────────────────────────────
  server.tool(
    'scaffold_webhook',
    'Генерация системы веб-хуков для InstantCMS с поддержкой подписи и повторных попыток',
    {
      addon_name: z.string().describe('Имя дополнения'),
      events: z.array(z.string()).describe('События для обработки'),
      options: z
        .object({
          use_signature: z.boolean().optional().describe('Проверка подписи'),
          use_retry: z.boolean().optional().describe('Повтор при ошибках'),
          retry_count: z.number().optional().describe('Количество попыток'),
          async_execution: z.boolean().optional().describe('Асинхронное выполнение'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldWebhook(opts as Parameters<typeof scaffoldWebhook>[0]);
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

  // ── 51. Клиент внешнего API ──────────────────────────────────────────────
  server.tool(
    'scaffold_external_api',
    'Генерация клиента для внешнего API с поддержкой авторизации, rate limiting и кэширования',
    {
      addon_name: z.string().describe('Имя дополнения'),
      base_url: z.string().describe('Базовый URL API'),
      endpoints: z
        .array(
          z.object({
            path: z.string().describe('Путь эндпоинта'),
            method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).describe('HTTP метод'),
            description: z.string().optional().describe('Описание'),
          })
        )
        .describe('Эндпоинты API'),
      options: z
        .object({
          use_auth: z.boolean().optional().describe('Использовать авторизацию'),
          auth_type: z
            .enum(['api_key', 'bearer', 'basic', 'oauth2'])
            .optional()
            .describe('Тип авторизации'),
          timeout: z.number().optional().describe('Таймаут запроса'),
          use_rate_limit: z.boolean().optional().describe('Ограничение запросов'),
          rate_limit: z.number().optional().describe('Макс. запросов в минуту'),
          use_cache: z.boolean().optional().describe('Кэширование ответов'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldExternalApi(opts as Parameters<typeof scaffoldExternalApi>[0]);
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

  // ── 52. OAuth авторизация ────────────────────────────────────────────────
  server.tool(
    'scaffold_oauth',
    'Генерация OAuth авторизации для InstantCMS с поддержкой различных провайдеров',
    {
      addon_name: z.string().describe('Имя дополнения'),
      providers: z
        .array(
          z.object({
            name: z.string().describe('Имя провайдера (google, vkontakte и т.д.)'),
            client_id: z.string().describe('Client ID'),
            client_secret: z.string().describe('Client Secret'),
            auth_url: z.string().describe('URL авторизации'),
            token_url: z.string().describe('URL для получения токена'),
            scopes: z.array(z.string()).optional().describe('Scopes'),
          })
        )
        .describe('OAuth провайдеры'),
      options: z
        .object({
          use_refresh_token: z.boolean().optional().describe('Использовать refresh token'),
          store_tokens_in_db: z.boolean().optional().describe('Хранить токены в БД'),
          PKCE_support: z.boolean().optional().describe('Поддержка PKCE'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldOAuth(opts as Parameters<typeof scaffoldOAuth>[0]);
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

  // ── 53. Генерация компонента ───────────────────────────────────────────
  server.tool(
    'scaffold_component',
    'Генерация полного компонента InstantCMS с backend, frontend, model',
    {
      addon_name: z.string().describe('Имя компонента'),
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
          with_frontend: z.boolean().optional().describe('С frontend'),
          with_admin: z.boolean().optional().describe('С админкой'),
          with_model: z.boolean().optional().describe('С моделью'),
          with_routes: z.boolean().optional().describe('С роутами'),
          with_menu: z.boolean().optional().describe('С меню'),
        })
        .optional()
        .describe('Опции'),
    },
    async opts => {
      const result = scaffoldComponent(opts as Parameters<typeof scaffoldComponent>[0]);
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

  // ── 54. Генерация виджета ──────────────────────────────────────────────
  server.tool(
    'scaffold_widget',
    'Генерация виджета InstantCMS с настройками и шаблонами',
    {
      addon_name: z.string().describe('Имя компонента'),
      widget_name: z.string().describe('Имя виджета'),
      options: z
        .array(
          z.object({
            name: z.string().describe('Имя опции'),
            type: z
              .enum(['text', 'number', 'select', 'checkbox', 'textarea', 'image'])
              .describe('Тип поля'),
            label: z.string().describe('Название'),
            options: z
              .array(z.object({ value: z.string(), label: z.string() }))
              .optional()
              .describe('Опции для select'),
            default: z
              .union([z.string(), z.boolean(), z.number()])
              .optional()
              .describe('Значение по умолчанию'),
          })
        )
        .optional()
        .describe('Опции виджета'),
      options_config: z
        .object({
          with_template: z.boolean().optional().describe('С шаблоном'),
          with_styles: z.boolean().optional().describe('Со стилями'),
          with_cache: z.boolean().optional().describe('С кэшированием'),
        })
        .optional()
        .describe('Конфигурация'),
    },
    async opts => {
      const result = scaffoldWidget(opts as Parameters<typeof scaffoldWidget>[0]);
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

  // ── 55. Генерация темы шаблона ─────────────────────────────────────────
  server.tool(
    'scaffold_template_theme',
    'Генерация темы шаблона InstantCMS с layout, стилями и поддержкой dark mode',
    {
      template_name: z.string().describe('Имя шаблона'),
      options: z
        .object({
          with_layout: z.boolean().optional().describe('С layout.yaml'),
          with_responsive: z.boolean().optional().describe('Адаптивный дизайн'),
          with_dark_mode: z.boolean().optional().describe('Тёмная тема'),
          withRTL: z.boolean().optional().describe('RTL поддержка'),
        })
        .optional()
        .describe('Опции'),
      layout_blocks: z
        .array(
          z.object({
            name: z.string().describe('Название блока'),
            position: z.string().describe('Позиция виджетов'),
            class: z.string().optional().describe('CSS класс'),
          })
        )
        .optional()
        .describe('Блоки layout'),
    },
    async opts => {
      const result = scaffoldTheme(opts as Parameters<typeof scaffoldTheme>[0]);
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

  // ═══════════════════════════════════════════════════════════════════════════
  server.tool(
    'get_server_capabilities',
    'Версия сервера, поддерживаемая версия InstantCMS и объём встроенной базы знаний',
    {},
    async () => {
      const result = {
        server_version: '1.1.0',
        instantcms: { major: 2, tested_version: '2.18.1' },
        tools_count: 72,
        knowledge: {
          hooks: hooks.length,
          hook_categories: hookCategories.length,
          components: components.length,
          addon_types: Object.keys(addonStructures),
          layout_presets: Object.keys(layoutPresets),
        },
      };
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // RESOURCES (статичные данные для контекста)
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

  return server;
}
