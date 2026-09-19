#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { startHttpServer } from './utils/http-server.js';
import { logger } from './utils/logger.js';

const args = process.argv.slice(2);
const sessionMode = args.includes('--session') || process.env.MCP_HTTP_SESSION === '1';

if (args.includes('--http')) {
  startHttpServer({
    port: parsePort(),
    host: process.env.MCP_HTTP_HOST || '127.0.0.1',
    token: process.env.MCP_HTTP_TOKEN,
    session: sessionMode,
    rateLimitPerMinute: parseRateLimit(),
  })
    .then(handle => {
      const extra = sessionMode ? ', GET/DELETE с Mcp-Session-Id' : '';
      logger.info(
        `InstantCMS MCP server (HTTP, ${sessionMode ? 'stateful' : 'stateless'}): http://${handle.host}:${handle.port}/mcp${extra}`
      );
    })
    .catch(err => {
      logger.error('Failed to start InstantCMS MCP HTTP server:', err);
      process.exit(1);
    });
} else {
  startStdioServer().catch(err => {
    logger.error('Failed to start InstantCMS MCP server:', err);
    process.exit(1);
  });
}

/** Стандартный режим: JSON-RPC через stdin/stdout. */
async function startStdioServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function parsePort(): number | undefined {
  const flag = args.indexOf('--port');
  const raw = (flag !== -1 && args[flag + 1]) || process.env.MCP_HTTP_PORT;
  const port = Number(raw);
  return raw !== undefined && Number.isInteger(port) && port >= 0 ? port : undefined;
}

function parseRateLimit(): number | undefined {
  const raw = process.env.MCP_HTTP_RATE_LIMIT;
  if (raw === undefined) return undefined;
  const limit = Number(raw);
  return Number.isInteger(limit) && limit > 0 ? limit : undefined;
}
