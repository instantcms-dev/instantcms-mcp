import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerMetaTools } from './registry/meta-tools.js';
import { registerGeneratorTools } from './registry/generator-tools.js';
import { registerKnowledgeTools } from './registry/knowledge-tools.js';
import { registerDatabaseTools } from './registry/database-tools.js';
import { registerSourceTools } from './registry/source-tools.js';
import { registerLanguageTools } from './registry/language-tools.js';
import { registerExtensionTools } from './registry/extension-tools.js';
import { registerResources } from './registry/resources.js';
import { registerProjectTools } from './registry/project-tools.js';
import { registerTemplateDevelopmentTools } from './registry/template-development-tools.js';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'instantcms-mcp',
    version: '1.2.5',
    description: 'MCP сервер для разработки дополнений и шаблонов InstantCMS 2',
  });

  registerMetaTools(server);
  registerGeneratorTools(server);
  registerKnowledgeTools(server);
  registerDatabaseTools(server);
  registerSourceTools(server);
  registerLanguageTools(server);
  registerExtensionTools(server);
  registerResources(server);
  registerProjectTools(server);
  registerTemplateDevelopmentTools(server);

  return server;
}
