import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { zipSync } from 'fflate';
import { loadGithubProject, loadLocalProject } from '../tools/project-source-tool.js';

describe('project sources', () => {
  test('loads local text files while ignoring dependencies and symlinks', async () => {
    const root = await mkdtemp(join(tmpdir(), 'instantcms-mcp-'));
    try {
      await mkdir(join(root, 'system/controllers/demo'), { recursive: true });
      await mkdir(join(root, 'node_modules/pkg'), { recursive: true });
      await writeFile(join(root, 'system/controllers/demo/frontend.php'), '<?php');
      await writeFile(join(root, 'node_modules/pkg/index.js'), 'ignored');
      await symlink(join(root, 'system/controllers/demo/frontend.php'), join(root, 'linked.php'));
      const result = await loadLocalProject(root);
      expect(result.files).toEqual({ 'system/controllers/demo/frontend.php': '<?php' });
      expect(result.skipped).toContainEqual({ path: 'linked.php', reason: 'symbolic_link' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test('loads a selected directory from a GitHub archive', async () => {
    const archive = zipSync({
      'repo-main/addons/demo/manifest.xml': new TextEncoder().encode('<component/>'),
      'repo-main/README.md': new TextEncoder().encode('ignored'),
    });
    const originalFetch = global.fetch;
    global.fetch = jest.fn(async () => new Response(archive, { status: 200 })) as typeof fetch;
    try {
      const result = await loadGithubProject('owner/repo', 'main', 'addons/demo');
      expect(result.files).toEqual({ 'manifest.xml': '<component/>' });
      expect(global.fetch).toHaveBeenCalledWith(
        'https://codeload.github.com/owner/repo/zip/main',
        expect.objectContaining({ redirect: 'error' })
      );
    } finally {
      global.fetch = originalFetch;
    }
  });

  test('rejects invalid GitHub repository input', async () => {
    await expect(loadGithubProject('https://example.com/owner/repo')).rejects.toThrow(
      'Repository must be owner/name'
    );
  });
});
