import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { errorResult, successResult } from './mcp-result.js';

/**
 * Регистрирует MCP-инструмент и нормализует контракт ответа.
 *
 * Любое исключение из handler превращается в errorResult (isError: true,
 * code: TOOL_EXECUTION_ERROR), не пробрасывается наружу. Это сохраняет
 * инвариант MCP: каждый tools/call возвращает корректный результат.
 *
 * Schema намеренно типизирована как `unknown`, чтобы не воевать с zod v4 ↔
 * MCP SDK generic-конфликтами; контракт реэкспортируется из sdk в site-вызова.
 */
export function defineTool(
  server: McpServer,
  name: string,
  description: string,
  schema: unknown,
  handler: (
    args: Record<string, unknown>
  ) => Promise<Record<string, unknown>> | Record<string, unknown>
): void {
  (server as any).tool(name, description, schema, async (rawArgs: unknown) => {
    try {
      const data = await handler((rawArgs ?? {}) as Record<string, unknown>);
      return successResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return errorResult('TOOL_EXECUTION_ERROR', message, {
        tool: name,
        cause: err instanceof Error ? err.stack : undefined,
      });
    }
  });
}

/**
 * Вариант, когда handler сам решает вернуть success- или error-result
 * (например, для ожидаемых отказов вроде "unknown lookup").
 */
export function defineToolWithManualResult(
  server: McpServer,
  name: string,
  description: string,
  schema: unknown,
  handler: (
    args: Record<string, unknown>
  ) =>
    | Promise<ReturnType<typeof successResult> | ReturnType<typeof errorResult>>
    | ReturnType<typeof successResult>
    | ReturnType<typeof errorResult>
): void {
  (server as any).tool(name, description, schema, handler);
}
