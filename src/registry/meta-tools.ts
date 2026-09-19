import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { hookCategories, hooks } from '../data/hooks.js';
import { knowledgeSummary } from '../generated/knowledge-meta.js';
import { defineTool, defineToolWithManualResult } from '../utils/define-tool.js';
import { findToolCategories } from '../utils/find-tool.js';
import { getServerVersion } from '../version.js';
import { errorResult, successResult } from '../utils/mcp-result.js';
import { lazyModule } from '../utils/lazy-module.js';

// Тяжёлые справочники (components с generated-источником, schemas,
// version-profiles с 7.7k строк снапшотов) нужны только при вызове
// инструментов — загружаем лениво. hooks остаётся eager: он нужен
// knowledge-tools при регистрации describe().
const loadArtifactTool = lazyModule<typeof import('../tools/artifact-tool.js')>(
  '../tools/artifact-tool.js'
);
const loadComponents = lazyModule<typeof import('../data/components.js')>('../data/components.js');
const loadSchemas = lazyModule<typeof import('../data/schemas.js')>('../data/schemas.js');
const loadVersionProfiles = lazyModule<typeof import('../data/version-profiles.js')>(
  '../data/version-profiles.js'
);

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
    'scaffold_complete_template',
    'analyze_instantcms_template',
    'scaffold_template_override',
    'scaffold_layout_scheme',
    'validate_layout_scheme',
    'check_template_override_compatibility',
    'merge_template_overrides',
    'audit_template_frontend',
    'extract_template_design_tokens',
    'audit_template_widget_positions',
    'scaffold_template_e2e_environment',
    'index_upstream_template_sources',
    'scaffold_template_php_quality',
    'validate_generated_artifacts',
  ],
  audit: [
    'get_server_capabilities',
    'validate_addon',
    'validate_generated_artifacts',
    'inspect_addon_archive',
  ],
  repair: [
    'load_instantcms_project',
    'explain_instantcms_project',
    'audit_instantcms_project',
    'plan_project_changes',
    'repair_instantcms_project',
    'create_project_patch',
    'audit_instantcms_project',
  ],
  upgrade: [
    'explain_instantcms_project',
    'plan_instantcms_upgrade',
    'plan_project_changes',
    'audit_instantcms_project',
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
  {
    category: 'project',
    keywords: ['project', 'проект', 'audit', 'аудит', 'repair', 'исправ', 'upgrade', 'обнов'],
    tools: [...workflows.repair, 'plan_instantcms_upgrade'],
  },
];

export function registerMetaTools(server: McpServer, getToolsCount: () => number): void {
  defineTool(
    server,
    'get_server_capabilities',
    'Версии, профили и объём базы знаний MCP-сервера. / Versions, profiles, and knowledge base size of the MCP server.',
    {},
    () => ({
      server_version: getServerVersion(),
      tools_count: getToolsCount(),
      instantcms_profiles: loadVersionProfiles().instantCmsVersionProfiles,
      knowledge: {
        hooks: hooks.length,
        hook_categories: hookCategories.length,
        components: loadComponents().components.length,
        addon_types: Object.keys(loadSchemas().addonStructures),
        // Какие домены подтверждены парсером закреплённого исходника,
        // а какие написаны вручную — см. knowledge/catalog.yaml.
        sources: knowledgeSummary,
      },
    })
  );

  defineTool(
    server,
    'find_tool',
    'Подбирает MCP-инструменты по описанию задачи. / Selects MCP tools by task description.',
    { query: z.string().trim().min(2).max(500) },
    args => {
      const query = (args as { query: string }).query;
      const { matches, ranked } = findToolCategories(query, toolCatalog);
      return {
        query,
        matches: matches.length ? matches : toolCatalog,
        ranked,
      };
    }
  );

  defineTool(
    server,
    'get_workflow',
    'Возвращает рекомендуемую последовательность инструментов. / Returns the recommended sequence of tools.',
    { workflow: z.enum(['addon', 'widget', 'template', 'audit', 'repair', 'upgrade']) },
    args => {
      const workflow = (args as { workflow: keyof typeof workflows }).workflow;
      return { workflow, tools: workflows[workflow] };
    }
  );

  defineTool(
    server,
    'diagnose_request',
    'Определяет тип InstantCMS-задачи и рекомендуемый workflow. / Determines the InstantCMS task type and recommended workflow.',
    { request: z.string().trim().min(3).max(2000) },
    args => {
      const request = (args as { request: string }).request;
      const lower = request.toLowerCase();
      const workflow =
        lower.includes('виджет') || lower.includes('widget')
          ? 'widget'
          : lower.includes('шаблон') || lower.includes('template') || lower.includes('layout')
            ? 'template'
            : lower.includes('провер') || lower.includes('audit')
              ? 'audit'
              : lower.includes('обнов') || lower.includes('upgrade')
                ? 'upgrade'
                : lower.includes('исправ') || lower.includes('repair')
                  ? 'repair'
                  : 'addon';
      return { workflow, tools: workflows[workflow] };
    }
  );

  defineToolWithManualResult(
    server,
    'explain_validation_error',
    'Объясняет стабильный код диагностики. / Explains a stable diagnostic code.',
    { code: z.string().trim().min(2).max(100) },
    args => {
      const code = (args as { code: string }).code;
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

  defineTool(
    server,
    'compare_instantcms_versions',
    'Сравнивает документированные профили InstantCMS. / Compares documented InstantCMS profiles.',
    { from: z.string(), to: z.string() },
    args =>
      loadVersionProfiles().compareVersionProfiles(
        (args as { from: string }).from,
        (args as { to: string }).to
      )
  );

  defineTool(
    server,
    'get_project_health',
    'Возвращает состояние встроенной базы и рекомендуемые проверки. / Returns the state of the built-in knowledge base and recommended checks.',
    {},
    () => ({
      status: 'ready',
      server_version: getServerVersion(),
      tested_instantcms: '2.18.2',
      checks: ['npm run check', 'npm run test:integration', 'npm run build', 'npm audit'],
    })
  );

  defineTool(
    server,
    'validate_generated_artifacts',
    'Проверяет XML, INI, YAML и форму PHP-файлов настоящими parser-ами. / Validates XML, INI, YAML, and the shape of PHP files with real parsers.',
    { files: z.record(z.string(), z.string()).refine(files => Object.keys(files).length <= 500) },
    args =>
      loadArtifactTool().validateGeneratedArtifacts(
        (args as { files: Record<string, string> }).files
      )
  );

  defineTool(
    server,
    'build_addon_archive',
    'Создаёт ZIP дополнения в памяти и возвращает base64. / Creates an addon ZIP in memory and returns base64.',
    { files: z.record(z.string(), z.string()).refine(files => Object.keys(files).length <= 500) },
    args => loadArtifactTool().buildAddonArchive((args as { files: Record<string, string> }).files)
  );

  defineTool(
    server,
    'inspect_addon_archive',
    'Проверяет пути и синтаксис файлов ZIP-архива base64. / Checks paths and syntax of files inside a base64 ZIP archive.',
    { archive: z.string().max(20_000_000) },
    args => loadArtifactTool().inspectAddonArchive((args as { archive: string }).archive)
  );
}
