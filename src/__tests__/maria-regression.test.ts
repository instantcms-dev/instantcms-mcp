import * as mysql from 'mysql2/promise';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../server.js';
import { closePool, getTableInfo, listTables } from '../tools/mariadb.js';
import { mariaGetTableData } from '../tools/maria-tool.js';

jest.mock('mysql2/promise', () => ({ createPool: jest.fn() }));
const execute = jest.fn();

beforeEach(() => {
  execute.mockReset();
  (mysql.createPool as jest.Mock).mockReturnValue({
    execute,
    end: jest.fn().mockResolvedValue(undefined),
  });
});
afterEach(async () => {
  await closePool();
});

describe('MariaDB bindings and errors (no live database)', () => {
  test('table data binds filter values and pagination separately', async () => {
    execute.mockResolvedValue([[{ id: 1 }], [{ name: 'id' }]]);
    const result = await mariaGetTableData('cms_users', {
      limit: 10,
      offset: 20,
      filter: { title: "Author's page", deleted_at: null },
    });
    expect(execute).toHaveBeenCalledWith(
      'SELECT * FROM `cms_users` WHERE `title` = ? AND `deleted_at` IS NULL ORDER BY `id` DESC LIMIT ? OFFSET ?',
      ["Author's page", 10, 20]
    );
    expect(result.rowCount).toBe(1);
  });

  test('invalid pagination and unsupported filter types never query the database', async () => {
    for (const limit of [0, 1.5, Infinity, 1001]) {
      expect(await mariaGetTableData('cms_users', { limit })).toHaveProperty('error');
    }
    expect(await mariaGetTableData('cms_users', { filter: { title: {} } })).toHaveProperty('error');
    expect(execute).not.toHaveBeenCalled();
  });

  test('table metadata binds the table name in both information_schema queries', async () => {
    execute.mockResolvedValueOnce([[{ name: 'id', type: 'int', nullable: 'NO' }], []]);
    execute.mockResolvedValueOnce([[], []]);
    execute.mockResolvedValueOnce([[{ cnt: 3 }], []]);
    const info = await getTableInfo('cms_users');
    expect(execute.mock.calls[0][1]).toEqual(['cms_users']);
    expect(execute.mock.calls[1][1]).toEqual(['cms_users']);
    expect(info?.rowCount).toBe(3);
  });

  test('connection failures are not reported as empty data or missing tables', async () => {
    execute.mockRejectedValue(new Error('Database unavailable'));
    await expect(getTableInfo('cms_users')).rejects.toThrow('Database unavailable');
    await expect(listTables()).rejects.toThrow('Database unavailable');
  });

  test('database errors are marked isError at the MCP boundary', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    const client = new Client({ name: 'maria-regression', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      execute.mockRejectedValue(new Error('Database unavailable'));
      const result = await client.callTool({
        name: 'maria_get_table_data',
        arguments: { table_name: 'cms_users' },
      });
      expect(result.isError).toBe(true);
      expect(result.structuredContent).toMatchObject({ code: 'TOOL_EXECUTION_ERROR' });
      execute.mockResolvedValue([[{ id: 1 }], [{ name: 'id' }]]);
      const success = await client.callTool({
        name: 'maria_get_table_data',
        arguments: { table_name: 'cms_users' },
      });
      expect(success.isError).not.toBe(true);
      expect(success.structuredContent).toMatchObject({ rowCount: 1 });
    } finally {
      await client.close();
      await server.close();
    }
  });
});
