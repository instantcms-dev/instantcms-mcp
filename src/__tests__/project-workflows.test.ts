import {
  auditInstantCmsProject,
  explainInstantCmsProject,
  planInstantCmsUpgrade,
  planProjectChanges,
  repairInstantCmsProject,
} from '../tools/project-workflow-tool.js';

const files = {
  'system/controllers/demo/manifest.xml':
    '<component><name>demo</name><title>Demo</title></component>',
  'system/controllers/demo/frontend.php': '<?php class demo extends cmsFrontend {}',
  'system/controllers/demo/languages/ru/demo.php': '<?php define("LANG_DEMO", "Demo");',
  'system/controllers/demo/actions/index.php': '<?php echo $title;',
};

describe('project agent workflows', () => {
  test('audits structure, syntax and suspicious output', () => {
    const result = auditInstantCmsProject(files);
    expect(result.kind).toBe('addon');
    expect(result.diagnostics.some(item => item.code === 'MISPLACED_LANGUAGE_FILE')).toBe(true);
    expect(result.diagnostics.some(item => item.code === 'POSSIBLE_UNESCAPED_OUTPUT')).toBe(true);
  });

  test('plans before applying only safe repairs', () => {
    const plan = planProjectChanges(files);
    expect(plan.safe_operations).toBe(1);
    const repaired = repairInstantCmsProject(files);
    expect(repaired.applied).toHaveLength(1);
    expect(repaired.files['system/languages/ru/controllers/demo/demo.php']).toBeDefined();
    expect(repaired.files['system/controllers/demo/languages/ru/demo.php']).toBeUndefined();
  });

  test('explains project and creates an upgrade checklist', () => {
    expect(explainInstantCmsProject(files).controllers).toContain('demo');
    const upgrade = planInstantCmsUpgrade(files, '2.17', '2.18.2');
    expect(upgrade.comparison.to?.version).toBe('2.18.2');
    expect(upgrade.checklist.length).toBeGreaterThan(2);
  });
});
