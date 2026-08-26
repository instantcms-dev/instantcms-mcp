import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  auditInstantCmsProject,
  explainInstantCmsProject,
  planInstantCmsUpgrade,
  planProjectChanges,
  repairInstantCmsProject,
} from '../tools/project-workflow-tool.js';
import { successResult } from '../utils/mcp-result.js';
import { createProjectPatch } from '../tools/project-patch-tool.js';
import { loadGithubProject, loadLocalProject } from '../tools/project-source-tool.js';

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
  server.tool(
    'load_instantcms_project',
    'Загружает текстовые файлы проекта из локальной директории или публичного GitHub-репозитория',
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
    async ({ source }) =>
      successResult(
        source.type === 'local'
          ? await loadLocalProject(source.path, source)
          : await loadGithubProject(source.repository, source.ref, source.subpath, source)
      )
  );
  server.tool(
    'create_project_patch',
    'Создаёт стандартный unified Git patch между двумя project file map',
    { before: filesSchema, after: filesSchema },
    async ({ before, after }) => successResult(createProjectPatch(before, after))
  );
  server.tool(
    'audit_instantcms_project',
    'Аудит существующего InstantCMS project file map',
    { files: filesSchema },
    async ({ files }) => successResult(auditInstantCmsProject(files))
  );
  server.tool(
    'plan_project_changes',
    'Строит план исправлений после аудита без изменения файлов',
    { files: filesSchema },
    async ({ files }) => successResult(planProjectChanges(files))
  );
  server.tool(
    'repair_instantcms_project',
    'Применяет только безопасные структурные исправления и возвращает новый file map',
    { files: filesSchema },
    async ({ files }) => successResult(repairInstantCmsProject(files))
  );
  server.tool(
    'explain_instantcms_project',
    'Кратко объясняет структуру существующего InstantCMS проекта',
    { files: filesSchema },
    async ({ files }) => successResult(explainInstantCmsProject(files))
  );
  server.tool(
    'plan_instantcms_upgrade',
    'Планирует обновление проекта между версиями InstantCMS',
    { files: filesSchema, from: z.string().min(2).max(30), to: z.string().min(2).max(30) },
    async ({ files, from, to }) => successResult(planInstantCmsUpgrade(files, from, to))
  );
}
