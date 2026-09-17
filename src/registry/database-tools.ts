import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { defineTool } from '../utils/define-tool.js';
import {
  mariaExecuteQuery,
  mariaListTables,
  mariaDescribeTable,
  mariaGetDatabaseInfo,
  mariaSearchTables,
  mariaGetTableData,
} from '../tools/maria-tool.js';

async function databaseResult(result: Promise<Record<string, unknown>>) {
  const data = await result;
  if (typeof data.error === 'string') throw new Error(data.error);
  return data;
}

export function registerDatabaseTools(server: McpServer): void {
  // Внимание: Для работы требуется настроить переменные окружения:
  // DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE

  defineTool(
    server,
    'maria_execute_query',
    'Выполняет произвольный SQL запрос к базе данных MariaDB. Возвращает результат с колонками, строками и временем выполнения.',
    {
      sql: z
        .string()
        .describe('SQL запрос для выполнения. Пример: SELECT * FROM cms_users LIMIT 10'),
    },
    async ({ sql }) => databaseResult(mariaExecuteQuery(String(sql)))
  );

  defineTool(
    server,
    'maria_list_tables',
    'Возвращает список всех таблиц в текущей базе данных MariaDB.',
    {},
    async () => mariaListTables()
  );

  defineTool(
    server,
    'maria_describe_table',
    'Подробное описание структуры таблицы: колонки, типы, индексы, количество строк.',
    {
      table_name: z.string().describe('Имя таблицы. Пример: cms_users, cms_content'),
    },
    async ({ table_name }) => databaseResult(mariaDescribeTable(String(table_name)))
  );

  defineTool(
    server,
    'maria_get_database_info',
    'Статистика базы данных: имя, количество таблиц, строк, размер.',
    {},
    async () => mariaGetDatabaseInfo()
  );

  defineTool(
    server,
    'maria_search_tables',
    'Поиск таблиц по имени. Полезно когда не помните точное имя таблицы.',
    {
      pattern: z.string().describe('Строка для поиска. Пример: users, content, widget'),
    },
    async ({ pattern }) => mariaSearchTables(String(pattern))
  );

  defineTool(
    server,
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
    async ({ table_name, limit, offset, order_by, order_dir, filter }) =>
      databaseResult(
        mariaGetTableData(String(table_name), {
          limit: Number(limit),
          offset: Number(offset),
          orderBy: String(order_by),
          orderDir: order_dir === 'ASC' ? 'ASC' : 'DESC',
          filter: filter as Record<string, unknown> | undefined,
        })
      )
  );
}
