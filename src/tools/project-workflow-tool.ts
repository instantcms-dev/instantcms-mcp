import { validateAddon } from './addon-tool.js';
import { validateGeneratedArtifacts, type ArtifactDiagnostic } from './artifact-tool.js';
import { compareVersionProfiles } from '../data/version-profiles.js';
import { components } from '../data/components.js';
import { hooks } from '../data/hooks.js';

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
  const artifact = validateGeneratedArtifacts(files);
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
  const files = normalizeFiles(filesInput);
  const plan = planProjectChanges(files);
  const applied: ProjectOperation[] = [];
  for (const operation of plan.operations) {
    if (operation.kind !== 'move' || !operation.safe || !operation.target) continue;
    if (!(operation.path in files) || operation.target in files) continue;
    files[operation.target] = files[operation.path];
    delete files[operation.path];
    applied.push(operation);
  }
  return { files, applied, remaining: auditInstantCmsProject(files) };
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
  const comparison = compareVersionProfiles(from, to);
  const audit = auditInstantCmsProject(files);
  const code = Object.values(files).join('\n');
  const referencedHooks = [
    ...new Set([...code.matchAll(/['"]([a-z][a-z0-9_]+)['"]/g)].map(m => m[1])),
  ]
    .filter(name => name.includes('_'))
    .filter(name => hooks.some(hook => hook.name === name));
  const referencedMethods = [
    ...new Set([...code.matchAll(/->([a-zA-Z_]\w*)\s*\(/g)].map(m => m[1])),
  ];
  const knownMethods = new Set(
    components.flatMap(component => component.methods.map(method => method.name))
  );
  const unknownMethods = referencedMethods.filter(method => !knownMethods.has(method));
  return {
    from,
    to,
    comparison,
    audit,
    compatibility: {
      referenced_hooks: referencedHooks,
      unknown_method_candidates: unknownMethods,
    },
    checklist: [
      'Повторно проверьте manifest.xml и minimum supported version.',
      'Запустите audit_instantcms_project после изменений.',
      'Проверьте install/uninstall на чистой целевой InstantCMS.',
      'Перепроверьте hooks и методы с unknown_method_candidates вручную.',
    ],
  };
}
