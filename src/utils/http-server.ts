import { createServer as createNodeServer, IncomingMessage } from 'node:http';
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
      // Liveness-эндпоинт для оркестраторов: до авторизации, им токен недоступен.
      if (req.method === 'GET' && req.url?.split('?')[0] === '/health') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', transport: 'http' }));
        return;
      }

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
        void closeQuietly(transport);
        void closeQuietly(server);
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

  await new Promise<void>((resolve, reject) => {
    const listenPort = options.port ?? 3001;
    // Без обработчика 'error' занятый порт валил бы процесс необработанным
    // событием; превращаем это в ожидаемый reject промиса.
    httpServer.once('error', reject);
    httpServer.listen(listenPort, host, () => {
      httpServer.removeListener('error', reject);
      resolve();
    });
  });

  const address = httpServer.address();
  if (address === null || typeof address === 'string') {
    throw new Error('HTTP server bound without a TCP port');
  }

  return {
    port: address.port,
    host,
    close: () =>
      new Promise<void>((resolve, reject) =>
        httpServer.close(err => (err ? reject(err) : resolve()))
      ),
  };
}

/**
 * Best-effort закрытие транспорта/сервера при разрыве соединения.
 * Ошибки закрытия не должны влиять на уже завершённый запрос.
 */
export async function closeQuietly(target: { close(): Promise<void> }): Promise<void> {
  try {
    await target.close();
  } catch {
    // намеренно игнорируем: закрытие идёт после ответа
  }
}

/** Проверка bearer-токена: схема Bearer и точное совпадение значения. */
export function isAuthorized(req: IncomingMessage, token: string): boolean {
  const [scheme, value] = (req.headers.authorization ?? '').split(' ');
  return scheme?.toLowerCase() === 'bearer' && value === token;
}

/** Читает тело запроса целиком; ошибка потока превращается в reject. */
export function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
