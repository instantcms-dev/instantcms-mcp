#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { startHttpServer } from './utils/http-server.js';
import { logger } from './utils/logger.js';

const args = process.argv.slice(2);

if (args.includes('--http')) {
  startHttpServer({
    port: parsePort(),
    host: process.env.MCP_HTTP_HOST || '127.0.0.1',
    token: process.env.MCP_HTTP_TOKEN,
  })
    .then(handle => {
      logger.info(
        `InstantCMS MCP server (HTTP): http://${handle.host}:${handle.port}/mcp (stateless, POST only)`
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
