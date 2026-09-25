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
import { scaffoldContentType } from '../tools/content-type-tool.js';
import { hooks } from '../data/hooks.js';
import { defineTool } from '../utils/define-tool.js';

export function registerGeneratorTools(server: McpServer): void {
  // ── 1. Структура дополнения ──────────────────────────────────────────────
  defineTool(
    server,
    'get_addon_structure',
    'Возвращает полную структуру файлов и папок для дополнения InstantCMS с описанием каждого файла и шаблонами кода. / Returns the complete file and folder structure for an InstantCMS addon, with per-file descriptions and code templates.',
    {
      addon_type: z
        .enum(['basic', 'with_admin', 'with_hooks', 'with_routes', 'with_widget'])
        .default('basic')
        .describe(
          'Тип дополнения: basic (только фронтенд), with_admin (с CRUD панелью), with_hooks (с хуками), with_routes (кастомные URL), with_widget (с виджетом)'
        ),
    },
    async ({ addon_type }: any) => {
      return getAddonStructure(addon_type) as Record<string, unknown>;
    }
  );

  // ── 2. Генерация скаффолда дополнения ────────────────────────────────────
  defineTool(
    server,
    'scaffold_addon',
    'Генерирует готовый код всех файлов дополнения InstantCMS на основе параметров. Возвращает map {имя_файла: содержимое}. / Generates ready-to-use code for all InstantCMS addon files based on the given parameters. Returns a map of {file_name: content}.',
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
    async (opts: any) => {
      return scaffoldAddon(opts as Parameters<typeof scaffoldAddon>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.1. Генерация CRUD для контент-типа ─────────────────────────────────
  defineTool(
    server,
    'scaffold_crud',
    'Генерирует полный CRUD для контент-типа InstantCMS: модель, контроллеры фронтенда и бэкенда, гриды, формы. / Generates full CRUD for an InstantCMS content type: model, frontend and backend controllers, grids, forms.',
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
          use_tags: z
            .boolean()
            .optional()
            .describe('Не поддерживается: требует хука tags_search_subjects и таблицы связей'),
          use_comments: z
            .boolean()
            .optional()
            .describe('Не поддерживается: требует хука comments_targets и вывода виджета'),
          use_rating: z
            .boolean()
            .optional()
            .describe('Не поддерживается: нужен реестр целей рейтинга'),
          use_moderation: z
            .boolean()
            .optional()
            .describe('Не поддерживается: пре-модерация настраивается на уровне контент-типа'),
          use_seo: z
            .boolean()
            .optional()
            .describe(
              'SEO-поля meta_title/meta_description/meta_keywords и их применение в экшене view'
            ),
          use_slug: z
            .boolean()
            .optional()
            .describe('ЧПУ /{controller}/<slug>.html: колонка slug, routes.php и route()'),
          use_content: z
            .boolean()
            .optional()
            .describe('Не поддерживается: регистрация контент-типа не автоматизирована'),
          list_template: z
            .enum(['grid', 'list', 'table'])
            .optional()
            .describe('Разметка index.tpl.php: карточки, список или таблица'),
        })
        .optional()
        .describe('Дополнительные опции'),
    },
    async (opts: any) => {
      return scaffoldCrud(opts as Parameters<typeof scaffoldCrud>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.2. Генерация формы ──────────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_form',
    'Генерирует PHP класс формы для бэкенда InstantCMS с указанными полями и правилами валидации. / Generates a PHP form class for the InstantCMS backend with the specified fields and validation rules.',
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
    async (opts: any) => {
      return scaffoldForm(opts as Parameters<typeof scaffoldForm>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.3. Генерация грида ──────────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_grid',
    'Генерирует PHP функцию грида для бэкенда InstantCMS с колонками, фильтрами и экшенами. / Generates a PHP grid function for the InstantCMS backend with columns, filters, and actions.',
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
    async (opts: any) => {
      return scaffoldGrid(opts as Parameters<typeof scaffoldGrid>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.4. Генерация REST API ──────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_api',
    'Генерирует REST API контроллер для InstantCMS с эндпоинтами, аутентификацией и опционально OpenAPI спецификацией. / Generates a REST API controller for InstantCMS with endpoints, authentication, and optionally an OpenAPI specification.',
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
    async (opts: any) => {
      return scaffoldApi(opts as Parameters<typeof scaffoldApi>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.5. Генерация тестов ─────────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_test',
    'Генерирует PHPUnit или Codeception тесты для дополнения InstantCMS. / Generates PHPUnit or Codeception tests for an InstantCMS addon.',
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
    async (opts: any) => {
      return scaffoldTest(opts as Parameters<typeof scaffoldTest>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.6. Генерация email шаблонов ───────────────────────────────────────
  defineTool(
    server,
    'scaffold_email',
    'Генерирует письма InstantCMS в формате system/languages/<lang>/letters/*.txt ([subject:...] и {плейсхолдеры}). / Generates InstantCMS email templates in the system/languages/<lang>/letters/*.txt format ([subject:...] and {placeholders}).',
    {
      addon_name: z.string().describe('Техническое имя дополнения. Пример: my_addon'),
      templates: z
        .array(
          z.object({
            name: z.string().describe('Имя шаблона. Пример: welcome, notification, reminder'),
            subject: z.string().describe('Тема письма (одна строка)'),
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
        .describe('Список писем'),
      options: z
        .object({
          use_html: z
            .boolean()
            .optional()
            .describe('Не поддерживается: HTML пишется прямо в теле письма'),
          base_template: z
            .string()
            .optional()
            .describe('Не поддерживается: у писем ICMS2 нет HTML-каркаса'),
        })
        .optional()
        .describe('Опции email'),
    },
    async (opts: any) => {
      return scaffoldEmail(opts as Parameters<typeof scaffoldEmail>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.7. Генерация переопределений шаблонов ──────────────────────────────
  defineTool(
    server,
    'scaffold_layout_override',
    'Генерирует шаблоны для переопределения стандартных шаблонов контроллеров InstantCMS в пользовательских темах. / Generates templates for overriding standard InstantCMS controller templates in custom themes.',
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
    async (opts: any) => {
      return scaffoldLayoutOverride(opts as Parameters<typeof scaffoldLayoutOverride>[0]) as Record<
        string,
        unknown
      >;
    }
  );

  // ── 2.8. Генерация частей админки ─────────────────────────────────────────
  defineTool(
    server,
    'scaffold_admin_partial',
    'Генерирует переиспользуемые части интерфейса админки: header, sidebar, toolbar, breadcrumbs, panels, modals. / Generates reusable admin UI parts: header, sidebar, toolbar, breadcrumbs, panels, modals.',
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
    async (opts: any) => {
      return scaffoldAdminPartial(opts as Parameters<typeof scaffoldAdminPartial>[0]) as Record<
        string,
        unknown
      >;
    }
  );

  // ── 2.9. Список переопределений шаблонов ──────────────────────────────────
  defineTool(
    server,
    'list_template_overrides',
    'Возвращает список всех доступных переопределений шаблонов контроллеров InstantCMS. / Returns the list of all available InstantCMS controller template overrides.',
    {
      controller: z
        .string()
        .optional()
        .describe('Фильтр по имени контроллера. Пример: content, users, photos'),
    },
    async ({ controller }: any) => {
      return listTemplateOverrides(controller) as Record<string, unknown>;
    }
  );

  // ── 2.10. Информация о переопределении ──────────────────────────────────
  defineTool(
    server,
    'get_template_override_info',
    'Возвращает подробную информацию о конкретном переопределении шаблона. / Returns detailed information about a specific template override.',
    {
      controller: z.string().describe('Имя контроллера. Пример: content, users'),
      action: z
        .string()
        .optional()
        .describe(
          'Имя экшена. Пример: view, index. Если не указано - возвращает информацию о index'
        ),
    },
    async ({ controller, action }: any) => {
      return getTemplateOverrideInfo(controller, action) as Record<string, unknown>;
    }
  );

  // ── 2.11. Генерация cron задач ───────────────────────────────────────────
  defineTool(
    server,
    'scaffold_cron',
    'Генерирует PHP cron контроллер для периодических задач с настройкой расписания, блокировками и логированием. / Generates a PHP cron controller for periodic tasks with schedule configuration, locking, and logging.',
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
    async (opts: any) => {
      return scaffoldCron(opts as Parameters<typeof scaffoldCron>[0]) as Record<string, unknown>;
    }
  );

  // ── 2.12. Регистрация типа контента ──────────────────────────────────────
  defineTool(
    server,
    'scaffold_content_type',
    'Генерирует регистрацию типа контента через API ядра (addContentType, addContentField) без raw SQL; повторный запуск докатывает только отсутствующие поля. / Generates content type registration via the core API without raw SQL; re-runs add only missing fields. / 通过核心 API 生成内容类型注册，不使用原始 SQL；重跑仅补加缺失字段。',
    {
      name: z
        .string()
        .regex(/^[a-z][a-z0-9_]{1,31}$/)
        .describe('Системное имя типа: 2–32 строчных латинских символа, цифры и подчёркивания'),
      title: z.string().trim().min(1).max(100).describe('Отображаемое название типа'),
      description: z.string().trim().max(1000).optional().describe('Описание типа контента'),
      url_pattern: z
        .string()
        .max(255)
        .optional()
        .describe(
          'Шаблон URL материала: {id}, {title}, {category} или имя поля (по умолчанию {id}-{title})'
        ),
      is_cats: z.boolean().optional().describe('Включить категории'),
      is_comments: z.boolean().optional().describe('Включить комментарии'),
      is_tags: z.boolean().optional().describe('Включить теги'),
      is_rating: z.boolean().optional().describe('Включить рейтинг'),
      is_date_range: z.boolean().optional().describe('Управление сроком публикации'),
      labels: z
        .object({
          one: z.string().optional(),
          two: z.string().optional(),
          many: z.string().optional(),
          create: z.string().optional(),
          list: z.string().optional(),
          profile: z.string().optional(),
        })
        .optional()
        .describe('Подписи числительных и кнопок типа'),
      options: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe('Дополнительные опции типа (is_item_form_add_cat, show_items_counts, ...)'),
      seo: z
        .object({
          title: z.string().optional(),
          keys: z.string().optional(),
          desc: z.string().optional(),
        })
        .optional()
        .describe('SEO-шаблоны типа контента'),
      fields: z
        .array(
          z.object({
            name: z
              .string()
              .describe('Имя поля (латиница, snake_case). Нельзя использовать системные колонки'),
            type: z
              .string()
              .describe(
                'Тип поля ICMS: string, text, html, image, images, file, list, number, url, date, checkbox, ...'
              ),
            title: z.string().describe('Заголовок поля'),
            is_in_list: z.boolean().optional().describe('Показывать в списке (по умолчанию true)'),
            is_in_item: z
              .boolean()
              .optional()
              .describe('Показывать в материале (по умолчанию true)'),
            is_in_filter: z
              .boolean()
              .optional()
              .describe('Доступно в фильтре (по умолчанию false)'),
            is_system: z.boolean().optional().describe('Системное поле'),
            is_private: z.boolean().optional().describe('Приватное поле'),
            options: z
              .record(z.string(), z.unknown())
              .optional()
              .describe('Опции поля (is_required, max_length, ...)'),
          })
        )
        .optional()
        .describe(
          'Предметные поля типа; стандартные title/date_pub/user/photo/content создаются ядром'
        ),
    },
    async (opts: any) => {
      return scaffoldContentType(opts as Parameters<typeof scaffoldContentType>[0]) as Record<
        string,
        unknown
      >;
    }
  );
}
