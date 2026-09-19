import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { PassThrough } from 'node:stream';
import type { IncomingMessage } from 'node:http';

import { closeQuietly, isAuthorized, readBody, startHttpServer } from '../utils/http-server.js';

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

      const wrongScheme = await fetch(`http://${handle.host}:${handle.port}/mcp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Basic test-secret' },
        body: '{"jsonrpc":"2.0","id":1,"method":"tools/list"}',
      });
      expect(wrongScheme.status).toBe(401);
    } finally {
      await handle.close();
    }
  });

  test('MCP_HTTP_TOKEN: корректный токен пропускает клиента', async () => {
    const handle = await startHttpServer({ port: 0, token: 'test-secret' });
    try {
      const transport = new StreamableHTTPClientTransport(
        new URL(`http://${handle.host}:${handle.port}/mcp`),
        { requestInit: { headers: { authorization: 'Bearer test-secret' } } }
      );
      const client = new Client({ name: 'http-auth-test', version: '0' });
      await client.connect(transport);
      try {
        const listed = await client.listTools();
        expect(listed.tools.length).toBe(100);
      } finally {
        await client.close();
      }
    } finally {
      await handle.close();
    }
  });

  test('невалидный JSON в теле → 500 с понятной ошибкой', async () => {
    const handle = await startHttpServer({ port: 0 });
    const logged = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const response = await fetch(`http://${handle.host}:${handle.port}/mcp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not-a-json',
      });
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'internal error' });
      // Ошибка разбора тела обязана попасть в лог (stderr), а не молча пропасть.
      expect(logged).toHaveBeenCalled();
    } finally {
      logged.mockRestore();
      await handle.close();
    }
  });

  test('повторный close отклоняется ошибкой сервера', async () => {
    const handle = await startHttpServer({ port: 0 });
    await handle.close();
    await expect(handle.close()).rejects.toThrow();
  });

  test('GET /health отвечает 200 без токена и авторизации', async () => {
    const handle = await startHttpServer({ port: 0, token: 'test-secret' });
    try {
      const response = await fetch(`http://${handle.host}:${handle.port}/health`);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: 'ok', transport: 'http' });

      // Другие GET-пути остаются под защитой токена.
      const other = await fetch(`http://${handle.host}:${handle.port}/mcp`);
      expect(other.status).toBe(401);
    } finally {
      await handle.close();
    }
  });

  test('занятый порт → startHttpServer отклоняется, а не валит процесс', async () => {
    const first = await startHttpServer({ port: 0 });
    try {
      await expect(startHttpServer({ port: first.port })).rejects.toThrow();
    } finally {
      await first.close();
    }
  });

  test('closeQuietly игнорирует ошибки закрытия', async () => {
    await expect(closeQuietly({ close: () => Promise.reject(new Error('boom')) })).resolves.toBe(
      undefined
    );
    const closed: string[] = [];
    await expect(
      closeQuietly({
        close: () => {
          closed.push('ok');
          return Promise.resolve();
        },
      })
    ).resolves.toBe(undefined);
    expect(closed).toEqual(['ok']);
  });

  test('isAuthorized принимает только точный Bearer-токен', () => {
    const req = (authorization?: string) =>
      ({ headers: authorization === undefined ? {} : { authorization } }) as IncomingMessage;

    expect(isAuthorized(req('Bearer s3cret'), 's3cret')).toBe(true);
    expect(isAuthorized(req('bearer s3cret'), 's3cret')).toBe(true);
    expect(isAuthorized(req('Bearer wrong'), 's3cret')).toBe(false);
    expect(isAuthorized(req('Basic s3cret'), 's3cret')).toBe(false);
    expect(isAuthorized(req(), 's3cret')).toBe(false);
  });

  test('readBody склеивает чанки и пробрасывает ошибку потока', async () => {
    const ok = new PassThrough();
    const collected = readBody(ok as unknown as IncomingMessage);
    ok.write('{"a":');
    ok.write('1}');
    ok.end();
    expect(await collected).toBe('{"a":1}');

    const failing = new PassThrough();
    const rejected = readBody(failing as unknown as IncomingMessage);
    failing.emit('error', new Error('socket reset'));
    await expect(rejected).rejects.toThrow('socket reset');
  });
});
