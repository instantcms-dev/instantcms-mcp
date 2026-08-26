import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getAddonStructure } from '../tools/addon-tool.js';
import { scaffoldAddon } from '../tools/scaffold-tool.js';
import { scaffoldCrud } from '../tools/crud-tool.js';
import { scaffoldForm } from '../tools/form-tool.js';
import { scaffoldGrid } from '../tools/grid-tool.js';
import { scaffoldApi } from '../tools/api-tool.js';
import { scaffoldTest } from '../tools/test-tool.js';
import { scaffoldEmail } from '../tools/email-tool.js';
import { scaffoldLayoutOverride } from '../tools/layout-override-tool.js';
import { scaffoldAdminPartial } from '../tools/admin-partial-tool.js';
import {
  listTemplateOverrides,
  getTemplateOverrideInfo,
} from '../tools/template-overrides-tool.js';
import { scaffoldCron } from '../tools/cron-tool.js';
import { hooks } from '../data/hooks.js';

export function registerGeneratorTools(server: McpServer): void {
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
}
