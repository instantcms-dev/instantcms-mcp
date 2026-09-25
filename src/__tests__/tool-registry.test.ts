import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { trackRegisteredTools } from '../utils/tool-registry.js';
import { createServer } from '../server.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

type CapturedHandler = (...args: unknown[]) => Promise<unknown> | unknown;

interface Registration {
  name: string;
  args: unknown[];
}

class FakeMcpServer {
  registrations: Registration[] = [];

  tool(name: string, ...args: unknown[]): unknown {
    this.registrations.push({ name, args });
    return { name };
  }

  async invoke(name: string): Promise<unknown> {
    const reg = this.registrations.find(r => r.name === name);
    if (!reg) throw new Error(`tool ${name} not registered`);
    const handler = reg.args[reg.args.length - 1] as CapturedHandler;
    return handler(...reg.args.slice(0, -1));
  }
}

function asMcpServer(fake: FakeMcpServer): McpServer {
  return fake as unknown as McpServer;
}

describe('trackRegisteredTools', () => {
  test('считает зарегистрированные инструменты', () => {
    const fake = new FakeMcpServer();
    const getToolsCount = trackRegisteredTools(asMcpServer(fake));
    expect(getToolsCount()).toBe(0);
    fake.tool('a', {}, async () => ({}));
    fake.tool('b', {}, async () => ({}));
    expect(getToolsCount()).toBe(2);
  });

  test('добавляет structuredContent к одиночному JSON text-блоку', async () => {
    const fake = new FakeMcpServer();
    trackRegisteredTools(asMcpServer(fake));
    fake.tool('json_tool', 'desc', {}, async () => ({
      content: [{ type: 'text', text: '{"answer": 42}' }],
    }));
    const result = (await fake.invoke('json_tool')) as {
      structuredContent?: { answer: number };
    };
    expect(result.structuredContent?.answer).toBe(42);
  });

  test('не трогает результат, если text — не JSON', async () => {
    const fake = new FakeMcpServer();
    trackRegisteredTools(asMcpServer(fake));
    fake.tool('plain_tool', 'desc', {}, async () => ({
      content: [{ type: 'text', text: 'plain text' }],
    }));
    const result = (await fake.invoke('plain_tool')) as Record<string, unknown>;
    expect('structuredContent' in result).toBe(false);
  });

  test('не трогает результат с несколькими content-блоками', async () => {
    const fake = new FakeMcpServer();
    trackRegisteredTools(asMcpServer(fake));
    fake.tool('multi_tool', 'desc', {}, async () => ({
      content: [
        { type: 'text', text: '{"a": 1}' },
        { type: 'text', text: '{"b": 2}' },
      ],
    }));
    const result = (await fake.invoke('multi_tool')) as Record<string, unknown>;
    expect('structuredContent' in result).toBe(false);
  });

  test('не трогает результат, где structuredContent уже задан', async () => {
    const fake = new FakeMcpServer();
    trackRegisteredTools(asMcpServer(fake));
    fake.tool('preset_tool', 'desc', {}, async () => ({
      content: [],
      structuredContent: { preset: true },
    }));
    const result = (await fake.invoke('preset_tool')) as {
      structuredContent: { preset: boolean };
    };
    expect(result.structuredContent.preset).toBe(true);
  });

  test('не трогает JSON-массив и не-object значения', async () => {
    const fake = new FakeMcpServer();
    trackRegisteredTools(asMcpServer(fake));
    fake.tool('array_tool', 'desc', {}, async () => ({
      content: [{ type: 'text', text: '[1, 2, 3]' }],
    }));
    const arrayResult = (await fake.invoke('array_tool')) as Record<string, unknown>;
    expect('structuredContent' in arrayResult).toBe(false);

    fake.tool('scalar_tool', 'desc', {}, async () => ({ content: [{ type: 'text', text: '42' }] }));
    const scalarResult = (await fake.invoke('scalar_tool')) as Record<string, unknown>;
    expect('structuredContent' in scalarResult).toBe(false);
  });

  test('без function-аргумента регистрация проходит без обёртки', () => {
    const fake = new FakeMcpServer();
    const getToolsCount = trackRegisteredTools(asMcpServer(fake));
    // редкая сигнатура tool(name, description, cb) — cb на последнем месте, это функция
    fake.tool('with_cb', 'desc', async () => ({}));
    // сигнатура без обработчика вовсе (аннотации) — последний аргумент не функция
    fake.tool('annotations_only', 'desc', { readOnlyHint: true });
    expect(getToolsCount()).toBe(2);
    expect(fake.registrations).toHaveLength(2);
  });
});

describe('createServer: профиль инструментов (disableGroups)', () => {
  test('disableGroups исключает группу из tools/list, счётчик совпадает', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer({ disableGroups: ['templates', 'sources'] });
    const client = new Client({ name: 'profile-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      const { tools } = await client.listTools();
      const names = new Set(tools.map(tool => tool.name));
      expect(names.has('scaffold_complete_template')).toBe(false);
      expect(names.has('index_upstream_template_sources')).toBe(false);
      expect(names.has('list_hooks')).toBe(true);
      expect(tools.length).toBeLessThan(101);

      // get_server_capabilities показывает фактическое число инструментов.
      const caps = await client.callTool({ name: 'get_server_capabilities', arguments: {} });
      const payload = caps.structuredContent as { tools_count: number };
      expect(payload.tools_count).toBe(tools.length);
    } finally {
      await client.close();
      await server.close();
    }
  }, 30_000);

  test('неизвестная группа игнорируется — набор остаётся полным', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer({ disableGroups: ['no-such-group'] });
    const client = new Client({ name: 'profile-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(101);
    } finally {
      await client.close();
      await server.close();
    }
  }, 30_000);
});
