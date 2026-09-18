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
  { pattern: /(password|passwd|pwd)\s*[=:]\s*[^\s;,'")]+/gi, replace: '$1=***' },
  { pattern: /(DB_PASSWORD|DB_PASS)\s*=\s*[^\s;]+/gi, replace: '$1=***' },
  { pattern: /(authorization\s*:\s*bearer\s+)[^\s]+/gi, replace: '$1***' },
  { pattern: /([?&](?:token|api_key|apikey|access_token)=)[^&\s]+/gi, replace: '$1***' },
];

/** Маскирует секреты в тексте ошибки или ответа. */
export function redactSecrets(text: string): string {
  return SECRET_PATTERNS.reduce(
    (result, { pattern, replace }) => result.replace(pattern, replace),
    text
  );
}
