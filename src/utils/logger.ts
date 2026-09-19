import { redactSecrets } from './sql-safety.js';

/**
 * Единый логер MCP-сервера.
 *
 * В stdio-сервере stdout зарезервирован под JSON-RPC, поэтому логи пишутся
 * только в stderr. Все сообщения проходят через redactSecrets, чтобы в лог
 * не утекли пароли, токены и строки подключения к БД.
 */

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return redactSecrets(arg);
  if (arg instanceof Error) return redactSecrets(arg.stack ?? arg.message);
  try {
    return redactSecrets(JSON.stringify(arg));
  } catch {
    return redactSecrets(String(arg));
  }
}

export const logger = {
  error(...args: unknown[]): void {
    console.error('[instantcms-mcp]', ...args.map(formatArg));
  },
  warn(...args: unknown[]): void {
    console.error('[instantcms-mcp]', ...args.map(formatArg));
  },
  info(...args: unknown[]): void {
    console.error('[instantcms-mcp]', ...args.map(formatArg));
  },
};
