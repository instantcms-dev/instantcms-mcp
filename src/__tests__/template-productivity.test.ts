import {
  auditTemplateFrontend,
  auditTemplateWidgetPositions,
  extractTemplateDesignTokens,
  mergeTemplateOverrides,
  scaffoldTemplateE2eEnvironment,
  indexUpstreamTemplateSources,
  scaffoldTemplatePhpQuality,
} from '../tools/template-productivity-tool.js';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';

describe('template productivity workflows', () => {
  test('updates untouched overrides and returns a patch', () => {
    const result = mergeTemplateOverrides(
      { 'controllers/content/view.tpl.php': 'old upstream' },
      { 'templates/modern/controllers/content/view.tpl.php': 'old upstream' },
      { 'templates/modern/controllers/content/view.tpl.php': 'new upstream' }
    );
    expect(result.files['controllers/content/view.tpl.php']).toBe('new upstream');
    expect(result.summary.auto_merged).toBe(1);
    expect(result.patch.patch).toContain('+new upstream');
  });

  test('preserves customized overrides and reports a conflict', () => {
    const result = mergeTemplateOverrides(
      { 'controllers/content/view.tpl.php': 'custom theme' },
      { 'controllers/content/view.tpl.php': 'old upstream' },
      { 'controllers/content/view.tpl.php': 'new upstream' }
    );
    expect(result.files['controllers/content/view.tpl.php']).toBe('custom theme');
    expect(result.summary.conflicts).toBe(1);
    expect(result.patch.is_empty).toBe(true);
  });

  test('applies one unambiguous upstream delta to a customized override', () => {
    const result = mergeTemplateOverrides(
      { 'controllers/content/view.tpl.php': 'custom header\nold block\ncustom footer' },
      { 'controllers/content/view.tpl.php': 'base header\nold block\nbase footer' },
      { 'controllers/content/view.tpl.php': 'base header\nnew block\nbase footer' }
    );
    expect(result.files['controllers/content/view.tpl.php']).toBe(
      'custom header\nnew block\ncustom footer'
    );
    expect(result.results[0].status).toBe('upstream_delta_applied');
  });

  test('reports accessibility and HTML quality issues', () => {
    const result = auditTemplateFrontend({
      'main.tpl.php':
        '<html><h1>Title</h1><h3>Section</h3><img src="a.jpg"><a target="_blank">x</a><div id="same"></div><div id="same"></div></html>',
    });
    expect(result.is_valid).toBe(false);
    expect(result.diagnostics.map(item => item.code)).toEqual(
      expect.arrayContaining([
        'IMAGE_MISSING_ALT',
        'UNSAFE_BLANK_TARGET',
        'DUPLICATE_HTML_ID',
        'SKIPPED_HEADING_LEVEL',
        'HTML_LANG_MISSING',
      ])
    );
  });

  test('extracts repeated design values and existing custom properties', () => {
    const result = extractTemplateDesignTokens({
      'css/main.css':
        ':root{--brand:#123456}.a{color:#123456;padding:1rem}.b{color:#123456;gap:1rem}',
    });
    expect(result.existing_custom_properties['--brand']).toBe('#123456');
    expect(result.colors[0]).toEqual({ value: '#123456', uses: 3 });
    expect(result.suggested_tokens_css).toContain('--space-1: 1rem');
  });

  test('compares rendered, guarded and layout widget positions', () => {
    const result = auditTemplateWidgetPositions({
      'main.tpl.php':
        "<?= $this->widgets('header') ?><?= $this->widgets('sidebar') ?><?= $this->hasWidgetsOn('sidebar') ?>",
      'layout.yaml':
        'layout:\n  rows:\n    - cols:\n        - position: header\n        - position: footer\n',
    });
    expect(result.layout_not_rendered).toContain('footer');
    expect(result.rendered_not_in_layout).toContain('sidebar');
    expect(result.unguarded_positions).toContain('header');
  });

  test('scaffolds reproducible Docker and Playwright visual tests', () => {
    const result = scaffoldTemplateE2eEnvironment({ theme: 'studio_theme' });
    expect(result.files['template-e2e/compose.yaml']).toContain('mcr.microsoft.com/playwright');
    expect(result.files['template-e2e/tests/template.spec.mjs']).toContain('toHaveScreenshot');
    expect(result.files['template-e2e/php/Dockerfile']).toContain('docker-php-ext-install');
    expect(parse(result.files['template-e2e/compose.yaml']).services.visual.image).toContain(
      'playwright'
    );
    for (const path of [
      'template-e2e/playwright.config.mjs',
      'template-e2e/tests/template.spec.mjs',
    ] as const) {
      const syntax = spawnSync(process.execPath, ['--input-type=module', '--check', '-'], {
        input: result.files[path],
        encoding: 'utf8',
      });
      expect(syntax.status).toBe(0);
    }
  });

  test('indexes upstream templates with reproducible provenance', () => {
    const result = indexUpstreamTemplateSources(
      { 'templates/modern/controllers/content/view.tpl.php': '<?php echo 1;' },
      { repository: 'instantsoft/icms2', ref: 'abc123' }
    );
    expect(result.files_indexed).toBe(1);
    expect(result.templates[0]).toEqual(
      expect.objectContaining({
        controller: 'content',
        action: 'view',
        sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      })
    );
    expect(result.templates[0].source_url).toContain('/blob/abc123/');
  });

  test('scaffolds PHP static-analysis configuration', () => {
    const result = scaffoldTemplatePhpQuality({ theme: 'studio_theme', php_min: '7.2' });
    expect(JSON.parse(result.files['composer.quality.json'])['require-dev']).toHaveProperty(
      'phpstan/phpstan'
    );
    expect(result.files['phpcs.xml']).toContain('PHPCompatibility');
    expect(result.files['phpstan.neon']).toContain('templates/studio_theme');
  });
});
