import { validateAddon } from './addon-tool.js';
import type { ArtifactDiagnostic } from './artifact-tool.js';
import { hooks } from '../data/hooks.js';
import { createProjectPatch } from './project-patch-tool.js';
import { lazyModule } from '../utils/lazy-module.js';

// artifact-tool (fast-xml-parser, yaml, fflate), version-api (7.7k строк
// снапшотов), components и version-profiles нужны только конкретным
// операциям — загружаем их лениво.
const loadArtifactTool = lazyModule<typeof import('./artifact-tool.js')>(
  '../tools/artifact-tool.js'
);
const loadVersionApi =
  lazyModule<typeof import('../utils/version-api.js')>('../utils/version-api.js');
const loadComponents = lazyModule<typeof import('../data/components.js')>('../data/components.js');
const loadVersionProfiles = lazyModule<typeof import('../data/version-profiles.js')>(
  '../data/version-profiles.js'
);

export interface ProjectDiagnostic extends ArtifactDiagnostic {
  suggestion?: string;
}

export interface ProjectOperation {
  kind: 'create' | 'move' | 'replace' | 'review';
  path: string;
  target?: string;
  reason: string;
  safe: boolean;
}

function normalizeFiles(files: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(files).map(([filePath, content]) => [
      filePath.replace(/\\/g, '/').replace(/^\.\//, ''),
      content,
    ])
  );
}

function projectKind(files: Record<string, string>): 'addon' | 'template' | 'widget' | 'unknown' {
  const paths = Object.keys(files);
  if (paths.some(file => /(?:^|\/)manifest\.xml$/.test(file))) return 'addon';
  if (paths.some(file => /(?:^|\/)widgets?\//.test(file))) return 'widget';
  if (paths.some(file => /(?:^|\/)templates?\//.test(file))) return 'template';
  return 'unknown';
}

function securityDiagnostics(files: Record<string, string>): ProjectDiagnostic[] {
  const diagnostics: ProjectDiagnostic[] = [];
  for (const [filePath, content] of Object.entries(files)) {
    if (!filePath.endsWith('.php')) continue;
    if (/->query\(\s*["'`][^"'`]*\$[a-z_]/i.test(content)) {
      diagnostics.push({
        code: 'POSSIBLE_SQL_INTERPOLATION',
        severity: 'warning',
        path: filePath,
        message: 'SQL-запрос содержит интерполяцию переменной.',
        suggestion: 'Используйте query builder или параметризованный запрос.',
      });
    }
    if (/\becho\s+\$(?:_GET|_POST|_REQUEST|[a-z_]\w*)\s*;/i.test(content)) {
      diagnostics.push({
        code: 'POSSIBLE_UNESCAPED_OUTPUT',
        severity: 'warning',
        path: filePath,
        message: 'Переменная выводится без видимого контекстного экранирования.',
        suggestion: 'Проверьте происхождение значения и примените HTML escaping в шаблоне.',
      });
    }
    if (/class\s+\w+\s+extends\s+cmsGrid\b/.test(content)) {
      diagnostics.push({
        code: 'LEGACY_CMSGRID_CLASS',
        severity: 'error',
        path: filePath,
        message: 'Backend grid должен быть функцией grid_*, а не классом cmsGrid.',
        suggestion: 'Перенесите конфигурацию в функцию backend/grids/grid_*.php.',
      });
    }
  }
  return diagnostics;
}

function pathDiagnostics(files: Record<string, string>): ProjectDiagnostic[] {
  return Object.keys(files).flatMap(filePath => {
    if (/controllers\/[^/]+\/languages\//.test(filePath)) {
      return [
        {
          code: 'MISPLACED_LANGUAGE_FILE',
          severity: 'error' as const,
          path: filePath,
          message: 'Language files должны находиться вне каталога контроллера.',
          suggestion: 'Переместите файл в system/languages/{lang}/controllers/{name}/.',
        },
      ];
    }
    return [];
  });
}

export function auditInstantCmsProject(filesInput: Record<string, string>) {
  const files = normalizeFiles(filesInput);
  const kind = projectKind(files);
  const artifact = loadArtifactTool().validateGeneratedArtifacts(files);
  const addon = kind === 'addon' ? validateAddon(files) : null;
  const addonDiagnostics: ProjectDiagnostic[] = addon
    ? (
        (
          addon as {
            diagnostics?: Array<{
              code: string;
              severity: 'error' | 'warning' | 'tip';
              path?: string;
              message: string;
            }>;
          }
        ).diagnostics ?? []
      )
        .filter(
          (item): item is typeof item & { severity: 'error' | 'warning' } =>
            item.severity === 'error' || item.severity === 'warning'
        )
        .map(item => ({ ...item, path: item.path ?? '' }))
    : [];
  const diagnostics: ProjectDiagnostic[] = [
    ...artifact.diagnostics,
    ...addonDiagnostics,
    ...pathDiagnostics(files),
    ...securityDiagnostics(files),
  ];
  return {
    kind,
    files_checked: Object.keys(files).length,
    is_valid: !diagnostics.some(item => item.severity === 'error'),
    summary: {
      errors: diagnostics.filter(item => item.severity === 'error').length,
      warnings: diagnostics.filter(item => item.severity === 'warning').length,
    },
    diagnostics,
  };
}

export function planProjectChanges(files: Record<string, string>) {
  const audit = auditInstantCmsProject(files);
  const operations: ProjectOperation[] = audit.diagnostics.map(diagnostic => ({
    kind: diagnostic.code === 'MISPLACED_LANGUAGE_FILE' ? 'move' : 'review',
    path: diagnostic.path,
    target:
      diagnostic.code === 'MISPLACED_LANGUAGE_FILE'
        ? diagnostic.path.replace(
            /controllers\/([^/]+)\/languages\/([^/]+)\//,
            'languages/$2/controllers/$1/'
          )
        : undefined,
    reason: diagnostic.suggestion ?? diagnostic.message,
    safe: diagnostic.code === 'MISPLACED_LANGUAGE_FILE',
  }));
  return { audit, operations, safe_operations: operations.filter(item => item.safe).length };
}

export function repairInstantCmsProject(filesInput: Record<string, string>) {
  const before = normalizeFiles(filesInput);
  const files = { ...before };
  const plan = planProjectChanges(files);
  const applied: ProjectOperation[] = [];
  for (const operation of plan.operations) {
    if (operation.kind !== 'move' || !operation.safe || !operation.target) continue;
    if (!(operation.path in files) || operation.target in files) continue;
    files[operation.target] = files[operation.path];
    delete files[operation.path];
    applied.push(operation);
  }
  return {
    files,
    applied,
    patch: createProjectPatch(before, files),
    remaining: auditInstantCmsProject(files),
  };
}

export function explainInstantCmsProject(files: Record<string, string>) {
  const normalized = normalizeFiles(files);
  const paths = Object.keys(normalized);
  return {
    kind: projectKind(normalized),
    files: paths.length,
    controllers: [...new Set(paths.flatMap(path => path.match(/controllers\/([^/]+)/)?.[1] ?? []))],
    hooks: paths.filter(path => /\/hooks\/[^/]+\.php$/.test(path)),
    actions: paths.filter(path => /\/actions\/[^/]+\.php$/.test(path)),
    forms: paths.filter(path => /\/forms\/[^/]+\.php$/.test(path)),
    templates: paths.filter(path => /\.tpl\.php$/.test(path)),
    languages: paths.filter(path => /(?:^|\/)languages\//.test(path)),
  };
}

export function planInstantCmsUpgrade(files: Record<string, string>, from: string, to: string) {
  const comparison = loadVersionProfiles().compareVersionProfiles(from, to);
  const versionApi = loadVersionApi().compareVersionApi(from, to);
  const audit = auditInstantCmsProject(files);
  const code = Object.values(files).join('\n');
  const referencedHooks = [
    ...new Set([...code.matchAll(/['"]([a-z][a-z0-9_]+)['"]/g)].map(m => m[1])),
  ]
    .filter(name => name.includes('_'))
    .filter(name =>
      versionApi
        ? versionApi.source_hooks.has(name) || versionApi.target_hooks.has(name)
        : hooks.some(hook => hook.name === name)
    );
  const referencedMethods = [
    ...new Set([...code.matchAll(/->([a-zA-Z_]\w*)\s*\(/g)].map(m => m[1])),
  ];
  const knownMethods = new Set(
    loadComponents().components.flatMap(component => component.methods.map(method => method.name))
  );
  const unknownMethods = referencedMethods.filter(method =>
    versionApi ? !versionApi.target_method_names.has(method) : !knownMethods.has(method)
  );
  const referencedHookNames = new Set(referencedHooks);
  const referencedMethodNames = new Set(referencedMethods);
  return {
    from,
    to,
    comparison,
    version_api: versionApi
      ? {
          provenance: versionApi.provenance,
          hook_changes_in_project: {
            added: versionApi.hooks.added.filter(item => referencedHookNames.has(item.name)),
            removed: versionApi.hooks.removed.filter(item => referencedHookNames.has(item.name)),
          },
          method_changes_in_project: {
            added: versionApi.methods.added.filter(item => referencedMethodNames.has(item.name)),
            removed: versionApi.methods.removed.filter(item =>
              referencedMethodNames.has(item.name)
            ),
          },
          referenced_hooks_missing_in_target: referencedHooks.filter(
            name => !versionApi.target_hooks.has(name)
          ),
          referenced_method_names_missing_in_target: referencedMethods.filter(
            name => !versionApi.target_method_names.has(name)
          ),
        }
      : null,
    audit,
    compatibility: {
      referenced_hooks: referencedHooks,
      unknown_method_candidates: unknownMethods,
    },
    checklist: [
      'Проверьте manifest.xml и минимальную версию / Check manifest.xml and minimum version / 检查 manifest.xml 和最低版本。',
      'Запустите audit_instantcms_project / Run audit_instantcms_project / 运行 audit_instantcms_project。',
      'Проверьте установку на чистой целевой версии / Test installation on a clean target version / 在全新目标版本上测试安装。',
      'Проверьте отмеченные хуки и методы вручную / Review flagged hooks and methods manually / 人工检查标记的钩子和方法。',
    ],
  };
}
