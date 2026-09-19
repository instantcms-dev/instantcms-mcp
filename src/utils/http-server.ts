import { createServer as createNodeServer, IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from '../server.js';
import { logger } from './logger.js';

export interface HttpServerOptions {
  /** Порт; 0 выбирает свободный ephemeral-порт (фактический вернётся в port). */
  port?: number;
  /** Адрес привязки. По умолчанию 127.0.0.1 — не слушать внешний интерфейс без явного запроса. */
  host?: string;
  /** Опциональный bearer-токен: при задании каждый запрос требует Authorization: Bearer <token>. */
  token?: string;
}

export interface HttpServerHandle {
  /** Фактический порт (важно при port=0). */
  port: number;
  host: string;
  close(): Promise<void>;
}

/**
 * Опциональный режим `--http`: Streamable HTTP на локальном порту.
 *
 * Stateless-схема без сессий: на каждый POST создаётся свой transport и свой
 * экземпляр сервера (McpServer держит ровно один transport), GET/DELETE
 * отклоняются как в официальном stateless-примере SDK.
 */
export async function startHttpServer(options: HttpServerOptions = {}): Promise<HttpServerHandle> {
  const host = options.host ?? '127.0.0.1';
  const token = options.token;

  const httpServer = createNodeServer(async (req, res) => {
    try {
      if (token && !isAuthorized(req, token)) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'unauthorized' }));
        return;
      }

      if (req.method !== 'POST') {
        res.writeHead(405, { allow: 'POST' });
        res.end();
        return;
      }

      const body = JSON.parse(await readBody(req));
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on('close', () => {
        transport.close().catch(() => undefined);
        server.close().catch(() => undefined);
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      logger.error('HTTP request failed:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'internal error' }));
    }
  });

  await new Promise<void>(resolve => httpServer.listen(options.port ?? 3001, host, resolve));
  const address = httpServer.address();
  const port =
    typeof address === 'object' && address !== null ? address.port : (options.port ?? 3001);

  return {
    port,
    host,
    close: () =>
      new Promise<void>((resolve, reject) =>
        httpServer.close(err => (err ? reject(err) : resolve()))
      ),
  };
}

function isAuthorized(req: IncomingMessage, token: string): boolean {
  const [scheme, value] = (req.headers.authorization ?? '').split(' ');
  return scheme?.toLowerCase() === 'bearer' && value === token;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
