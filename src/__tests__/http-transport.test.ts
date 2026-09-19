import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startHttpServer } from '../utils/http-server.js';

/**
 * Опциональный `--http`-режим: stateless Streamable HTTP.
 * Проверяется сквозным SDK-клиентом на ephemeral-порту (port=0).
 */
describe('HTTP transport (--http)', () => {
  test('initialize, tools/list и 405 на GET через настоящий клиент', async () => {
    const handle = await startHttpServer({ port: 0 });
    try {
      const transport = new StreamableHTTPClientTransport(
        new URL(`http://${handle.host}:${handle.port}/mcp`)
      );
      const client = new Client({ name: 'http-transport-test', version: '0' });
      await client.connect(transport);
      try {
        const listed = await client.listTools();
        expect(listed.tools.length).toBe(100);
        const health = await client.callTool({ name: 'get_project_health', arguments: {} });
        expect(health).toHaveProperty('structuredContent');
      } finally {
        await client.close();
      }

      const response = await fetch(`http://${handle.host}:${handle.port}/mcp`);
      expect(response.status).toBe(405);
    } finally {
      await handle.close();
    }
  });

  test('MCP_HTTP_TOKEN: запросы без токена отклоняются с 401', async () => {
    const handle = await startHttpServer({ port: 0, token: 'test-secret' });
    try {
      const noToken = await fetch(`http://${handle.host}:${handle.port}/mcp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"jsonrpc":"2.0","id":1,"method":"tools/list"}',
      });
      expect(noToken.status).toBe(401);

      const badToken = await fetch(`http://${handle.host}:${handle.port}/mcp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer wrong' },
        body: '{"jsonrpc":"2.0","id":1,"method":"tools/list"}',
      });
      expect(badToken.status).toBe(401);
    } finally {
      await handle.close();
    }
  });
});
