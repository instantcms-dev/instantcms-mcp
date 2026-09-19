import { createServer as createNodeServer, IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createServer } from '../server.js';
import { logger } from './logger.js';

export interface HttpServerOptions {
  /** Порт; 0 выбирает свободный ephemeral-порт (фактический вернётся в port). */
  port?: number;
  /** Адрес привязки. По умолчанию 127.0.0.1 — не слушать внешний интерфейс без явного запроса. */
  host?: string;
  /** Опциональный bearer-токен: при задании каждый запрос требует Authorization: Bearer <token>. */
  token?: string;
  /**
   * Stateful-режим: MCP-сессия живёт между запросами (Mcp-Session-Id),
   * поддерживаются GET (SSE) и DELETE (закрытие сессии).
   * По умолчанию stateless: каждый POST независим.
   */
  session?: boolean;
  /**
   * Лимит запросов с одного IP в минуту. 0/undefined — без лимита.
   * Окно фиксированное; превышение отвечает 429 с Retry-After.
   */
  rateLimitPerMinute?: number;
}

export interface HttpServerHandle {
  /** Фактический порт (важно при port=0). */
  port: number;
  host: string;
  close(): Promise<void>;
}

interface SessionEntry {
  server: ReturnType<typeof createServer>;
  transport: StreamableHTTPServerTransport;
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
  const sessionMode = options.session === true;
  const rateLimit = options.rateLimitPerMinute ?? 0;
  const sessions = new Map<string, SessionEntry>();
  const rateBuckets = new Map<string, { count: number; resetAt: number }>();

  const httpServer = createNodeServer(async (req, res) => {
    try {
      // Liveness-эндпоинт для оркестраторов: до авторизации, им токен недоступен.
      if (req.method === 'GET' && req.url?.split('?')[0] === '/health') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', transport: 'http' }));
        return;
      }

      // Rate limit до авторизации: иначе брутфорс токена остался бы безлимитным.
      if (rateLimit > 0) {
        const verdict = checkRateLimit(rateBuckets, clientKey(req), rateLimit);
        if (!verdict.allowed) {
          res.writeHead(429, {
            'content-type': 'application/json',
            'retry-after': String(verdict.retryAfterSeconds),
          });
          res.end(JSON.stringify({ error: 'rate limit exceeded' }));
          return;
        }
      }

      if (token && !isAuthorized(req, token)) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'unauthorized' }));
        return;
      }

      if (sessionMode) {
        // Отклонённые запросы handleSessionRequest отвечают сама.
        await handleSessionRequest(req, res, sessions);
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
    close: async () => {
      // Закрываем все живые сессии, затем сам listener.
      for (const entry of sessions.values()) {
        await closeQuietly(entry.transport);
        await closeQuietly(entry.server);
      }
      sessions.clear();
      await new Promise<void>((resolve, reject) =>
        httpServer.close(err => (err ? reject(err) : resolve()))
      );
    },
  };
}

/**
 * Обрабатывает POST/GET/DELETE в stateful-режиме.
 * Отвечает клиенту сама во всех поддерживаемых ветках.
 */
async function handleSessionRequest(
  req: IncomingMessage,
  res: ServerResponse,
  sessions: Map<string, SessionEntry>
): Promise<void> {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (req.method === 'POST') {
    const body = JSON.parse(await readBody(req));
    const existing = sessionId ? sessions.get(sessionId) : undefined;

    if (existing) {
      await existing.transport.handleRequest(req, res, body);
      return;
    }

    if (!sessionId && isInitializeRequest(body)) {
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: id => {
          sessions.set(id, { server, transport });
        },
      });
      transport.onclose = () => {
        for (const [id, entry] of sessions) {
          if (entry.transport === transport) sessions.delete(id);
        }
      };
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
      return;
    }

    // Session-id не соответствует живой сессии, либо это не initialize.
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid or missing session' }));
    return;
  }

  if (req.method === 'GET' || req.method === 'DELETE') {
    const entry = sessionId ? sessions.get(sessionId) : undefined;
    if (entry === undefined) {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'unknown session' }));
      return;
    }
    // transport.handleRequest сам разрулит SSE (GET) и закрытие сессии (DELETE).
    await entry.transport.handleRequest(req, res);
    return;
  }

  res.writeHead(405, { allow: 'GET, POST, DELETE' });
  res.end();
}

/**
 * Fixed-window rate limit. Вынесено для юнит-тестирования без сети.
 */
export function checkRateLimit(
  store: Map<string, { count: number; resetAt: number }>,
  key: string,
  limit: number,
  now: number = Date.now()
): { allowed: boolean; retryAfterSeconds: number } {
  const windowMs = 60_000;
  let entry = store.get(key);
  if (entry === undefined || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }
  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

/** Ключ rate limit: адрес клиента. За обратным прокси это адрес прокси. */
function clientKey(req: IncomingMessage): string {
  return req.socket.remoteAddress ?? 'unknown';
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
