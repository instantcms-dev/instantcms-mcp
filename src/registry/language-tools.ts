import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { scaffoldMigration } from '../tools/migration-tool.js';
import { listLangKeys, scaffoldLang } from '../tools/lang-tool.js';
import { defineTool } from '../utils/define-tool.js';

export function registerLanguageTools(server: McpServer): void {
  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 40. Список языковых ключей ────────────────────────────────────────
  defineTool(
    server,
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
    async args =>
      listLangKeys(args as { addon_name: string; category?: string }) as unknown as Record<
        string,
        unknown
      >
  );

  // ── 41. Генерация языкового файла ───────────────────────────────────
  defineTool(
    server,
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
    async args =>
      scaffoldLang(
        args as {
          addon_name: string;
          keys?: string[];
          custom_keys?: { key: string; value: string; category?: string }[];
        }
      ) as Record<string, unknown>
  );

  // ── 42. Генерация миграции с файлами ────────────────────────────────
  defineTool(
    server,
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
    async args =>
      scaffoldMigration(args as Parameters<typeof scaffoldMigration>[0]) as Record<string, unknown>
  );
}
