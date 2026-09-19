import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { errorResult, successResult } from './mcp-result.js';

/**
 * Минимальная сигнатура регистрации инструмента.
 *
 * MCP SDK типизирует `server.tool` через `ZodRawShapeCompat`, чтобы поддержать
 * и zod v3, и zod v4 одновременно. Из-за этого прямой вызов с нами zod v4
 * raw-shape упирается в конфликт generic-ов. Вместо `as any` объявляем узкий
 * локальный интерфейс и приводим `server` к нему один раз — типобезопаснее,
 * чем каст к `any`, и не ломает проверку остального кода.
 */
interface ToolRegistrar {
  tool(
    name: string,
    description: string,
    paramsSchema: unknown,
    cb: (args: Record<string, unknown>) => unknown
  ): unknown;
}

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
  (server as unknown as ToolRegistrar).tool(name, description, schema, async (rawArgs: unknown) => {
    try {
      const data = await handler((rawArgs ?? {}) as Record<string, unknown>);
      return successResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return errorResult('TOOL_EXECUTION_ERROR', message, {
        tool: name,
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
  (server as unknown as ToolRegistrar).tool(name, description, schema, handler);
}
