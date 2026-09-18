import { rejectUnsupportedOptions } from '../utils/generator-options.js';
export interface MigrationField {
  name: string;
  type: string;
  nullable?: boolean;
  default?: string | number;
  extra?: string;
  comment?: string;
  key?: 'PRI' | 'UNI' | 'MUL';
}

export interface MigrationIndex {
  name: string;
  fields: string[];
  type?: 'INDEX' | 'UNIQUE' | 'FULLTEXT';
}

export interface MigrationTable {
  name: string;
  fields: MigrationField[];
  indexes?: MigrationIndex[];
  comment?: string;
  ifNotExists?: boolean;
}

export function generateMigration(
  name: string,
  fields: MigrationField[],
  options?: {
    indexes?: MigrationIndex[];
    comment?: string;
    ifNotExists?: boolean;
  }
): object {
  const tableName = `cms_${name}`;
  const className = name
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  const fieldLines = fields.map(f => {
    let line = `  \`${f.name}\` ${f.type}`;

    if (f.nullable !== true) {
      line += ' NOT NULL';
    }

    if (f.default !== undefined) {
      if (f.default === 'NULL') {
        line += ' DEFAULT NULL';
      } else if (typeof f.default === 'number') {
        line += ` DEFAULT ${f.default}`;
      } else {
        line += ` DEFAULT '${f.default}'`;
      }
    }

    if (f.extra) {
      line += ` ${f.extra}`;
    }

    if (f.comment) {
      line += ` COMMENT '${f.comment}'`;
    }

    return line;
  });

  if (!fields.find(f => f.key === 'PRI')) {
    fieldLines.push('  PRIMARY KEY (`id`)');
  }

  const indexes: string[] = [];
  const seenKeys = new Set<string>();

  for (const f of fields) {
    if (f.key && f.key !== 'PRI' && !seenKeys.has(f.key + '_' + f.name)) {
      seenKeys.add(f.key + '_' + f.name);
      if (f.key === 'UNI') {
        indexes.push(`  UNIQUE KEY \`${f.name}\` (\`${f.name}\`)`);
      } else if (f.key === 'MUL') {
        indexes.push(`  KEY \`${f.name}\` (\`${f.name}\`)`);
      }
    }
  }

  if (options?.indexes) {
    for (const idx of options.indexes) {
      if (idx.type === 'UNIQUE') {
        indexes.push(`  UNIQUE KEY \`${idx.name}\` (\`${idx.fields.join('`, `')}\`)`);
      } else if (idx.type === 'FULLTEXT') {
        indexes.push(`  FULLTEXT KEY \`${idx.name}\` (\`${idx.fields.join('`, `')}\`)`);
      } else {
        indexes.push(`  KEY \`${idx.name}\` (\`${idx.fields.join('`, `')}\`)`);
      }
    }
  }

  const allLines = [...fieldLines, ...indexes];

  const createTable = `CREATE TABLE${options?.ifNotExists === false ? '' : ' IF NOT EXISTS'} \`${tableName}\` (
 ${allLines.join(',\n')}
) ENGINE=InnoDB DEFAULT CHARSET=utf8${options?.comment ? ` COMMENT='${options.comment}'` : ''};`;

  // ICMS2 импортирует install.sql автоматически; install.php — только
  // необязательный хук. Установщик вызывает функцию install_package().
  const installCode = `<?php

/**
 * Необязательная логика установки пакета.
 * Таблицы создаются автоматически из install.sql в корне пакета.
 *
 * @param array $install_options
 * @return bool|string true при успехе либо текст ошибки
 */
function install_package(array $install_options = []) {
    return true;
}`;

  return {
    table_name: tableName,
    class_name: `installer${className}`,
    sql: createTable,
    install_php: installCode,
    field_count: fields.length,
    index_count: indexes.length,
    conventions: {
      table_name: `cms_${name}`,
      model_class: `model${className}`,
      controller_class: name,
      manifest_example: `<files>
    <file>system/controllers/${name}/</file>
</files>
<hooks>
    <hook event="content_after_add_approve" />
</hooks>`,
    },
  };
}

export function scaffoldMigration(params: {
  addon_name: string;
  table_name: string;
  fields: MigrationField[];
  options?: {
    indexes?: MigrationIndex[];
    comment?: string;
    permissions?: string[];
    content_type?: boolean;
    has_seo?: boolean;
  };
}): object {
  const { addon_name, table_name, fields, options = {} } = params;

  rejectUnsupportedOptions('scaffold_migration', options, {
    permissions: 'генерация прав доступа не поддержана — опишите permissions вручную',
  });

  const tableName = `cms_${table_name}`;

  // ICMS2 импортирует install.sql из корня пакета автоматически.
  const columnLines = fields.map(f => {
    let line = `    \`${f.name}\` ${f.type}`;
    line += f.nullable ? ' NULL' : ' NOT NULL';
    if (f.default !== undefined && f.default !== 'NULL') {
      const isNumber = typeof f.default === 'number' || /^\d+(\.\d+)?$/.test(String(f.default));
      line += ` DEFAULT ${isNumber ? f.default : `'${String(f.default).replace(/'/g, "''")}'`}`;
    }
    if (f.extra === 'AUTO_INCREMENT') line += ' AUTO_INCREMENT';
    if (f.comment) line += ` COMMENT '${f.comment.replace(/'/g, "''")}'`;
    return line;
  });

  const indexLines = (options.indexes ?? []).map(idx => {
    const kind =
      idx.type === 'UNIQUE' ? 'UNIQUE KEY' : idx.type === 'FULLTEXT' ? 'FULLTEXT KEY' : 'KEY';
    return `    ${kind} \`${idx.name}\` (${idx.fields.map(f => `\`${f}\``).join(', ')})`;
  });

  const primaryKey = fields.some(f => f.name === 'id' || f.extra === 'AUTO_INCREMENT')
    ? ['    PRIMARY KEY (`id`)']
    : [];

  const installSql = `-- Замените cms_ на реальный префикс БД из system/config/config.php
CREATE TABLE IF NOT EXISTS \`${tableName}\` (
${[...columnLines, ...primaryKey, ...indexLines].join(',\n')}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const installPhp = `<?php

/**
 * Необязательная логика установки дополнения ${addon_name}.
 * Таблицы создаются автоматически из install.sql.
 *
 * @param array $install_options
 * @return bool|string true при успехе либо текст ошибки
 */
function install_package(array $install_options = []) {
    return true;
}`;

  return {
    addon_name,
    table_name: tableName,
    files: {
      '[pkg] install.sql': installSql,
      '[pkg] install.php': installPhp,
    },
    manifest_xml: `<files>
    <file>install.sql</file>
    <file>install.php</file>
</files>`,
    notes: {
      'install.sql': 'Кладётся в корень пакета; ICMS2 импортирует его автоматически при установке.',
      'install.php': 'Кладётся в корень пакета; ядро вызывает функцию install_package().',
      uninstall:
        'Ядро ICMS2 не вызывает скрипт удаления: таблицы удаляются вручную или отдельным скриптом администратора.',
      content_type: options.content_type
        ? 'Регистрация типа контента не автоматизирована: выполните её в install_package() средствами API ядра.'
        : 'Тип контента не запрошен.',
      seo: options.has_seo
        ? 'SEO-настройки задаются средствами контент-типа; автогенерация не поддерживается.'
        : 'SEO-настройки не запрошены.',
    },
  };
}

export function generateFieldSuggestions(fieldType: string): MigrationField[] {
  const suggestions: Record<string, MigrationField[]> = {
    string: [
      { name: 'title', type: 'varchar(255)', nullable: false, comment: 'Заголовок' },
      { name: 'slug', type: 'varchar(100)', nullable: true, comment: 'URL-псевдоним' },
      { name: 'email', type: 'varchar(100)', nullable: true, comment: 'Email' },
      { name: 'phone', type: 'varchar(20)', nullable: true, comment: 'Телефон' },
    ],
    text: [
      { name: 'description', type: 'text', nullable: true, comment: 'Описание' },
      { name: 'content', type: 'text', nullable: true, comment: 'Контент' },
      { name: 'content_short', type: 'text', nullable: true, comment: 'Краткое описание' },
    ],
    number: [
      { name: 'price', type: 'decimal(10,2)', nullable: true, comment: 'Цена' },
      { name: 'quantity', type: 'int(11)', nullable: true, default: '0', comment: 'Количество' },
      { name: 'sorting', type: 'int(11)', nullable: true, default: '0', comment: 'Сортировка' },
    ],
    datetime: [
      { name: 'date_pub', type: 'datetime', nullable: true, comment: 'Дата публикации' },
      { name: 'date_end', type: 'datetime', nullable: true, comment: 'Дата окончания' },
      {
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        default: 'CURRENT_TIMESTAMP',
        comment: 'Создано',
      },
    ],
    user: [
      {
        name: 'user_id',
        type: 'int(11) UNSIGNED',
        nullable: true,
        key: 'MUL',
        comment: 'ID пользователя',
      },
    ],
    bool: [
      {
        name: 'is_pub',
        type: 'tinyint(1) UNSIGNED',
        nullable: false,
        default: '1',
        comment: 'Опубликовано',
      },
      {
        name: 'is_deleted',
        type: 'tinyint(1) UNSIGNED',
        nullable: false,
        default: '0',
        comment: 'Удалено',
      },
      {
        name: 'is_featured',
        type: 'tinyint(1) UNSIGNED',
        nullable: false,
        default: '0',
        comment: 'Избранное',
      },
    ],
  };

  return (
    suggestions[fieldType] || [
      {
        name: 'id',
        type: 'int(11) UNSIGNED',
        nullable: false,
        extra: 'AUTO_INCREMENT',
        key: 'PRI',
      },
    ]
  );
}
