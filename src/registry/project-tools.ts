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

const filesSchema = z
  .record(z.string(), z.string())
  .refine(files => Object.keys(files).length <= 2000);

export function registerProjectTools(server: McpServer): void {
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
