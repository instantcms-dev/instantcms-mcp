import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { components } from '../data/components.js';
import { hookCategories, hooks } from '../data/hooks.js';
import { addonStructures } from '../data/schemas.js';
import { compareVersionProfiles, instantCmsVersionProfiles } from '../data/version-profiles.js';
import {
  buildAddonArchive,
  inspectAddonArchive,
  validateGeneratedArtifacts,
} from '../tools/artifact-tool.js';
import { errorResult, successResult } from '../utils/mcp-result.js';

const workflows = {
  addon: [
    'analyze_requirement',
    'get_addon_structure',
    'scaffold_addon',
    'validate_addon',
    'validate_generated_artifacts',
    'build_addon_archive',
  ],
  widget: ['list_widgets', 'scaffold_widget', 'validate_generated_artifacts'],
  template: [
    'get_template_structure',
    'scaffold_template',
    'scaffold_layout_scheme',
    'validate_generated_artifacts',
  ],
  audit: [
    'get_server_capabilities',
    'validate_addon',
    'validate_generated_artifacts',
    'inspect_addon_archive',
  ],
};

const toolCatalog = [
  {
    category: 'addon',
    keywords: ['addon', 'дополнение', 'controller', 'crud'],
    tools: workflows.addon,
  },
  {
    category: 'database',
    keywords: ['database', 'база', 'sql', 'migration'],
    tools: ['introspect_database', 'describe_table', 'scaffold_migration'],
  },
  {
    category: 'integration',
    keywords: ['api', 'oauth', 'webhook', 'email'],
    tools: ['scaffold_api', 'scaffold_oauth', 'scaffold_webhook', 'scaffold_email'],
  },
  {
    category: 'template',
    keywords: ['template', 'шаблон', 'layout', 'widget'],
    tools: workflows.template,
  },
];

export function registerMetaTools(server: McpServer): void {
  server.tool(
    'get_server_capabilities',
    'Версии, профили и объём базы знаний MCP-сервера',
    {},
    async () =>
      successResult({
        server_version: '1.2.0',
        tools_count: 81,
        instantcms_profiles: instantCmsVersionProfiles,
        knowledge: {
          hooks: hooks.length,
          hook_categories: hookCategories.length,
          components: components.length,
          addon_types: Object.keys(addonStructures),
        },
      })
  );

  server.tool(
    'find_tool',
    'Подбирает MCP-инструменты по описанию задачи',
    { query: z.string().trim().min(2).max(500) },
    async ({ query }) => {
      const lower = query.toLowerCase();
      const matches = toolCatalog.filter(entry =>
        entry.keywords.some(keyword => lower.includes(keyword))
      );
      return successResult({ query, matches: matches.length ? matches : toolCatalog });
    }
  );

  server.tool(
    'get_workflow',
    'Возвращает рекомендуемую последовательность инструментов',
    { workflow: z.enum(['addon', 'widget', 'template', 'audit']) },
    async ({ workflow }) => successResult({ workflow, tools: workflows[workflow] })
  );

  server.tool(
    'diagnose_request',
    'Определяет тип InstantCMS-задачи и рекомендуемый workflow',
    { request: z.string().trim().min(3).max(2000) },
    async ({ request }) => {
      const lower = request.toLowerCase();
      const workflow =
        lower.includes('виджет') || lower.includes('widget')
          ? 'widget'
          : lower.includes('шаблон') || lower.includes('template') || lower.includes('layout')
            ? 'template'
            : lower.includes('провер') || lower.includes('audit')
              ? 'audit'
              : 'addon';
      return successResult({ workflow, tools: workflows[workflow] });
    }
  );

  server.tool(
    'explain_validation_error',
    'Объясняет стабильный код диагностики',
    { code: z.string().trim().min(2).max(100) },
    async ({ code }) => {
      const explanations: Record<string, string> = {
        MISSING_REQUIRED_FILE: 'Добавьте обязательный файл в каталог контроллера.',
        INVALID_BASE_CLASS: 'Проверьте наследование класса InstantCMS.',
        INVALID_ARTIFACT_SYNTAX: 'Разберите файл соответствующим parser и исправьте синтаксис.',
        VALIDATION_NOTICE: 'Проверьте контекст сообщения: код является общим fallback.',
      };
      return explanations[code]
        ? successResult({ code, explanation: explanations[code] })
        : errorResult('UNKNOWN_DIAGNOSTIC_CODE', `Код ${code} не документирован`);
    }
  );

  server.tool(
    'compare_instantcms_versions',
    'Сравнивает документированные профили InstantCMS',
    { from: z.string(), to: z.string() },
    async ({ from, to }) => successResult(compareVersionProfiles(from, to))
  );

  server.tool(
    'get_project_health',
    'Возвращает состояние встроенной базы и рекомендуемые проверки',
    {},
    async () =>
      successResult({
        status: 'ready',
        server_version: '1.2.0',
        tested_instantcms: '2.18.1',
        checks: ['npm run check', 'npm run test:integration', 'npm run build', 'npm audit'],
      })
  );

  server.tool(
    'validate_generated_artifacts',
    'Проверяет XML, INI, YAML и форму PHP-файлов настоящими parser-ами',
    { files: z.record(z.string(), z.string()).refine(files => Object.keys(files).length <= 500) },
    async ({ files }) => successResult(validateGeneratedArtifacts(files))
  );

  server.tool(
    'build_addon_archive',
    'Создаёт ZIP дополнения в памяти и возвращает base64',
    { files: z.record(z.string(), z.string()).refine(files => Object.keys(files).length <= 500) },
    async ({ files }) => successResult(buildAddonArchive(files))
  );

  server.tool(
    'inspect_addon_archive',
    'Проверяет пути и синтаксис файлов ZIP-архива base64',
    { archive: z.string().max(20_000_000) },
    async ({ archive }) => successResult(inspectAddonArchive(archive))
  );
}
