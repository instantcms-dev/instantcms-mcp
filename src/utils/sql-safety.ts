/**
 * Безопасность запросов к базе данных.
 *
 * Инструменты MCP работают с чужой базой, поэтому по умолчанию разрешены только
 * чтение и диагностика, а изменение данных требует явного подтверждения.
 * Отдельно запрещены запросы, которые читают или пишут файлы сервера и меняют
 * права: для них нет безопасного сценария внутри этих инструментов.
 */

export type SqlKind = 'read' | 'write' | 'dangerous';

export interface SqlGuardOptions {
  /** Разрешить изменение данных (по умолчанию нет). */
  allowWrite?: boolean;
  /** Полностью запретить запись, даже с allowWrite (например, DB_READONLY=1). */
  readOnly?: boolean;
}

export const DEFAULT_MAX_ROWS = 1000;
export const DEFAULT_TIMEOUT_MS = 10_000;

const READ_PATTERN = /^\s*(?:SELECT|SHOW|DESCRIBE|DESC|EXPLAIN|WITH|HELP)\b/i;
const WRITE_PATTERN =
  /^\s*(?:INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE|RENAME|OPTIMIZE|REPAIR|ANALYZE|LOCK|UNLOCK|CALL|SET|USE|START|BEGIN|COMMIT|ROLLBACK|GRANT|REVOKE)\b/i;

const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\bINTO\s+(?:OUTFILE|DUMPFILE)\b/i, reason: 'запись в файлы сервера' },
  { pattern: /\bLOAD_FILE\s*\(/i, reason: 'чтение файлов сервера' },
  { pattern: /\bLOAD\s+DATA\b/i, reason: 'массовая загрузка из файла' },
  {
    pattern: /\bCREATE\s+USER\b|\bDROP\s+USER\b|\bALTER\s+USER\b/i,
    reason: 'управление учётными записями',
  },
  { pattern: /\bGRANT\b|\bREVOKE\b/i, reason: 'управление правами' },
  { pattern: /\bSET\s+GLOBAL\b/i, reason: 'изменение глобальных настроек сервера' },
  { pattern: /\bSHUTDOWN\b/i, reason: 'остановка сервера' },
  { pattern: /\bINFORMATION_SCHEMA\.USER_PRIVILEGES\b/i, reason: 'чтение привилегий' },
];

/**
 * Исполняемый MySQL versioned comment (открывается слешем-звёздочкой-восклицанием
 * и номером версии). В отличие от обычного комментария его содержимое ВЫПОЛНЯЕТСЯ
 * сервером, когда версия подходит. `stripLiterals` снимает его как обычный
 * комментарий, поэтому опасный код внутри мог бы обойти DANGEROUS_PATTERNS.
 */
const VERSIONED_COMMENT_PATTERN = /\/\*!\d*([\s\S]*?)\*\//g;

/** Извлекает исполняемое содержимое всех versioned comments. */
export function extractVersionedCommentBodies(sql: string): string[] {
  const bodies: string[] = [];
  for (const match of sql.matchAll(VERSIONED_COMMENT_PATTERN)) {
    bodies.push(match[1]);
  }
  return bodies;
}

/**
 * Проверяет исполняемые versioned comments на опасные конструкции.
 * Возвращает причину запрета или null.
 */
function findDangerousVersionedComment(sql: string): string | null {
  for (const body of extractVersionedCommentBodies(sql)) {
    const dangerous = DANGEROUS_PATTERNS.find(({ pattern }) => pattern.test(body));
    if (dangerous) return `versioned comment: ${dangerous.reason}`;
  }
  return null;
}

/**
 * Убирает из текста строковые литералы и комментарии, чтобы искать разделители
 * и ключевые слова только в самом запросе.
 */
function stripLiterals(sql: string): string {
  let result = '';
  let index = 0;

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1];

    if (char === '-' && next === '-') {
      const end = sql.indexOf('\n', index);
      index = end === -1 ? sql.length : end + 1;
      result += ' ';
      continue;
    }
    if (char === '#') {
      const end = sql.indexOf('\n', index);
      index = end === -1 ? sql.length : end + 1;
      result += ' ';
      continue;
    }
    if (char === '/' && next === '*') {
      const end = sql.indexOf('*/', index + 2);
      index = end === -1 ? sql.length : end + 2;
      result += ' ';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      const quote = char;
      index += 1;
      while (index < sql.length) {
        if (sql[index] === '\\') {
          index += 2;
          continue;
        }
        if (sql[index] === quote) {
          index += 1;
          break;
        }
        index += 1;
      }
      result += ' ';
      continue;
    }

    result += char;
    index += 1;
  }

  return result;
}

/** Несколько инструкций в одном вызове запрещены: их нельзя разобрать надёжно. */
export function hasMultipleStatements(sql: string): boolean {
  const stripped = stripLiterals(sql).trim();
  const withoutTrailing = stripped.replace(/;+\s*$/, '');
  return withoutTrailing.includes(';');
}

export function classifySql(sql: string): SqlKind {
  const stripped = stripLiterals(sql).trim();

  if (DANGEROUS_PATTERNS.some(({ pattern }) => pattern.test(stripped))) return 'dangerous';
  if (READ_PATTERN.test(stripped)) return 'read';
  if (WRITE_PATTERN.test(stripped)) return 'write';
  return 'write';
}

/**
 * Проверяет запрос и возвращает его вид.
 * Бросает исключение с понятной причиной, если запрос выполнять нельзя.
 */
export function assertSqlAllowed(sql: string, options: SqlGuardOptions = {}): SqlKind {
  if (!sql.trim()) {
    throw new Error('Пустой SQL-запрос');
  }

  if (hasMultipleStatements(sql)) {
    throw new Error('Несколько инструкций в одном запросе запрещены: отправьте их по одной');
  }

  const kind = classifySql(sql);

  const dangerous = DANGEROUS_PATTERNS.find(({ pattern }) => pattern.test(stripLiterals(sql)));
  if (kind === 'dangerous' && dangerous) {
    throw new Error(`Запрос запрещён: ${dangerous.reason}`);
  }

  const dangerousVersioned = findDangerousVersionedComment(sql);
  if (dangerousVersioned) {
    throw new Error(`Запрос запрещён: ${dangerousVersioned}`);
  }

  if (kind === 'write') {
    if (options.readOnly) {
      throw new Error(
        'База доступна только для чтения (DB_READONLY=1): изменение данных запрещено'
      );
    }
    if (!options.allowWrite) {
      throw new Error(
        'Запрос изменяет данные. Подтвердите его параметром allow_write=true, если это осознанное действие'
      );
    }
  }

  return kind;
}

const SECRET_PATTERNS: Array<{ pattern: RegExp; replace: string }> = [
  // "password": "secret" — ключ и значение в кавычках (JSON, INI)
  {
    pattern:
      /(["'])(password|passwd|pwd|secret|api[_-]?key|api[_-]?token|auth[_-]?key|access[_-]?token|token)\1(\s*[:=]\s*)(["'])([^"']*)\4/gi,
    replace: '$1$2$1$3$4***$4',
  },
  // password = "secret" / password: 'secret'
  {
    pattern:
      /((?:password|passwd|pwd|secret|api[_-]?key|api[_-]?token|auth[_-]?key|access[_-]?token|token)\s*[:=]\s*)(["'])([^"']*)\2/gi,
    replace: '$1$2***$2',
  },
  { pattern: /(password|passwd|pwd)\s*[=:]\s*[^\s;,'")]+/gi, replace: '$1=***' },
  { pattern: /(DB_PASSWORD|DB_PASS)\s*=\s*[^\s;]+/gi, replace: '$1=***' },
  // Учётные данные в URL: mysql://user:secret@host/db
  { pattern: /(\b[a-z][a-z0-9+.-]*:\/\/[^:/\s@]+:)[^@/\s]+@/gi, replace: '$1***@' },
  { pattern: /(authorization\s*:\s*bearer\s+)[^\s]+/gi, replace: '$1***' },
  { pattern: /(authorization\s*:\s*basic\s+)[^\s]+/gi, replace: '$1***' },
  { pattern: /([?&](?:token|api_key|apikey|access_token)=)[^&\s]+/gi, replace: '$1***' },
];

/** Маскирует секреты в тексте ошибки или ответа. */
export function redactSecrets(text: string): string {
  return SECRET_PATTERNS.reduce(
    (result, { pattern, replace }) => result.replace(pattern, replace),
    text
  );
}

/**
 * Имена колонок, значения которых не отдаются наружу.
 *
 * Сопоставление по границам сегментов имени, поэтому `token_hash`,
 * `api_token` и `secret_key` маскируются, а `tokens_count` — нет.
 */
const SENSITIVE_COLUMN_PATTERN =
  /(?:^|_)(?:password|passwd|pwd|secret|token|salt|api_?key|auth_?key|private_?key)(?:_|$|[0-9])/i;

export function isSensitiveColumn(column: string): boolean {
  return SENSITIVE_COLUMN_PATTERN.test(column);
}

export interface RedactRowsResult {
  rows: Record<string, unknown>[];
  /** Колонки, значения которых заменены на `***`. */
  redactedColumns: string[];
}

/**
 * Заменяет значения колонок-секретов на `***`.
 *
 * Инструменты MCP читает ИИ-агент, а дамп `cms_users` отдаёт хэши паролей и
 * токены, поэтому значения таких колонок маскируются, пока вызывающий явно не
 * попросит обратное (`include_sensitive: true`).
 */
export function redactSensitiveRows(
  columns: string[],
  rows: Record<string, unknown>[],
  includeSensitive = false
): RedactRowsResult {
  if (includeSensitive) return { rows, redactedColumns: [] };

  const sensitive = columns.filter(isSensitiveColumn);
  if (sensitive.length === 0) return { rows, redactedColumns: [] };

  return {
    rows: rows.map(row => {
      const copy: Record<string, unknown> = { ...row };
      for (const column of sensitive) {
        copy[column] = '***';
      }
      return copy;
    }),
    redactedColumns: sensitive,
  };
}
