import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
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

  // RESOURCES (статичные данные для контекста)
}
