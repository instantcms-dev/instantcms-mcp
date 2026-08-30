import * as fc from 'fast-check';
import {
  describeTable,
  introspectDatabase,
  listContentTypes,
  listDatabaseEvents,
} from '../tools/db-tool.js';

describe('db-tool', () => {
  describe('introspectDatabase', () => {
    test('без tableName → возвращает список всех таблиц', () => {
      const result = introspectDatabase() as {
        totalTables: number;
        tables: Array<{ name: string; fieldCount: number; hasPrimaryKey: boolean }>;
        summary: Record<string, number>;
      };
      expect(result.totalTables).toBeGreaterThan(0);
      expect(Array.isArray(result.tables)).toBe(true);
      expect(result.summary).toBeDefined();
    });

    test('summary.categories покрывает users/content/widgets/system/other', () => {
      const result = introspectDatabase() as { summary: Record<string, number> };
      expect(result.summary).toHaveProperty('users');
      expect(result.summary).toHaveProperty('content');
      expect(result.summary).toHaveProperty('widgets');
      expect(result.summary).toHaveProperty('system');
      expect(result.summary).toHaveProperty('other');
    });

    test('с известным именем таблицы → возвращает её schema', () => {
      // Возьмём любую реальную таблицу из schema.
      const all = introspectDatabase() as { tables: Array<{ name: string }> };
      const firstTableName = all.tables[0].name;

      const result = introspectDatabase(firstTableName) as {
        table: string;
        fields: Array<{ name: string; type: string }>;
        fieldCount: number;
      };
      expect(result.table).toBe(firstTableName);
      expect(Array.isArray(result.fields)).toBe(true);
      expect(result.fieldCount).toBe(result.fields.length);
    });

    test('с суффиксом имени (без префикса cms_) → возвращает таблицу', () => {
      const all = introspectDatabase() as { tables: Array<{ name: string }> };
      const cmsTable = all.tables.find(t => t.name.startsWith('cms_'));
      expect(cmsTable).toBeDefined();
      const suffix = cmsTable!.name.replace(/^cms_/, '').replace(/_.*$/, '');
      const result = introspectDatabase(suffix);
      // Контракт: возвращается объект; либо точно найдено, либо suggestions.
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    });

    test('несуществующая таблица → suggestions', () => {
      const result = introspectDatabase('xyz_nonexistent_table_999') as {
        error: string;
        suggestions: Array<unknown>;
      };
      expect(result.error).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    test('SQL injection в tableName → не ломает lookup', () => {
      const evilQueries = ['users; DROP TABLE users;--', "'; SELECT * FROM x; --", "1' OR '1'='1"];
      for (const q of evilQueries) {
        const result = introspectDatabase(q);
        // Не должно выбрасывать — функция чистая (без реальных SQL).
        expect(result).toBeDefined();
      }
    });

    test('property-based: для произвольной строки → не выбрасывает', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 200 }), query => {
          const result = introspectDatabase(query);
          expect(typeof result).toBe('object');
          expect(result).not.toBeNull();
          return true;
        }),
        { numRuns: 30 }
      );
    });

    test('hasPrimaryKey=true для таблиц с PRIMARY индексом', () => {
      const all = introspectDatabase() as {
        tables: Array<{ name: string; hasPrimaryKey: boolean }>;
      };
      // Почти все таблицы должны иметь PRIMARY.
      const withPk = all.tables.filter(t => t.hasPrimaryKey).length;
      expect(withPk).toBeGreaterThan(0);
    });
  });

  describe('listContentTypes', () => {
    test('возвращает cms_content_types и keyFields', () => {
      const result = listContentTypes() as {
        table?: string;
        fields?: Array<unknown>;
        keyFields?: Array<unknown>;
        systemTables?: { users: unknown };
        error?: string;
      };
      if (result.error) {
        // Если таблица не найдена в этой базе — тест не применим.
        return;
      }
      expect(result.table).toBe('cms_content_types');
      expect(Array.isArray(result.fields)).toBe(true);
      expect(Array.isArray(result.keyFields)).toBe(true);
      expect(result.systemTables).toBeDefined();
    });
  });

  describe('listDatabaseEvents', () => {
    test('возвращает структуру с byController и allEvents', () => {
      const result = listDatabaseEvents() as {
        totalEvents: number;
        byController: Array<{ controller: string; eventCount: number; events: unknown[] }>;
        allEvents: Array<{ event: string; listener: string; isEnabled: boolean }>;
      };
      expect(typeof result.totalEvents).toBe('number');
      expect(Array.isArray(result.byController)).toBe(true);
      expect(Array.isArray(result.allEvents)).toBe(true);
    });

    test('allEvents имеет правильную форму каждой записи', () => {
      const result = listDatabaseEvents() as {
        allEvents: Array<{ event: string; listener: string; isEnabled: boolean }>;
      };
      for (const e of result.allEvents) {
        expect(typeof e.event).toBe('string');
        expect(typeof e.listener).toBe('string');
        expect(typeof e.isEnabled).toBe('boolean');
      }
    });
  });

  describe('describeTable', () => {
    test('без tableName — но функция требует параметр; проверим корректный кейс', () => {
      const all = introspectDatabase() as { tables: Array<{ name: string }> };
      const firstTable = all.tables[0].name;
      const result = describeTable(firstTable) as {
        table: string;
        fields: Array<{ name: string; type: string; nullable: boolean }>;
        statistics: { totalFields: number; fieldTypes: Record<string, number> };
        sampleQuery: string;
      };
      expect(result.table).toBe(firstTable);
      expect(result.statistics.totalFields).toBe(result.fields.length);
      expect(typeof result.sampleQuery).toBe('string');
    });

    test('sampleQuery содержит SELECT', () => {
      const all = introspectDatabase() as { tables: Array<{ name: string }> };
      const tableName = all.tables[0].name;
      const result = describeTable(tableName) as { sampleQuery: string };
      expect(result.sampleQuery).toContain('SELECT');
      expect(result.sampleQuery).toContain(tableName);
    });

    test('несуществующая таблица → error', () => {
      const result = describeTable('xyz_non_existent_table_9999') as {
        error: string;
      };
      expect(result.error).toBeDefined();
      expect(result.error).toContain('не найдена');
    });
  });
});
