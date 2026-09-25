import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { getServerVersion } from './version.js';
import { logger } from './utils/logger.js';

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
import { trackRegisteredTools } from './utils/tool-registry.js';

/** Опции создания сервера. */
export interface CreateServerOptions {
  /**
   * Группы инструментов, которые не нужно регистрировать (экономия токенов
   * клиента: tools/list уходит в контекст на каждый запрос). Дефолт — все
   * группы. Через окружение: INSTANTCMS_MCP_DISABLE=templates,sources.
   */
  disableGroups?: readonly string[];
}

/**
 * Имена инструментов по группам (registry-файлам).
 *
 * Список не ведётся вручную: каждая группа один раз пробно регистрируется на
 * фейковый сервер, который только записывает имена. Новый инструмент попадает
 * в карту автоматически и не может разойтись с реальным набором. Ресурсы
 * фильтрации не подлежат: они не входят в контекст на каждый запрос.
 */
function collectToolGroups(): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  const recorder = (group: string): McpServer => {
    const names = groups.get(group) ?? new Set<string>();
    groups.set(group, names);
    const noop = () => undefined;
    return new Proxy(
      {},
      {
        get: (_target, prop) =>
          prop === 'tool' ? (name: string) => names.add(String(name)) : noop,
      }
    ) as unknown as McpServer;
  };

  registerMetaTools(recorder('meta'), () => 0);
  registerGeneratorTools(recorder('generators'));
  registerKnowledgeTools(recorder('knowledge'));
  registerDatabaseTools(recorder('database'));
  registerSourceTools(recorder('sources'));
  registerLanguageTools(recorder('languages'));
  registerExtensionTools(recorder('extensions'));
  registerProjectTools(recorder('project'));
  registerTemplateDevelopmentTools(recorder('templates'));
  return groups;
}

function resolveDisabledNames(
  groups: Map<string, Set<string>>,
  requested: readonly string[]
): Set<string> {
  if (requested.length === 0) return new Set();
  const disabled = new Set<string>();
  const unknown: string[] = [];
  for (const group of requested) {
    const names = groups.get(group);
    if (!names) {
      unknown.push(group);
      continue;
    }
    for (const name of names) disabled.add(name);
  }
  if (unknown.length > 0) {
    logger.warn(
      `INSTANTCMS_MCP_DISABLE: неизвестные группы — ${unknown.join(', ')}; доступные: ${[...groups.keys()].join(', ')}`
    );
  }
  return disabled;
}

function parseDisableGroupsEnv(): string[] {
  const raw = process.env.INSTANTCMS_MCP_DISABLE;
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

export function createServer(options: CreateServerOptions = {}): McpServer {
  const server = new McpServer({
    name: 'instantcms-mcp',
    version: getServerVersion(),
    description: 'MCP сервер для разработки дополнений и шаблонов InstantCMS 2',
  });

  const groups = collectToolGroups();
  const disabled = resolveDisabledNames(groups, options.disableGroups ?? parseDisableGroupsEnv());
  const getToolsCount = trackRegisteredTools(server, { skip: name => disabled.has(name) });

  registerMetaTools(server, getToolsCount);
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
