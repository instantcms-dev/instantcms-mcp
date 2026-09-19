import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { defineTool } from '../utils/define-tool.js';
import { lazyModule } from '../utils/lazy-module.js';

// Оба template-модуля тянут yaml (~17 мс) и нужны только своим инструментам —
// загружаем их лениво при первом вызове.
const loadTemplateDevelopmentTool = lazyModule<
  typeof import('../tools/template-development-tool.js')
>('../tools/template-development-tool.js');
const loadTemplateProductivityTool = lazyModule<
  typeof import('../tools/template-productivity-tool.js')
>('../tools/template-productivity-tool.js');

const templateFilesSchema = z
  .record(z.string(), z.string())
  .refine(files => Object.keys(files).length <= 3000);

export function registerTemplateDevelopmentTools(server: McpServer): void {
  defineTool(
    server,
    'merge_template_overrides',
    'Безопасно переносит upstream-изменения в неизменённые overrides и возвращает Git patch',
    {
      theme_files: templateFilesSchema,
      upstream_before: templateFilesSchema,
      upstream_after: templateFilesSchema,
    },
    async ({ theme_files, upstream_before, upstream_after }) =>
      loadTemplateProductivityTool().mergeTemplateOverrides(
        theme_files as Record<string, string>,
        upstream_before as Record<string, string>,
        upstream_after as Record<string, string>
      )
  );
  defineTool(
    server,
    'audit_template_frontend',
    'Проверяет HTML, accessibility, escaping и качество CSS файлов шаблона',
    { files: templateFilesSchema },
    async ({ files }) =>
      loadTemplateProductivityTool().auditTemplateFrontend(files as Record<string, string>)
  );
  defineTool(
    server,
    'extract_template_design_tokens',
    'Извлекает CSS custom properties, цвета и spacing и предлагает design tokens',
    { files: templateFilesSchema },
    async ({ files }) =>
      loadTemplateProductivityTool().extractTemplateDesignTokens(files as Record<string, string>)
  );
  defineTool(
    server,
    'audit_template_widget_positions',
    'Сопоставляет позиции виджетов в PHP-шаблонах и YAML layout-схемах',
    { files: templateFilesSchema },
    async ({ files }) =>
      loadTemplateProductivityTool().auditTemplateWidgetPositions(files as Record<string, string>)
  );
  defineTool(
    server,
    'scaffold_template_e2e_environment',
    'Генерирует Docker Compose и Playwright visual regression окружение для темы',
    {
      theme: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/),
      base_url: z.string().url().optional(),
    },
    async options =>
      loadTemplateProductivityTool().scaffoldTemplateE2eEnvironment(
        options as { theme: string; base_url?: string }
      )
  );
  defineTool(
    server,
    'index_upstream_template_sources',
    'Индексирует upstream template-файлы с SHA-256 и ссылками на исходный commit',
    {
      files: templateFilesSchema,
      repository: z.string().regex(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/),
      ref: z.string().regex(/^[a-zA-Z0-9._/-]+$/),
    },
    async ({ files, repository, ref }) =>
      loadTemplateProductivityTool().indexUpstreamTemplateSources(files as Record<string, string>, {
        repository: String(repository),
        ref: String(ref),
      })
  );
  defineTool(
    server,
    'scaffold_template_php_quality',
    'Генерирует PHPStan, PHPCS и PHPCompatibility конфигурацию для шаблона',
    {
      theme: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/),
      php_min: z
        .string()
        .regex(/^\d+\.\d+$/)
        .optional()
        .default('7.2'),
    },
    async options =>
      loadTemplateProductivityTool().scaffoldTemplatePhpQuality(
        options as { theme: string; php_min?: string }
      )
  );
  defineTool(
    server,
    'scaffold_complete_template',
    'Создаёт полный каркас frontend-шаблона InstantCMS и импортируемую layout-схему',
    {
      name: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/),
      title: z.string().trim().min(1).max(200),
      author: z.string().trim().max(200).optional(),
      inherit: z
        .array(z.string().regex(/^[a-z][a-z0-9_]{1,63}$/))
        .max(10)
        .optional(),
      with_layout_scheme: z.boolean().optional().default(true),
    },
    async options =>
      loadTemplateDevelopmentTool().scaffoldCompleteTemplate(
        options as {
          name: string;
          title: string;
          author?: string;
          inherit?: string[];
          with_layout_scheme?: boolean;
        }
      )
  );
  defineTool(
    server,
    'analyze_instantcms_template',
    'Анализирует структуру, overrides, widget positions, layout-файлы и риски шаблона',
    {
      files: templateFilesSchema,
      theme: z
        .string()
        .regex(/^[a-z][a-z0-9_]{1,63}$/)
        .optional(),
    },
    async ({ files, theme }) =>
      loadTemplateDevelopmentTool().analyzeInstantCmsTemplate(
        files as Record<string, string>,
        theme === undefined ? undefined : String(theme)
      )
  );
  defineTool(
    server,
    'scaffold_template_override',
    'Создаёт точную копию upstream template-файла в правильном каталоге override темы',
    {
      theme: z.string().regex(/^[a-z][a-z0-9_]{1,63}$/),
      source_path: z.string().min(1).max(500),
      source_content: z.string().max(2 * 1024 * 1024),
      controller: z
        .string()
        .regex(/^[a-z][a-z0-9_]{1,63}$/)
        .optional(),
      action: z
        .string()
        .regex(/^[a-z][a-z0-9_]{0,63}$/)
        .optional(),
      backend: z.boolean().optional(),
    },
    async options =>
      loadTemplateDevelopmentTool().scaffoldTemplateOverride(
        options as {
          theme: string;
          source_path: string;
          source_content: string;
          controller?: string;
          action?: string;
          backend?: boolean;
        }
      )
  );
  defineTool(
    server,
    'validate_layout_scheme',
    'Проверяет YAML-синтаксис, layout root и widget positions схемы InstantCMS',
    {
      yaml: z
        .string()
        .min(1)
        .max(2 * 1024 * 1024),
    },
    async ({ yaml }) => loadTemplateDevelopmentTool().validateLayoutScheme(String(yaml))
  );
  defineTool(
    server,
    'check_template_override_compatibility',
    'Сравнивает overrides темы с upstream template-файлами до и после обновления InstantCMS',
    {
      theme_files: templateFilesSchema,
      upstream_before: templateFilesSchema,
      upstream_after: templateFilesSchema,
    },
    async ({ theme_files, upstream_before, upstream_after }) =>
      loadTemplateDevelopmentTool().checkTemplateOverrideCompatibility(
        theme_files as Record<string, string>,
        upstream_before as Record<string, string>,
        upstream_after as Record<string, string>
      )
  );
}
