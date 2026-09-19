import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { defineTool } from '../utils/define-tool.js';
import {
  listWysiwygEditors,
  getWysiwygEditor,
  getWysiwygOptions,
  getWysiwygPlugins,
  searchWysiwygEditors,
  getWysiwygButtons,
} from '../tools/wysiwyg-tool.js';
import { scaffoldPermission } from '../tools/permission-tool.js';
import { scaffoldFilter } from '../tools/filter-tool.js';
import { scaffoldSeo } from '../tools/seo-tool.js';
import { scaffoldImportExport } from '../tools/import-export-tool.js';
import { scaffoldCache } from '../tools/cache-tool.js';
import { scaffoldWebhook } from '../tools/webhook-tool.js';
import { scaffoldExternalApi } from '../tools/external-api-tool.js';
import { scaffoldOAuth } from '../tools/oauth-tool.js';
import { scaffoldComponent } from '../tools/component-tool.js';
import { scaffoldWidget } from '../tools/widget-tool.js';
import { scaffoldTemplate as scaffoldTheme } from '../tools/template-tool.js';

export function registerExtensionTools(server: McpServer): void {
  // ═══════════════════════════════════════════════════════════════════════════
  // WYSIWYG EDITORS TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 43. Список WYSIWYG редакторов ─────────────────────────────────────
  defineTool(
    server,
    'list_wysiwyg_editors',
    'Список всех доступных WYSIWYG редакторов: ace (редактор кода), markitup (разметка), redactor (Imperavi), tinymce. / Lists all available WYSIWYG editors: ace (code editor), markitup (markup), redactor (Imperavi), tinymce.',
    {},
    async () => listWysiwygEditors() as Record<string, unknown>
  );

  // ── 40. Информация о WYSIWYG редакторе ───────────────────────────────
  defineTool(
    server,
    'get_wysiwyg_editor',
    'Подробная информация о WYSIWYG редакторе: класс, файл, опции, плагины, кнопки, пример использования. / Detailed info about a WYSIWYG editor: class, file, options, plugins, buttons, usage example.',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }: any) => getWysiwygEditor(name) as Record<string, unknown>
  );

  // ── 41. Опции WYSIWYG редактора ──────────────────────────────────────
  defineTool(
    server,
    'get_wysiwyg_options',
    'Список всех настроек WYSIWYG редактора с типами, описаниями и значениями по умолчанию. / Lists all WYSIWYG editor settings with types, descriptions and default values.',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }: any) => getWysiwygOptions(name) as Record<string, unknown>
  );

  // ── 42. Плагины WYSIWYG редактора ────────────────────────────────────
  defineTool(
    server,
    'get_wysiwyg_plugins',
    'Список плагинов WYSIWYG редактора. Redactor и TinyMCE поддерживают плагины. / Lists WYSIWYG editor plugins. Redactor and TinyMCE support plugins.',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }: any) => getWysiwygPlugins(name) as Record<string, unknown>
  );

  // ── 43. Поиск WYSIWYG редакторов ─────────────────────────────────────
  defineTool(
    server,
    'search_wysiwyg_editors',
    'Поиск WYSIWYG редакторов по описанию, функциям или плагинам. / Search WYSIWYG editors by description, features or plugins.',
    {
      query: z.string().describe("Поисковый запрос. Пример: 'код', 'видео', 'смайлы'"),
    },
    async ({ query }: any) => searchWysiwygEditors(query) as Record<string, unknown>
  );

  // ── 44. Кнопки WYSIWYG редактора ─────────────────────────────────────
  defineTool(
    server,
    'get_wysiwyg_buttons',
    'Список кнопок тулбара WYSIWYG редактора. Для markitup возвращает объекты с настройками (openWith, closeWith). / Lists WYSIWYG editor toolbar buttons. For markitup returns objects with settings (openWith, closeWith).',
    {
      name: z.string().describe('Имя редактора: ace, markitup, redactor, tinymce'),
    },
    async ({ name }: any) => getWysiwygButtons(name) as Record<string, unknown>
  );

  // ── 45. Система прав доступа ────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_permission',
    'Генерация системы прав доступа для дополнения InstantCMS с настройкой ролей и проверкой владельца. / Generates a permission system for an InstantCMS addon with role setup and ownership checks.',
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
    async (opts: any) => scaffoldPermission(opts as Parameters<typeof scaffoldPermission>[0])
  );

  // ── 46. Система фильтрации контента ─────────────────────────────────────
  defineTool(
    server,
    'scaffold_filter',
    'Генерация системы фильтрации контента с поддержкой различных типов фильтров. / Generates a content filtering system with support for various filter types.',
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
          frontend: z
            .boolean()
            .optional()
            .describe('Фронтенд-фильтр списка (list_filter) на cmsFormField'),
          use_ajax: z.boolean().optional().describe('AJAX фильтрация'),
          use_url_params: z.boolean().optional().describe('Параметры в URL'),
          save_filters: z.boolean().optional().describe('Сохранение фильтров'),
        })
        .optional()
        .describe('Опции'),
    },
    async (opts: any) => scaffoldFilter(opts as Parameters<typeof scaffoldFilter>[0])
  );

  // ── 47. SEO мета-теги и sitemap ─────────────────────────────────────────
  defineTool(
    server,
    'scaffold_seo',
    'Генерация SEO мета-тегов, Open Graph разметки и sitemap для InstantCMS. / Generates SEO meta tags, Open Graph markup and sitemap for InstantCMS.',
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
          use_slug: z
            .boolean()
            .optional()
            .describe('Материалы доступны по ЧПУ /{controller}/<slug>.html'),
          use_sitemap: z.boolean().optional().describe('Использовать sitemap'),
          use_og_tags: z.boolean().optional().describe('Open Graph теги'),
          use_schema_org: z.boolean().optional().describe('Schema.org разметка'),
        })
        .optional()
        .describe('Опции'),
    },
    async (opts: any) => scaffoldSeo(opts as Parameters<typeof scaffoldSeo>[0])
  );

  // ── 48. Импорт/экспорт данных ─────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_import_export',
    'Генерация системы импорта/экспорта данных с поддержкой CSV, Excel, JSON, XML. / Generates a data import/export system with CSV, Excel, JSON, XML support.',
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
    async (opts: any) => scaffoldImportExport(opts as Parameters<typeof scaffoldImportExport>[0])
  );

  // ── 49. Система кэширования ──────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_cache',
    'Генерация системы кэширования InstantCMS: класс кэша, тег-инвалидация и реальные хуки контроллера. / Generates an InstantCMS caching system: cache class, tag invalidation and real controller hooks.',
    {
      addon_name: z.string().describe('Имя дополнения'),
      options: z
        .object({
          use_memcached: z
            .boolean()
            .optional()
            .describe('Не поддерживается: драйвер задаётся в настройках сайта (cache_method)'),
          use_redis: z
            .boolean()
            .optional()
            .describe('Не поддерживается: драйвер задаётся в настройках сайта (cache_method)'),
          default_ttl: z.number().optional().describe('TTL по умолчанию (секунды)'),
          use_tags: z.boolean().optional().describe('Использовать теги кэша'),
        })
        .optional()
        .describe('Опции'),
    },
    async (opts: any) => scaffoldCache(opts as Parameters<typeof scaffoldCache>[0])
  );

  // ── 50. Система веб-хуков ──────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_webhook',
    'Генерация системы веб-хуков для InstantCMS с поддержкой подписи и повторных попыток. / Generates a webhook system for InstantCMS with signature support and retries.',
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
    async (opts: any) => scaffoldWebhook(opts as Parameters<typeof scaffoldWebhook>[0])
  );

  // ── 51. Клиент внешнего API ──────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_external_api',
    'Генерация клиента для внешнего API с поддержкой авторизации, rate limiting и кэширования. / Generates an external API client with auth, rate limiting and caching support.',
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
    async (opts: any) => scaffoldExternalApi(opts as Parameters<typeof scaffoldExternalApi>[0])
  );

  // ── 52. OAuth авторизация ────────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_oauth',
    'Генерация OAuth авторизации для InstantCMS с поддержкой различных провайдеров. / Generates OAuth authorization for InstantCMS with support for various providers.',
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
    async (opts: any) => scaffoldOAuth(opts as Parameters<typeof scaffoldOAuth>[0])
  );

  // ── 53. Генерация компонента ───────────────────────────────────────────
  defineTool(
    server,
    'scaffold_component',
    'Генерация полного компонента InstantCMS с backend, frontend, model. / Generates a complete InstantCMS component with backend, frontend, model.',
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
    async (opts: any) => scaffoldComponent(opts as Parameters<typeof scaffoldComponent>[0])
  );

  // ── 54. Генерация виджета ──────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_widget',
    'Генерация виджета InstantCMS с настройками и шаблонами. / Generates an InstantCMS widget with settings and templates.',
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
    async (opts: any) => scaffoldWidget(opts as Parameters<typeof scaffoldWidget>[0])
  );

  // ── 55. Генерация темы шаблона ─────────────────────────────────────────
  defineTool(
    server,
    'scaffold_template_theme',
    'Генерация темы шаблона InstantCMS с layout, стилями и поддержкой dark mode. / Generates an InstantCMS template theme with layout, styles and dark mode support.',
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
    async (opts: any) => scaffoldTheme(opts as Parameters<typeof scaffoldTheme>[0])
  );

  // RESOURCES (статичные данные для контекста)
}
