import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  mariaExecuteQuery,
  mariaListTables,
  mariaDescribeTable,
  mariaGetDatabaseInfo,
  mariaSearchTables,
  mariaGetTableData,
} from '../tools/maria-tool.js';

export function registerDatabaseTools(server: McpServer): void {
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
}
