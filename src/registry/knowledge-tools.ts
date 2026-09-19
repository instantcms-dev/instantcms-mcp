import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { listHooks, getHookDetails, searchHooks } from '../tools/hooks-tool.js';
import {
  getComponentApi,
  listComponents,
  validateAddon,
  getFieldTypes,
  getCodeExample,
} from '../tools/addon-tool.js';
import { scaffoldTemplate } from '../tools/scaffold-tool.js';
import { scaffoldLayoutScheme, listLayoutPresets, layoutPresets } from '../tools/layout-tool.js';
import {
  introspectDatabase,
  listContentTypes,
  listDatabaseEvents,
  describeTable,
} from '../tools/db-tool.js';
import {
  analyzeController,
  listControllers,
  getControllerActionsList,
  listSystemTraits,
} from '../tools/controllers-tool.js';
import { hookCategories } from '../data/hooks.js';
import { templateStructure } from '../data/schemas.js';
import { defineTool, defineToolWithManualResult } from '../utils/define-tool.js';
import { errorResult, successResult } from '../utils/mcp-result.js';

export function registerKnowledgeTools(server: McpServer): void {
  // ── 3. Список хуков ──────────────────────────────────────────────────────
  defineTool(
    server,
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
      limit: z.number().int().min(1).max(200).optional(),
      cursor: z.string().optional(),
    },
    async ({ category, type, limit, cursor }: any) => {
      const result = listHooks(category, type, { limit, cursor }) as Record<string, unknown>;
      return result;
    }
  );

  // ── 4. Детали хука ───────────────────────────────────────────────────────
  defineTool(
    server,
    'get_hook_details',
    'Подробная информация о конкретном хуке: параметры, возвращаемый тип, пример реализации, как зарегистрировать в manifest.xml',
    {
      hook_name: z
        .string()
        .describe('Имя хука. Пример: content_after_add_approve, user_registered, html_filter'),
    },
    async ({ hook_name }: any) => {
      const result = getHookDetails(hook_name) ?? { error: 'Hook not found', hook_name };
      return result as Record<string, unknown>;
    }
  );

  // ── 5. Поиск хуков ───────────────────────────────────────────────────────
  defineTool(
    server,
    'search_hooks',
    'Полнотекстовый поиск хуков по имени, описанию, категории или параметрам',
    {
      query: z
        .string()
        .describe("Поисковый запрос. Пример: 'после добавления материала', 'profile', 'email'"),
    },
    async ({ query }) => {
      return searchHooks(query as string) as Record<string, unknown>;
    }
  );

  // ── 6. API компонента ────────────────────────────────────────────────────
  defineTool(
    server,
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
      return getComponentApi(component_name as string) as Record<string, unknown>;
    }
  );

  // ── 7. Список компонентов ────────────────────────────────────────────────
  defineTool(
    server,
    'list_components',
    'Список всех документированных компонентов и классов InstantCMS с кратким описанием и способом доступа',
    { limit: z.number().int().min(1).max(200).optional(), cursor: z.string().optional() },
    async ({ limit, cursor }) => {
      const result = listComponents({
        limit: limit as number | undefined,
        cursor: cursor as string | undefined,
      }) as Record<string, unknown>;
      return result;
    }
  );

  // ── 8. Валидация дополнения ──────────────────────────────────────────────
  defineTool(
    server,
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
      return validateAddon(files as Record<string, string>) as Record<string, unknown>;
    }
  );

  // ── 9. Типы полей форм ───────────────────────────────────────────────────
  defineTool(
    server,
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
      return getFieldTypes(field_type as string | undefined) as Record<string, unknown>;
    }
  );

  // ── 10. Примеры кода ─────────────────────────────────────────────────────
  defineTool(
    server,
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
      return getCodeExample(task as string) as Record<string, unknown>;
    }
  );

  // ── 11. Генерация шаблона ────────────────────────────────────────────────
  defineTool(
    server,
    'scaffold_template',
    'Генерирует скаффолд шаблона (темы) для InstantCMS: manifest.php, main.tpl.php, базовые CSS/JS',
    {
      name: z.string().describe('Техническое имя шаблона (латинские буквы). Пример: mytheme'),
      title: z.string().describe('Отображаемое название. Пример: My Beautiful Theme'),
      author: z.string().optional().describe('Имя автора'),
    },
    async opts => {
      return scaffoldTemplate(opts as unknown as Parameters<typeof scaffoldTemplate>[0]) as Record<
        string,
        unknown
      >;
    }
  );

  // ── 12. Структура шаблона ────────────────────────────────────────────────
  defineTool(
    server,
    'get_template_structure',
    'Полная структура шаблона InstantCMS: обязательные и опциональные файлы, переменные доступные в .tpl.php, переопределение шаблонов контроллеров',
    {},
    async () => {
      return {
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
      };
    }
  );

  // ── 13. Генерация схемы виджетов (layout scheme) ─────────────────────────
  defineToolWithManualResult(
    server,
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
    async ({ template, preset, rows }: any) => {
      let input;

      if (preset && !rows) {
        // Use preset
        const p = layoutPresets[preset as keyof typeof layoutPresets];
        input = { ...p.scheme, template: template || p.scheme.template };
      } else if (rows) {
        input = { template: template || 'modern', rows };
      } else {
        // Default: list presets
        return errorResult('Укажите preset или rows', 'Укажите preset или rows', {
          available_presets: listLayoutPresets(),
        });
      }

      const result = scaffoldLayoutScheme(input as Parameters<typeof scaffoldLayoutScheme>[0]);
      return successResult(result as unknown as Record<string, unknown>);
    }
  );

  // ── 14. Список пресетов схем виджетов ────────────────────────────────────
  defineTool(
    server,
    'list_layout_presets',
    'Список готовых пресетов схем расположения виджетов для шаблона modern InstantCMS. Используйте preset в scaffold_layout_scheme для быстрой генерации.',
    {},
    async () => {
      return listLayoutPresets() as Record<string, unknown>;
    }
  );

  // ── 15. Анализ структуры базы данных ──────────────────────────────────────
  defineTool(
    server,
    'introspect_database',
    'Анализ структуры базы данных InstantCMS. Без параметров — список всех таблиц. С параметром table_name — детали конкретной таблицы.',
    {
      table_name: z
        .string()
        .optional()
        .describe('Имя таблицы (без префикса cms_). Пример: users, content_types, widgets'),
    },
    async ({ table_name }: any) => {
      return introspectDatabase(table_name) as Record<string, unknown>;
    }
  );

  // ── 16. Описание конкретной таблицы ──────────────────────────────────────
  defineTool(
    server,
    'describe_table',
    'Подробное описание таблицы: поля, индексы, связи, типы данных. Генерирует примеры SQL-запросов.',
    {
      table_name: z
        .string()
        .describe('Имя таблицы (можно с префиксом cms_ или без). Пример: cms_users, content_types'),
    },
    async ({ table_name }: any) => {
      return describeTable(table_name) as Record<string, unknown>;
    }
  );

  // ── 17. Типы контента ────────────────────────────────────────────────────
  defineTool(
    server,
    'list_content_types',
    'Информация о типах контента: cms_content_types, cms_con_pages, cms_users. Поля, ключи, связи.',
    {},
    async () => {
      return listContentTypes() as Record<string, unknown>;
    }
  );

  // ── 18. Карта событий (events) ────────────────────────────────────────────
  defineTool(
    server,
    'list_database_events',
    'Все зарегистрированные события (хуки) из таблицы cms_events. Показывает какой контроллер на какое событие подписан.',
    {},
    async () => {
      return listDatabaseEvents() as Record<string, unknown>;
    }
  );

  // ── 19. Анализ контроллера ───────────────────────────────────────────────
  defineTool(
    server,
    'analyze_controller',
    'Подробная информация о контроллере: класс, наследование, экшены, трейты, файлы.',
    {
      name: z.string().describe('Имя контроллера. Пример: content, users, messages'),
      type: z.enum(['frontend', 'backend']).optional().describe('Тип контроллера'),
    },
    async ({ name, type }: any) => {
      return analyzeController(name, type) as Record<string, unknown>;
    }
  );

  // ── 20. Список контроллеров ──────────────────────────────────────────────
  defineTool(
    server,
    'list_controllers',
    'Список всех контроллеров: frontend и backend. Можно фильтровать по типу.',
    {
      filter: z.enum(['frontend', 'backend']).optional().describe('Фильтр по типу контроллера'),
    },
    async ({ filter }: any) => {
      return listControllers(filter) as Record<string, unknown>;
    }
  );

  // ── 21. Экшены контроллера ───────────────────────────────────────────────
  defineTool(
    server,
    'get_controller_actions',
    'Список всех экшенов контроллера с параметрами, видимостью и трейтами.',
    {
      name: z.string().describe('Имя контроллера. Пример: content, users'),
      type: z.enum(['frontend', 'backend']).optional().describe('Тип контроллера'),
    },
    async ({ name, type }: any) => {
      return getControllerActionsList(name, type) as Record<string, unknown>;
    }
  );

  // ── 22. Системные трейты ─────────────────────────────────────────────────
  defineTool(
    server,
    'list_system_traits',
    'Список всех системных трейтов icms используемых в контроллерах. Трейты предоставляют готовую функциональность.',
    {},
    async () => {
      return listSystemTraits() as Record<string, unknown>;
    }
  );
}
