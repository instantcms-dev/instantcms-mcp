import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { parse as parseIni } from 'ini';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { parse as parseYaml } from 'yaml';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

export interface ArtifactDiagnostic {
  code: string;
  severity: 'error' | 'warning';
  path: string;
  message: string;
}

export function validateGeneratedArtifacts(files: Record<string, string>) {
  const diagnostics: ArtifactDiagnostic[] = [];
  for (const [path, content] of Object.entries(files)) {
    try {
      if (path.endsWith('.xml')) {
        const result = XMLValidator.validate(content);
        if (result !== true) throw new Error(result.err.msg);
        new XMLParser().parse(content);
      } else if (path.endsWith('.ini')) {
        parseIni(content);
      } else if (/\.ya?ml$/i.test(path)) {
        parseYaml(content);
      } else if (path.endsWith('.php')) {
        validatePhpShape(content);
        const lint = spawnSync('php', ['-l'], { input: content, encoding: 'utf8', timeout: 5_000 });
        if (lint.error && (lint.error as NodeJS.ErrnoException).code === 'ENOENT') {
          if (!diagnostics.some(item => item.code === 'PHP_LINTER_UNAVAILABLE')) {
            diagnostics.push({ code: 'PHP_LINTER_UNAVAILABLE', severity: 'warning', path, message: 'php executable не найден; выполнена только структурная проверка' });
          }
        } else if (lint.status !== 0) {
          throw new Error((lint.stderr || lint.stdout || 'php -l failed').trim());
        }
      }
    } catch (error) {
      diagnostics.push({
        code: 'INVALID_ARTIFACT_SYNTAX',
        severity: 'error',
        path,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return {
    is_valid: !diagnostics.some(item => item.severity === 'error'),
    files_checked: Object.keys(files).length,
    diagnostics,
  };
}

export function buildAddonArchive(files: Record<string, string>) {
  assertSafePaths(Object.keys(files));
  const entries = Object.fromEntries(
    Object.entries(files).map(([path, content]) => [normalizePackagePath(path), strToU8(content)])
  );
  const bytes = zipSync(entries, { level: 6 });
  return {
    encoding: 'base64',
    archive: Buffer.from(bytes).toString('base64'),
    bytes: bytes.length,
    files_count: Object.keys(entries).length,
  };
}

export function inspectAddonArchive(base64: string) {
  const entries = unzipSync(Buffer.from(base64, 'base64'));
  const paths = Object.keys(entries);
  assertSafePaths(paths);
  const files = Object.fromEntries(paths.map(path => [path, strFromU8(entries[path])]));
  return { paths, ...validateGeneratedArtifacts(files) };
}

function normalizePackagePath(path: string): string {
  return path
    .replace(/^\[pkg\]\s*/, '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
}

function assertSafePaths(paths: string[]): void {
  for (const path of paths) {
    const normalized = normalizePackagePath(path);
    if (!normalized || normalized.split('/').includes('..'))
      throw new Error(`Небезопасный путь архива: ${path}`);
  }
}

function validatePhpShape(content: string): void {
  if (!content.trimStart().startsWith('<?php') && !content.trimStart().startsWith('<!DOCTYPE')) {
    throw new Error('PHP-файл должен начинаться с <?php');
  }
  const opens = (content.match(/[({\[]/g) ?? []).length;
  const closes = (content.match(/[)}\]]/g) ?? []).length;
  if (opens !== closes) throw new Error('Несбалансированные скобки в PHP-файле');
}
