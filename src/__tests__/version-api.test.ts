import { compareVersionApi } from '../utils/version-api.js';
import { planInstantCmsUpgrade } from '../tools/project-workflow-tool.js';
import { versionApiEvidence } from '../generated/version-api.js';

describe('version API evidence / свидетельства API версий / 版本 API 依据', () => {
  test('snapshots use distinct pinned source commits', () => {
    expect(new Set(versionApiEvidence.snapshots.map(item => item.commit)).size).toBe(4);
  });

  test('detects real hook and method changes with provenance', () => {
    const difference = compareVersionApi('2.16', '2.17');
    expect(difference?.provenance.from.ref).toBe('2.16.3');
    expect(difference?.provenance.to.ref).toBe('2.17.3');
    expect(difference?.hooks.added.map(item => item.name)).toContain('before_render_page');
    expect(difference?.hooks.removed.map(item => item.name)).toContain('captcha_html');
    expect(difference?.methods.added).toEqual(
      expect.arrayContaining([expect.objectContaining({ component: 'cmsCache', name: 'pause' })])
    );
  });

  test('upgrade plan reports changes referenced by project files', () => {
    const project = {
      'system/controllers/demo/actions/index.php':
        "<?php cmsEventsManager::hook('captcha_html', $data); $cache->pause();",
    };
    const result = planInstantCmsUpgrade(project, '2.16', '2.17');
    expect(result.version_api?.hook_changes_in_project.removed.map(item => item.name)).toContain(
      'captcha_html'
    );
    expect(result.version_api?.method_changes_in_project.added).toEqual(
      expect.arrayContaining([expect.objectContaining({ component: 'cmsCache', name: 'pause' })])
    );
    expect(result.version_api?.provenance.from.commit).toMatch(/^[a-f0-9]{40}$/);
  });

  test('unknown versions have no source-backed comparison', () => {
    expect(compareVersionApi('2.15', '2.18.2')).toBeNull();
  });
});
