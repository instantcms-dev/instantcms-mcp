import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  auditInstantCmsProject,
  explainInstantCmsProject,
  planInstantCmsUpgrade,
  planProjectChanges,
  repairInstantCmsProject,
} from '../tools/project-workflow-tool.js';
import { defineTool } from '../utils/define-tool.js';
import { createProjectPatch } from '../tools/project-patch-tool.js';
import {
  loadGithubProject,
  loadLocalProject,
  type ProjectLoadOptions,
} from '../tools/project-source-tool.js';

type LoadSource =
  | ({ type: 'local'; path: string } & ProjectLoadOptions)
  | ({ type: 'github'; repository: string; ref: string; subpath: string } & ProjectLoadOptions);

const filesSchema = z
  .record(z.string(), z.string())
  .refine(files => Object.keys(files).length <= 2000);

const loadLimitsSchema = {
  max_files: z.number().int().min(1).max(5000).optional(),
  max_file_bytes: z
    .number()
    .int()
    .min(1024)
    .max(5 * 1024 * 1024)
    .optional(),
  max_total_bytes: z
    .number()
    .int()
    .min(1024)
    .max(50 * 1024 * 1024)
    .optional(),
};

export function registerProjectTools(server: McpServer): void {
  defineTool(
    server,
    'load_instantcms_project',
    'Загружает текстовые файлы проекта из локальной директории или публичного GitHub-репозитория / Loads project text files from a local directory or a public GitHub repository',
    {
      source: z.discriminatedUnion('type', [
        z.object({ type: z.literal('local'), path: z.string().min(1), ...loadLimitsSchema }),
        z.object({
          type: z.literal('github'),
          repository: z.string().min(3),
          ref: z.string().min(1).default('main'),
          subpath: z.string().default(''),
          ...loadLimitsSchema,
        }),
      ]),
    },
    async args => {
      const source = (args as { source: LoadSource }).source;
      return (
        source.type === 'local'
          ? await loadLocalProject(source.path, source)
          : await loadGithubProject(source.repository, source.ref, source.subpath, source)
      ) as Record<string, unknown>;
    }
  );
  defineTool(
    server,
    'create_project_patch',
    'Создаёт стандартный unified Git patch между двумя project file map / Creates a standard unified Git patch between two project file maps',
    { before: filesSchema, after: filesSchema },
    async args => {
      const { before, after } = args as {
        before: Record<string, string>;
        after: Record<string, string>;
      };
      return createProjectPatch(before, after) as Record<string, unknown>;
    }
  );
  defineTool(
    server,
    'audit_instantcms_project',
    'Аудит существующего InstantCMS project file map / Audits an existing InstantCMS project file map',
    { files: filesSchema },
    async args =>
      auditInstantCmsProject((args as { files: Record<string, string> }).files) as Record<
        string,
        unknown
      >
  );
  defineTool(
    server,
    'plan_project_changes',
    'Строит план исправлений после аудита без изменения файлов / Builds a fix plan after an audit without modifying files',
    { files: filesSchema },
    async args =>
      planProjectChanges((args as { files: Record<string, string> }).files) as Record<
        string,
        unknown
      >
  );
  defineTool(
    server,
    'repair_instantcms_project',
    'Применяет только безопасные структурные исправления и возвращает новый file map / Applies only safe structural fixes and returns the new file map',
    { files: filesSchema },
    async args =>
      repairInstantCmsProject((args as { files: Record<string, string> }).files) as Record<
        string,
        unknown
      >
  );
  defineTool(
    server,
    'explain_instantcms_project',
    'Кратко объясняет структуру существующего InstantCMS проекта / Briefly explains the structure of an existing InstantCMS project',
    { files: filesSchema },
    async args =>
      explainInstantCmsProject((args as { files: Record<string, string> }).files) as Record<
        string,
        unknown
      >
  );
  defineTool(
    server,
    'plan_instantcms_upgrade',
    'Планирует обновление проекта между версиями InstantCMS / Plans a project upgrade between InstantCMS versions',
    { files: filesSchema, from: z.string().min(2).max(30), to: z.string().min(2).max(30) },
    async args => {
      const { files, from, to } = args as {
        files: Record<string, string>;
        from: string;
        to: string;
      };
      return planInstantCmsUpgrade(files, from, to) as Record<string, unknown>;
    }
  );
}
