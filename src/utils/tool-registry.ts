import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function withStructuredContent(result: unknown): unknown {
  if (!result || typeof result !== 'object' || 'structuredContent' in result) return result;
  const value = result as { content?: Array<{ type?: string; text?: string }> };
  if (!Array.isArray(value.content) || value.content.length !== 1) return result;
  const block = value.content[0];
  if (block.type !== 'text' || typeof block.text !== 'string') return result;
  try {
    const parsed: unknown = JSON.parse(block.text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return result;
    return { ...result, structuredContent: parsed };
  } catch {
    return result;
  }
}

/** Опции учёта и регистрации. */
export interface TrackOptions {
  /** Предикат отказа: true — инструмент не регистрируется вовсе. */
  skip?: (name: string) => boolean;
}

/** Учёт и формат ответов / Registration and result shape / 注册与结果格式。 */
export function trackRegisteredTools(server: McpServer, options: TrackOptions = {}): () => number {
  const names = new Set<string>();
  const register = server.tool.bind(server);
  server.tool = ((name: string, ...args: unknown[]) => {
    if (options.skip?.(name)) return undefined;
    const parameters = [...args];
    const last = parameters.length - 1;
    const handler = parameters[last];
    if (typeof handler === 'function') {
      parameters[last] = async (...values: unknown[]) =>
        withStructuredContent(await handler(...values));
    }
    const result = (register as (...values: unknown[]) => unknown)(name, ...parameters);
    names.add(name);
    return result;
  }) as typeof server.tool;
  return () => names.size;
}
