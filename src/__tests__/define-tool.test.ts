/**
 * Тесты хелпера defineTool на синтетическом McpServer. Реальный SDK не мокаем —
 * проверяем только инвариант "handler exception → errorResult" и распространение
 * structuredContent.
 */
import { defineTool, defineToolWithManualResult } from '../utils/define-tool.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

type CapturedHandler = (args: unknown) => Promise<unknown> | unknown;

class FakeMcpServer {
  private last: { name: string; description: string; schema: unknown; cb: CapturedHandler } | null =
    null;

  tool(name: string, description: string, schema: any, cb: any): void {
    this.last = { name, description, schema, cb };
  }

  get captured() {
    return this.last;
  }
}

/** Каст к McpServer-совместимому интерфейсу: нам нужен только .tool(). */
function asMcpServer(fake: FakeMcpServer): McpServer {
  return fake as unknown as McpServer;
}

async function callHandler(server: FakeMcpServer, args: unknown = {}) {
  if (!server.captured) throw new Error('no tool registered');
  return (server.captured.cb as CapturedHandler)(args);
}

describe('defineTool', () => {
  test('handler success → successResult с content и structuredContent', async () => {
    const server = new FakeMcpServer();
    defineTool(asMcpServer(server), 'demo', 'desc', {}, async () => ({ ok: true, n: 7 }));
    const result = (await callHandler(server)) as {
      content: Array<{ text: string }>;
      structuredContent: Record<string, unknown>;
    };
    expect(result.content[0].text).toContain('"ok": true');
    expect(result.structuredContent.ok).toBe(true);
    expect(result.structuredContent.n).toBe(7);
  });

  test('handler throws → errorResult TOOL_EXECUTION_ERROR', async () => {
    const server = new FakeMcpServer();
    defineTool(asMcpServer(server), 'fail', 'desc', {}, async () => {
      throw new Error('boom');
    });
    const result = (await callHandler(server)) as {
      isError: true;
      structuredContent: { code: string; message: string };
    };
    expect(result.isError).toBe(true);
    expect(result.structuredContent.code).toBe('TOOL_EXECUTION_ERROR');
    expect(result.structuredContent.message).toBe('boom');
  });

  test('handler throws non-Error → строковое представление', async () => {
    const server = new FakeMcpServer();
    defineTool(asMcpServer(server), 'fail_str', 'desc', {}, async () => {
      throw 'plain string';
    });
    const result = (await callHandler(server)) as {
      isError: true;
      structuredContent: { message: string };
    };
    expect(result.isError).toBe(true);
    expect(result.structuredContent.message).toBe('plain string');
  });

  test('handler args пробрасываются', async () => {
    let received: Record<string, unknown> | undefined;
    const server = new FakeMcpServer();
    defineTool(asMcpServer(server), 'echo', 'desc', {}, async args => {
      received = args;
      return { echoed: args };
    });
    await callHandler(server, { message: 'hi' });
    expect(received).toEqual({ message: 'hi' });
  });

  test('handler без args пробрасывает пустой объект', async () => {
    let received: Record<string, unknown> | undefined;
    const server = new FakeMcpServer();
    defineTool(asMcpServer(server), 'noop', 'desc', {}, async args => {
      received = args;
      return {};
    });
    await callHandler(server);
    expect(received).toEqual({});
  });

  test('defineToolWithManualResult возвращает переданный result как есть', async () => {
    const server = new FakeMcpServer();
    defineToolWithManualResult(asMcpServer(server), 'manual', 'desc', {}, args => {
      const { marker } = args as { marker: string };
      if (marker === 'fail') {
        return { isError: true, content: [], structuredContent: { code: 'NOPE' } };
      }
      return { content: [{ type: 'text', text: 'ok' }], structuredContent: { ok: true } };
    });
    const ok = (await callHandler(server, { marker: 'ok' })) as {
      structuredContent: { ok: boolean };
    };
    expect(ok.structuredContent.ok).toBe(true);

    const fail = (await callHandler(server, { marker: 'fail' })) as {
      isError: boolean;
      structuredContent: { code: string };
    };
    expect(fail.isError).toBe(true);
    expect(fail.structuredContent.code).toBe('NOPE');
  });

  test('errorResult cause содержит stack при Error', async () => {
    const server = new FakeMcpServer();
    defineTool(asMcpServer(server), 'with_stack', 'desc', {}, async () => {
      throw new Error('err-with-stack');
    });
    const result = (await callHandler(server)) as {
      structuredContent: { cause: string };
    };
    expect(result.structuredContent.cause).toContain('err-with-stack');
  });

  test('errorResult cause не определён для не-Error', async () => {
    const server = new FakeMcpServer();
    defineTool(asMcpServer(server), 'without_stack', 'desc', {}, async () => {
      throw 42;
    });
    const result = (await callHandler(server)) as {
      structuredContent: { cause: unknown };
    };
    expect(result.structuredContent.cause).toBeUndefined();
  });
});
