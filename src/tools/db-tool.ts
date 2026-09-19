import type { DbTable } from '../data/database-schema.js';
import { lazyModule } from '../utils/lazy-module.js';

// Схема БД и карта событий нужны только при вызове инструментов — лениво.
const loadDatabaseSchema = lazyModule<typeof import('../data/database-schema.js')>(
  '../data/database-schema.js'
);
const loadEventsMap = lazyModule<typeof import('../data/events-map.js')>('../data/events-map.js');

export function introspectDatabase(tableName?: string): object {
  if (tableName) {
    const table = loadDatabaseSchema().databaseSchema.tables.find(
      t => t.name === tableName || t.name.endsWith(`_${tableName}`)
    );

    if (!table) {
      const similar = loadDatabaseSchema().databaseSchema.tables.filter(
        t => t.name.includes(tableName) || (t.comment && t.comment.includes(tableName))
      );
      return {
        error: `Таблица "${tableName}" не найдена`,
        suggestions: similar.slice(0, 5).map(t => ({
          name: t.name,
          comment: t.comment,
        })),
      };
    }

    return {
      table: table.name,
      comment: table.comment,
      fieldCount: table.fields.length,
      indexCount: table.indexes.length,
      fields: table.fields.map(f => ({
        name: f.name,
        type: f.type,
        nullable: f.nullable,
        key: f.key,
        default: f.default,
        comment: f.comment,
      })),
      indexes: table.indexes.map(i => ({
        name: i.name,
        type: i.type,
        fields: i.fields,
      })),
      relationships: findRelationships(table.name),
    };
  }

  return {
    totalTables: loadDatabaseSchema().databaseSchema.tableCount,
    tables: loadDatabaseSchema().databaseSchema.tables.map(t => ({
      name: t.name,
      comment: t.comment,
      fieldCount: t.fields.length,
      hasPrimaryKey: t.indexes.some(i => i.name === 'PRIMARY'),
    })),
    summary: generateSummary(),
  };
}

export function listContentTypes(): object {
  const contentTable = loadDatabaseSchema().databaseSchema.tables.find(
    t => t.name === 'cms_content_types'
  );

  if (!contentTable) {
    return { error: 'Таблица content_types не найдена' };
  }

  const usersTable = loadDatabaseSchema().databaseSchema.tables.find(t => t.name === 'cms_users');

  return {
    table: contentTable.name,
    fields: contentTable.fields.map(f => ({
      name: f.name,
      type: f.type,
      comment: f.comment,
    })),
    keyFields: contentTable.fields.filter(f => f.key === 'PRI' || f.key === 'UNI'),
    systemTables: {
      users: usersTable
        ? {
            name: usersTable.name,
            comment: usersTable.comment,
            keyFields: usersTable.fields.filter(f => f.key === 'PRI').map(f => f.name),
          }
        : null,
    },
  };
}

export function listDatabaseEvents(): object {
  return {
    totalEvents: loadEventsMap().eventsMap.eventCount,
    byController: Object.entries(loadEventsMap().eventsMap.byController).map(
      ([controller, events]) => ({
        controller,
        eventCount: events.length,
        events: events.slice(0, 10),
      })
    ),
    allEvents: loadEventsMap().eventsMap.events.map(e => ({
      event: e.event,
      listener: e.listener,
      isEnabled: e.isEnabled,
    })),
  };
}

export function describeTable(tableName: string): object {
  const table = loadDatabaseSchema().databaseSchema.tables.find(
    t => t.name === tableName || t.name === `cms_${tableName}` || t.name.endsWith(`_${tableName}`)
  );

  if (!table) {
    return { error: `Таблица "${tableName}" не найдена` };
  }

  const fieldTypes: Record<string, number> = {};
  for (const field of table.fields) {
    const baseType = field.type.replace(/[()].*/, '');
    fieldTypes[baseType] = (fieldTypes[baseType] || 0) + 1;
  }

  return {
    table: table.name,
    comment: table.comment,
    statistics: {
      totalFields: table.fields.length,
      totalIndexes: table.indexes.length,
      fieldTypes,
    },
    fields: table.fields.map(f => ({
      name: f.name,
      type: f.type,
      nullable: f.nullable,
      key: f.key,
      default: f.default,
      comment: f.comment,
      extra: f.extra,
    })),
    indexes: table.indexes.map(i => ({
      name: i.name,
      type: i.type,
      fields: i.fields,
    })),
    relationships: findRelationships(table.name),
    sampleQuery: generateSampleQuery(table),
  };
}

function findRelationships(tableName: string): object[] {
  const relationships: object[] = [];
  const baseName = tableName.replace(/^cms_/, '');

  for (const table of loadDatabaseSchema().databaseSchema.tables) {
    for (const field of table.fields) {
      if (field.name === baseName || field.name === `${baseName}_id`) {
        if (table.name !== tableName) {
          relationships.push({
            type: 'has_many',
            target: table.name,
            via: field.name,
          });
        }
      }
    }

    if (table.name.includes(baseName) && table.name !== tableName) {
      for (const index of table.indexes) {
        if (index.fields.some(f => f.includes('id') || f.includes(baseName))) {
          relationships.push({
            type: 'related',
            target: table.name,
            on: index.fields,
          });
        }
      }
    }
  }

  return relationships.slice(0, 10);
}

function generateSummary(): object {
  const categories: Record<string, number> = {
    users: 0,
    content: 0,
    widgets: 0,
    system: 0,
    other: 0,
  };

  for (const table of loadDatabaseSchema().databaseSchema.tables) {
    if (table.name.startsWith('cms_users')) categories.users++;
    else if (table.name.startsWith('cms_con_') || table.name.includes('content'))
      categories.content++;
    else if (table.name.startsWith('cms_widgets')) categories.widgets++;
    else if (['cms_sessions', 'cms_jobs', 'cms_scheduler'].includes(table.name))
      categories.system++;
    else categories.other++;
  }

  return categories;
}

function generateSampleQuery(table: DbTable): string {
  const primaryKey = table.indexes.find(i => i.name === 'PRIMARY');
  const pk = primaryKey?.fields[0] || 'id';

  return [
    `-- Получить запись по ID`,
    `SELECT * FROM ${table.name} WHERE ${pk} = 1;`,
    ``,
    `-- Получить список с пагинацией`,
    `SELECT * FROM ${table.name} ORDER BY ${pk} DESC LIMIT 10 OFFSET 0;`,
    ``,
    `-- Фильтрация по полю`,
    table.fields.find(f => f.name === 'is_pub')
      ? `SELECT * FROM ${table.name} WHERE is_pub = 1 ORDER BY date_pub DESC;`
      : null,
    `-- JOIN с пользователями`,
    table.fields.some(f => f.name === 'user_id')
      ? `SELECT t.*, u.nickname as user_nickname \nFROM ${table.name} t\nLEFT JOIN cms_users u ON u.id = t.user_id\nWHERE t.id = 1;`
      : null,
  ]
    .filter(Boolean)
    .join('\n');
}
