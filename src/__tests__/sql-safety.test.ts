import * as mysql from 'mysql2/promise';

import {
  assertSqlAllowed,
  classifySql,
  hasMultipleStatements,
  redactSecrets,
} from '../utils/sql-safety.js';
import { closePool, executeQuery } from '../tools/mariadb.js';
import { mariaExecuteQuery } from '../tools/maria-tool.js';

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

/**
 * Инструменты работают с чужой базой: по умолчанию только чтение, запись —
 * по явному подтверждению, опасные запросы запрещены всегда.
 */
describe('sql safety', () => {
  test('чтение распознаётся как read', () => {
    for (const sql of [
      'SELECT * FROM cms_users LIMIT 10',
      'SHOW TABLES',
      'DESCRIBE cms_users',
      'EXPLAIN SELECT 1',
      'WITH x AS (SELECT 1) SELECT * FROM x',
    ]) {
      expect(classifySql(sql)).toBe('read');
    }
  });

  test('изменение данных распознаётся как write', () => {
    for (const sql of [
      'INSERT INTO cms_users (id) VALUES (1)',
      'UPDATE cms_users SET id = 1',
      'DELETE FROM cms_users',
      'DROP TABLE cms_users',
      'CREATE TABLE t (id INT)',
      'SET NAMES utf8',
      'CALL do_something()',
    ]) {
      expect(classifySql(sql)).toBe('write');
    }
  });

  test('опасные запросы запрещены всегда', () => {
    const dangerous = [
      "SELECT * FROM cms_users INTO OUTFILE '/tmp/x'",
      "SELECT LOAD_FILE('/etc/passwd')",
      'GRANT ALL ON *.* TO u',
      'CREATE USER u',
      'SET GLOBAL max_connections = 1',
      'SHUTDOWN',
    ];
    for (const sql of dangerous) {
      expect(classifySql(sql)).toBe('dangerous');
      expect(() => assertSqlAllowed(sql, { allowWrite: true })).toThrow(/запрещ/i);
    }
  });

  test('несколько инструкций запрещены', () => {
    expect(hasMultipleStatements('SELECT 1; DROP TABLE cms_users')).toBe(true);
    expect(hasMultipleStatements('SELECT 1;')).toBe(false);
    expect(hasMultipleStatements("SELECT ';' AS s")).toBe(false);
    expect(hasMultipleStatements('SELECT 1 /* ; */')).toBe(false);
    expect(hasMultipleStatements('-- ;\nSELECT 1')).toBe(false);

    expect(() => assertSqlAllowed('SELECT 1; DROP TABLE cms_users')).toThrow(
      /Несколько инструкций/
    );
  });

  test('запись требует подтверждения', () => {
    expect(() => assertSqlAllowed('DELETE FROM cms_users')).toThrow(/allow_write/);
    expect(assertSqlAllowed('DELETE FROM cms_users', { allowWrite: true })).toBe('write');
  });

  test('режим только для чтения блокирует запись даже с подтверждением', () => {
    expect(() =>
      assertSqlAllowed('UPDATE cms_users SET id = 1', { allowWrite: true, readOnly: true })
    ).toThrow(/только для чтения/);
    expect(assertSqlAllowed('SELECT 1', { readOnly: true })).toBe('read');
  });

  test('секреты маскируются в текстах', () => {
    expect(redactSecrets('Access denied for user root with password=secret123')).toContain(
      'password=***'
    );
    expect(redactSecrets('DB_PASSWORD=hunter2')).toBe('DB_PASSWORD=***');
    expect(redactSecrets('Authorization: Bearer abc.def')).toBe('Authorization: Bearer ***');
    expect(redactSecrets('https://x/?token=abc&a=1')).toContain('token=***');
  });

  test('executeQuery не выполняет запись без подтверждения', async () => {
    const result = await executeQuery('DROP TABLE cms_users');
    expect(result.error).toMatch(/allow_write/);
    expect(execute).not.toHaveBeenCalled();
  });

  test('executeQuery передаёт подтверждение и таймаут', async () => {
    execute.mockResolvedValue([[], []]);
    await executeQuery('DELETE FROM cms_users', [], { allowWrite: true, timeoutMs: 1234 });

    expect(execute).toHaveBeenCalledWith({ sql: 'DELETE FROM cms_users', timeout: 1234 }, []);
  });

  test('executeQuery ограничивает число строк и помечает усечение', async () => {
    execute.mockResolvedValue([[{ id: 1 }, { id: 2 }, { id: 3 }], [{ name: 'id' }]]);

    const result = await executeQuery('SELECT id FROM cms_users', [], { maxRows: 2 });

    expect(result.rowCount).toBe(2);
    expect(result.truncated).toBe(true);
    expect(result.rows).toHaveLength(2);
  });

  test('инструмент сообщает об усечении', async () => {
    execute.mockResolvedValue([[{ id: 1 }, { id: 2 }], [{ name: 'id' }]]);
    const result = (await mariaExecuteQuery('SELECT 1')) as {
      truncated: boolean;
      rowCount: number;
    };
    expect(result.rowCount).toBe(2);
    expect(result.truncated).toBe(false);
  });

  test('DB_READONLY=1 запрещает запись и в инструменте', async () => {
    const previous = process.env.DB_READONLY;
    process.env.DB_READONLY = '1';
    try {
      const result = await executeQuery('DELETE FROM cms_users', [], { allowWrite: true });
      expect(result.error).toMatch(/только для чтения/);
      expect(execute).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.DB_READONLY;
      else process.env.DB_READONLY = previous;
    }
  });
});
