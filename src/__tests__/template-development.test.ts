import {
  analyzeInstantCmsTemplate,
  checkTemplateOverrideCompatibility,
  scaffoldCompleteTemplate,
  scaffoldTemplateOverride,
  validateLayoutScheme,
} from '../tools/template-development-tool.js';

describe('template development workflows', () => {
  test('scaffolds a complete template and layout scheme', () => {
    const result = scaffoldCompleteTemplate({
      name: 'studio_theme',
      title: 'Studio Theme',
      inherit: ['modern'],
    });
    expect(result.files['manifest.php']).toContain("'inherit' => ['modern']");
    expect(result.files['manifest.php']).toContain("'has_options'                => false");
    expect(result.files['main.tpl.php']).toContain("linkJS('js/main.js')");
    expect(result.files['widgets/wrapper.tpl.php']).toContain('html($widget->title)');
    expect(result.layout_scheme?.summary.positions).toEqual(
      expect.arrayContaining(['header', 'content', 'right-top', 'footer'])
    );
  });

  test('analyzes template structure, positions and overrides', () => {
    const result = analyzeInstantCmsTemplate({
      'manifest.php': '<?php return [];',
      'main.tpl.php': "<?= $this->widgets('header') ?><?= $this->body() ?>",
      'controllers/content/view.tpl.php': "<?= html($item['title']) ?>",
    });
    expect(result.is_valid).toBe(true);
    expect(result.widget_positions).toContain('header');
    expect(result.overrides).toContain('controllers/content/view.tpl.php');
  });

  test('discovers and analyzes a theme inside a complete project map', () => {
    const result = analyzeInstantCmsTemplate({
      'templates/studio_theme/manifest.php': '<?php return [];',
      'templates/studio_theme/main.tpl.php': '<?= $this->body() ?>',
    });
    expect(result.theme).toBe('studio_theme');
    expect(result.is_valid).toBe(true);
  });

  test('requires an explicit selection when a project contains multiple themes', () => {
    const result = analyzeInstantCmsTemplate({
      'templates/first/manifest.php': '<?php return [];',
      'templates/second/manifest.php': '<?php return [];',
    });
    expect(result.is_valid).toBe(false);
    expect(result.diagnostics.some(item => item.code === 'MULTIPLE_TEMPLATES_FOUND')).toBe(true);
  });

  test('creates frontend and backend overrides from an upstream path', () => {
    const result = scaffoldTemplateOverride({
      theme: 'studio_theme',
      source_path: 'templates/modern/controllers/content/backend/items.tpl.php',
      source_content: '<?php echo $this->renderGrid($grid);',
    });
    expect(result.target_path).toBe(
      'templates/studio_theme/controllers/content/backend/items.tpl.php'
    );
    expect(result.files['controllers/content/backend/items.tpl.php']).toBeDefined();
  });

  test('validates layout YAML and reports duplicate positions', () => {
    const result = validateLayoutScheme(
      `layout:\n  rows:\n    - cols:\n        - position: sidebar\n        - position: sidebar\n`
    );
    expect(result.is_valid).toBe(true);
    expect(result.diagnostics.some(item => item.code === 'DUPLICATE_LAYOUT_POSITION')).toBe(true);
    expect(validateLayoutScheme('rows: []').is_valid).toBe(false);
  });

  test('marks an override when its upstream source changed or disappeared', () => {
    const result = checkTemplateOverrideCompatibility(
      {
        'controllers/content/view.tpl.php': 'custom',
        'controllers/users/index.tpl.php': 'custom users',
      },
      {
        'templates/modern/controllers/content/view.tpl.php': 'old',
        'templates/modern/controllers/users/index.tpl.php': 'old users',
      },
      { 'templates/modern/controllers/content/view.tpl.php': 'new' }
    );
    expect(result.requires_review).toBe(2);
    expect(result.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'controllers/content/view.tpl.php',
          status: 'upstream_changed',
        }),
        expect.objectContaining({
          path: 'controllers/users/index.tpl.php',
          status: 'missing_upstream',
        }),
      ])
    );
  });
});
