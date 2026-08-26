import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { scaffoldMigration } from '../tools/migration-tool.js';
import { listLangKeys, scaffoldLang } from '../tools/lang-tool.js';

export function registerLanguageTools(server: McpServer): void {
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
}
