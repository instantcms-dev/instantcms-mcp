import * as fs from 'fs';
import * as path from 'path';

export interface TableField {
  name: string;
  type: string;
  nullable: boolean;
  key?: 'PRI' | 'UNI' | 'MUL';
  default?: string;
  comment?: string;
  extra?: string;
}

export interface TableIndex {
  name: string;
  fields: string[];
  type?: string;
}

export interface DatabaseTable {
  name: string;
  comment?: string;
  fields: TableField[];
  indexes: TableIndex[];
}

export interface DatabaseSchema {
  tables: DatabaseTable[];
  tableCount: number;
  generatedAt: string;
  sourceFile: string;
}

const PREFIX_PLACEHOLDER = '{#}';

export function parseSqlFile(filePath: string): DatabaseSchema {
  const content = fs.readFileSync(filePath, 'utf-8');
  const tables: DatabaseTable[] = [];

  const statements = content.split(/DROP TABLE IF EXISTS.*?;/i);

  for (const statement of statements) {
    if (!statement.trim()) continue;

    const createMatch = statement.match(/CREATE TABLE.*?\(([\s\S]*?)\)\s*ENGINE/i);
    if (!createMatch) continue;

    const tableNameMatch = statement.match(/CREATE TABLE\s+`?([^`\s]+)`?\s*\(/i);
    if (!tableNameMatch) continue;

    const tableName = tableNameMatch[1].replace(PREFIX_PLACEHOLDER, 'cms_');
    const tableCommentMatch = statement.match(/COMMENT='([^']*)'/);
    const tableComment = tableCommentMatch ? tableCommentMatch[1] : undefined;

    const columnsBlock = createMatch[1];
    const lines = columnsBlock.split(/,\s*\n/);

    const fields: TableField[] = [];
    const indexes: TableIndex[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (
        trimmed.startsWith('PRIMARY KEY') ||
        trimmed.startsWith('UNIQUE KEY') ||
        trimmed.startsWith('KEY')
      ) {
        const indexMatch = parseIndex(trimmed, tableName);
        if (indexMatch) {
          indexes.push(indexMatch);
        }
        continue;
      }

      const fieldMatch = parseField(trimmed);
      if (fieldMatch) {
        fields.push(fieldMatch);
      }
    }

    tables.push({
      name: tableName,
      comment: tableComment,
      fields,
      indexes,
    });
  }

  return {
    tables,
    tableCount: tables.length,
    generatedAt: process.env.KNOWLEDGE_GENERATED_AT || new Date().toISOString(),
    sourceFile: path.basename(filePath),
  };
}

function parseField(line: string): TableField | null {
  const match = line.match(/`?(\w+)`?\s+((?:ENUM\([^)]+\)|[\w()]+))(?:\s+(.+))?/i);
  if (!match) return null;

  const name = match[1];
  const type = match[2].toUpperCase();
  const rest = match[3] || '';

  const nullable = !rest.toUpperCase().includes('NOT NULL');
  const defaultMatch = rest.match(/DEFAULT\s+('[^']*'|"[^"]*"|[^\s,]+)/i);
  const commentMatch = rest.match(/COMMENT\s+'([^']*)'/i);
  const keyMatch = rest.match(/(PRIMARY|UNIQUE)?\s*KEY/i);

  let key: TableField['key'] | undefined;
  if (keyMatch) {
    if (keyMatch[1]?.toUpperCase() === 'PRIMARY') key = 'PRI';
    else if (keyMatch[0].toUpperCase().includes('UNIQUE')) key = 'UNI';
  }

  const extraMatch = rest.match(/(AUTO_INCREMENT|ON UPDATE CURRENT_TIMESTAMP)/i);

  return {
    name,
    type,
    nullable,
    default: defaultMatch ? defaultMatch[1].replace(/^['"]|['"]$/g, '') : undefined,
    comment: commentMatch ? commentMatch[1] : undefined,
    key,
    extra: extraMatch ? extraMatch[1] : undefined,
  };
}

function parseIndex(line: string, _tableName: string): TableIndex | null {
  const primaryMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
  if (primaryMatch) {
    const fields = primaryMatch[1].split(',').map(f => f.trim().replace(/`/g, ''));
    return { name: 'PRIMARY', fields };
  }

  const uniqueMatch = line.match(/UNIQUE\s+KEY\s+`?(\w+)`?\s*\(([^)]+)\)/i);
  if (uniqueMatch) {
    const fields = uniqueMatch[2].split(',').map(f => f.trim().replace(/`/g, ''));
    return { name: uniqueMatch[1], fields, type: 'UNIQUE' };
  }

  const keyMatch = line.match(/KEY\s+`?(\w+)`?\s*\(([^)]+)\)/i);
  if (keyMatch) {
    const fields = keyMatch[2].split(',').map(f => f.trim().replace(/`/g, ''));
    return { name: keyMatch[1], fields };
  }

  const fulltextMatch = line.match(/FULLTEXT\s+(?:KEY\s+)?`?(\w+)`?\s*\(([^)]+)\)/i);
  if (fulltextMatch) {
    const fields = fulltextMatch[2].split(',').map(f => f.trim().replace(/`/g, ''));
    return { name: fulltextMatch[1], fields, type: 'FULLTEXT' };
  }

  return null;
}

export function generateDatabaseSchema(sqlFilePath: string, outputPath: string): void {
  const schema = parseSqlFile(sqlFilePath);

  const typescriptContent = `// AUTO-GENERATED from ${schema.sourceFile}
// Do not edit manually - run 'npm run parse:database' to regenerate

export interface DbField {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  comment?: string;
  key?: 'PRI' | 'UNI' | 'MUL';
  extra?: string;
}

export interface DbIndex {
  name: string;
  fields: string[];
  type?: string;
}

export interface DbTable {
  name: string;
  comment?: string;
  fields: DbField[];
  indexes: DbIndex[];
}

export interface DatabaseSchema {
  tables: DbTable[];
  tableCount: number;
  generatedAt: string;
  sourceFile?: string;
}

export const databaseSchema: DatabaseSchema = ${JSON.stringify(schema, null, 2)};

export function getTable(name: string): DbTable | undefined {
  return databaseSchema.tables.find(t => t.name === name);
}

export function getTablesByPrefix(prefix: string): DbTable[] {
  return databaseSchema.tables.filter(t => t.name.startsWith(prefix));
}
`;

  fs.writeFileSync(outputPath, typescriptContent);
  console.log(`Generated ${schema.tableCount} tables to ${outputPath}`);
}

if (require.main === module) {
  const sqlPath = path.resolve(
    process.env.INSTANTCMS_SOURCE || 'source',
    'install/languages/ru/sql/base.sql'
  );
  const outputPath = path.resolve('src/data/database-schema.ts');
  generateDatabaseSchema(sqlPath, outputPath);
}
