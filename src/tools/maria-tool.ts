import {
  executeQuery,
  getTableInfo,
  listTables,
  getDatabaseInfo,
  showIndexes,
  type QueryParameter,
} from './mariadb.js';

export async function mariaExecuteQuery(sql: string): Promise<Record<string, unknown>> {
  const result = await executeQuery(sql);

  if (result.error) {
    return {
      success: false,
      error: result.error,
      query: result.query,
      executionTime: result.executionTime,
    };
  }

  return {
    success: true,
    columns: result.columns,
    rows: result.rows,
    rowCount: result.rowCount,
    query: result.query,
    executionTime: result.executionTime,
  };
}

export async function mariaListTables(): Promise<Record<string, unknown>> {
  const tables = await listTables();
  return {
    tables,
    count: tables.length,
  };
}

export async function mariaDescribeTable(tableName: string): Promise<Record<string, unknown>> {
  if (!/^[A-Za-z0-9_$]+$/.test(tableName)) {
    return { error: `Недопустимое имя таблицы: ${tableName}` };
  }
  const info = await getTableInfo(tableName);

  if (!info) {
    return {
      error: `Table "${tableName}" not found`,
    };
  }

  return {
    name: info.name,
    comment: info.comment,
    rowCount: info.rowCount,
    columns: info.columns.map(c => ({
      name: c.name,
      type: c.type,
      nullable: c.nullable,
      key: c.key,
      default: c.default,
      extra: c.extra,
      comment: c.comment,
    })),
    indexes: info.indexes.map(i => ({
      name: i.name,
      type: i.type,
      columns: i.columns,
      unique: i.unique,
    })),
  };
}

export async function mariaGetDatabaseInfo(): Promise<Record<string, unknown>> {
  return await getDatabaseInfo();
}

export async function mariaShowIndexes(tableName: string): Promise<Record<string, unknown>> {
  if (!/^[A-Za-z0-9_$]+$/.test(tableName)) {
    return { error: `Недопустимое имя таблицы: ${tableName}` };
  }
  const result = await showIndexes(tableName);
  return {
    table: tableName,
    indexes: result.rows,
    columnCount: result.columns.length,
    executionTime: result.executionTime,
    error: result.error,
  };
}

export async function mariaSearchTables(pattern: string): Promise<Record<string, unknown>> {
  const tables = await listTables();
  const matching = tables.filter(t => t.toLowerCase().includes(pattern.toLowerCase()));

  return {
    pattern,
    matched: matching,
    count: matching.length,
  };
}

export async function mariaGetTableData(
  tableName: string,
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
    filter?: Record<string, unknown>;
  }
): Promise<Record<string, unknown>> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 1000 ||
    !Number.isSafeInteger(offset) ||
    offset < 0
  ) {
    return { error: 'Expected integer limit 1–1000 and non-negative integer offset' };
  }
  const orderBy = /^[A-Za-z0-9_$]+$/.test(options?.orderBy || '')
    ? (options?.orderBy as string)
    : 'id';
  const orderDir = options?.orderDir === 'ASC' ? 'ASC' : 'DESC';

  if (!/^[A-Za-z0-9_$]+$/.test(tableName)) {
    return { error: `Недопустимое имя таблицы: ${tableName}` };
  }

  let sql = `SELECT * FROM \`${tableName}\``;
  const params: QueryParameter[] = [];

  if (options?.filter) {
    const filterConditions: string[] = [];
    for (const [key, value] of Object.entries(options.filter)) {
      if (!/^[A-Za-z0-9_$]+$/.test(key)) {
        return { error: `Недопустимое имя колонки в фильтре: ${key}` };
      }
      if (value === null) {
        filterConditions.push(`\`${key}\` IS NULL`);
        continue;
      }
      if (
        typeof value !== 'string' &&
        typeof value !== 'boolean' &&
        !(typeof value === 'number' && Number.isFinite(value))
      ) {
        return { error: 'Filter values must be strings, finite numbers, booleans or null' };
      }
      filterConditions.push(`\`${key}\` = ?`);
      params.push(value);
    }
    if (filterConditions.length > 0) {
      sql += ` WHERE ${filterConditions.join(' AND ')}`;
    }
  }

  sql += ` ORDER BY \`${orderBy}\` ${orderDir} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const result = await executeQuery(sql, params);

  if (result.error) {
    return {
      error: result.error,
      query: result.query,
    };
  }

  return {
    table: tableName,
    columns: result.columns,
    rows: result.rows,
    rowCount: result.rowCount,
    pagination: {
      limit,
      offset,
      orderBy,
      orderDir,
    },
    query: result.query,
    executionTime: result.executionTime,
  };
}
