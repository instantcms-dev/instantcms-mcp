import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { unzipSync } from 'fflate';

const DEFAULT_MAX_FILES = 2000;
const DEFAULT_MAX_FILE_BYTES = 1024 * 1024;
const DEFAULT_MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const ignoredDirectories = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build', '.idea']);
const textExtensions = new Set([
  '.css',
  '.html',
  '.ini',
  '.js',
  '.json',
  '.md',
  '.php',
  '.scss',
  '.sql',
  '.svg',
  '.tpl',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
]);

export interface ProjectLoadOptions {
  max_files?: number;
  max_file_bytes?: number;
  max_total_bytes?: number;
}

function limits(options: ProjectLoadOptions) {
  return {
    maxFiles: options.max_files ?? DEFAULT_MAX_FILES,
    maxFileBytes: options.max_file_bytes ?? DEFAULT_MAX_FILE_BYTES,
    maxTotalBytes: options.max_total_bytes ?? DEFAULT_MAX_TOTAL_BYTES,
  };
}

function isTextFile(path: string, bytes: Uint8Array): boolean {
  const extension = path.includes('.') ? path.slice(path.lastIndexOf('.')).toLowerCase() : '';
  if (
    textExtensions.has(extension) ||
    ['LICENSE', 'README', '.gitignore'].includes(path.split('/').at(-1) ?? '')
  ) {
    return !bytes.subarray(0, 8192).includes(0);
  }
  return false;
}

function assertWithinRoot(root: string, candidate: string): void {
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    throw new Error(`Path escapes the requested project root: ${candidate}`);
  }
}

export async function loadLocalProject(rootInput: string, options: ProjectLoadOptions = {}) {
  const root = await realpath(resolve(rootInput));
  if (!(await lstat(root)).isDirectory()) throw new Error('Local project path must be a directory');
  const configured = limits(options);
  const files: Record<string, string> = {};
  const skipped: Array<{ path: string; reason: string }> = [];
  let totalBytes = 0;

  async function walk(directory: string): Promise<void> {
    assertWithinRoot(root, directory);
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        skipped.push({
          path: relative(root, resolve(directory, entry.name)),
          reason: 'symbolic_link',
        });
        continue;
      }
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const absolute = resolve(directory, entry.name);
      assertWithinRoot(root, absolute);
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      const path = relative(root, absolute).split(sep).join('/');
      const bytes = await readFile(absolute);
      if (bytes.byteLength > configured.maxFileBytes) {
        skipped.push({ path, reason: 'file_too_large' });
        continue;
      }
      if (!isTextFile(path, bytes)) {
        skipped.push({ path, reason: 'binary_or_unsupported' });
        continue;
      }
      if (Object.keys(files).length >= configured.maxFiles)
        throw new Error('Project file limit exceeded');
      totalBytes += bytes.byteLength;
      if (totalBytes > configured.maxTotalBytes)
        throw new Error('Project total size limit exceeded');
      files[path] = bytes.toString('utf8');
    }
  }

  await walk(root);
  return {
    source: 'local' as const,
    root,
    files,
    files_loaded: Object.keys(files).length,
    total_bytes: totalBytes,
    skipped,
  };
}

function validateGithubPart(value: string, label: string): string {
  if (!/^[A-Za-z0-9._/-]+$/.test(value) || value.includes('..') || value.startsWith('/')) {
    throw new Error(`Invalid GitHub ${label}`);
  }
  return value;
}

export async function loadGithubProject(
  repository: string,
  ref = 'main',
  subpath = '',
  options: ProjectLoadOptions = {}
) {
  const match = repository.match(
    /^(?:https:\/\/github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/
  );
  if (!match)
    throw new Error('Repository must be owner/name or an https://github.com/owner/name URL');
  const owner = validateGithubPart(match[1], 'owner');
  const name = validateGithubPart(match[2], 'repository');
  const safeRef = validateGithubPart(ref, 'ref');
  const safeSubpath = subpath
    ? validateGithubPart(subpath.replace(/^\.\//, '').replace(/\/$/, ''), 'subpath')
    : '';
  const response = await fetch(
    `https://codeload.github.com/${owner}/${name}/zip/${encodeURIComponent(safeRef)}`,
    { headers: { 'user-agent': 'instantcms-mcp' }, redirect: 'error' }
  );
  if (!response.ok) throw new Error(`GitHub archive request failed: HTTP ${response.status}`);
  const contentLength = Number(response.headers.get('content-length') ?? 0);
  if (contentLength > 50 * 1024 * 1024) throw new Error('GitHub archive is too large');
  const archive = new Uint8Array(await response.arrayBuffer());
  if (archive.byteLength > 50 * 1024 * 1024) throw new Error('GitHub archive is too large');
  const configured = limits(options);
  const archiveRelativePath = (archivePath: string): string | null => {
    const parts = archivePath.split('/').slice(1);
    if (!parts.length || archivePath.endsWith('/')) return null;
    const path = parts.join('/');
    if (safeSubpath && path !== safeSubpath && !path.startsWith(`${safeSubpath}/`)) return null;
    const relativePath = safeSubpath ? path.slice(safeSubpath.length).replace(/^\//, '') : path;
    if (!relativePath || relativePath.split('/').some(part => ignoredDirectories.has(part)))
      return null;
    return relativePath;
  };
  let projectedFiles = 0;
  let projectedBytes = 0;
  const entries = unzipSync(archive, {
    filter: file => {
      if (!archiveRelativePath(file.name) || file.originalSize > configured.maxFileBytes)
        return false;
      projectedFiles += 1;
      projectedBytes += file.originalSize;
      if (projectedFiles > configured.maxFiles) throw new Error('Project file limit exceeded');
      if (projectedBytes > configured.maxTotalBytes)
        throw new Error('Project total size limit exceeded');
      return true;
    },
  });
  const files: Record<string, string> = {};
  const skipped: Array<{ path: string; reason: string }> = [];
  let totalBytes = 0;

  for (const [archivePath, bytes] of Object.entries(entries)) {
    const relativePath = archiveRelativePath(archivePath);
    if (!relativePath) continue;
    if (!isTextFile(relativePath, bytes)) {
      skipped.push({ path: relativePath, reason: 'binary_or_unsupported' });
      continue;
    }
    if (Object.keys(files).length >= configured.maxFiles)
      throw new Error('Project file limit exceeded');
    totalBytes += bytes.byteLength;
    if (totalBytes > configured.maxTotalBytes) throw new Error('Project total size limit exceeded');
    files[relativePath] = Buffer.from(bytes).toString('utf8');
  }

  return {
    source: 'github' as const,
    repository: `${owner}/${name}`,
    ref: safeRef,
    subpath: safeSubpath,
    files,
    files_loaded: Object.keys(files).length,
    total_bytes: totalBytes,
    skipped,
  };
}
