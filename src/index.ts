#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { logger } from './utils/logger.js';

const server = createServer();
const transport = new StdioServerTransport();

server
  .connect(transport)
  .then(() => {
    // Server is running via stdio
  })
  .catch(err => {
    logger.error('Failed to start InstantCMS MCP server:', err);
    process.exit(1);
  });
