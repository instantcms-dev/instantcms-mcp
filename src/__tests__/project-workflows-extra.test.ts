import * as fc from 'fast-check';
import {
  auditInstantCmsProject,
  explainInstantCmsProject,
  planInstantCmsUpgrade,
  planProjectChanges,
  repairInstantCmsProject,
} from '../tools/project-workflow-tool.js';
import { scaffoldAddon } from '../tools/scaffold-tool.js';

function validAddonFiles(): Record<string, string> {
  return (
    scaffoldAddon({ name: 'wfextest', title: 'WF', type: 'basic' }) as {
      files: Record<string, string>;
    }
  ).files;
}

describe('project workflows (extended)', () => {
  test('audit: пустой file-map → is_valid=true, 0 errors', () => {
    const audit = auditInstantCmsProject({}) as {
      is_valid: boolean;
      summary: { errors: number; warnings: number };
    };
    expect(audit.is_valid).toBe(true);
    expect(audit.summary.errors).toBe(0);
  });

  test('audit: scaffoldAddon basic → is_valid=true', () => {
    const audit = auditInstantCmsProject(validAddonFiles()) as {
      is_valid: boolean;
      kind: string;
    };
    expect(audit.kind).toBe('addon');
    expect(audit.is_valid).toBe(true);
  });

  test('audit: cmsGrid (legacy class) → LEGACY_CMSGRID_CLASS error', () => {
    const files = {
      'package/system/controllers/wfextest/manifest.xml': '<addon/>',
      'package/system/controllers/wfextest/grids/old.php': '<?php class custom extends cmsGrid {}',
    };
    const audit = auditInstantCmsProject(files) as {
      diagnostics: Array<{ code: string; severity: string }>;
    };
    const legacy = audit.diagnostics.filter(d => d.code === 'LEGACY_CMSGRID_CLASS');
    expect(legacy.length).toBe(1);
    expect(legacy[0].severity).toBe('error');
  });

  test('audit: PHP with ->query($var) → POSSIBLE_SQL_INTERPOLATION warning', () => {
    const sql = ['<?php ', '$db->query("SELECT * FROM x WHERE id = ', '$id");'].join('$');
    const files = {
      'src/danger.php': sql,
    };
    const audit = auditInstantCmsProject(files) as {
      diagnostics: Array<{ code: string; severity: string }>;
    };
    const found = audit.diagnostics.filter(d => d.code === 'POSSIBLE_SQL_INTERPOLATION');
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0].severity).toBe('warning');
  });

  test('audit: echo $_GET → POSSIBLE_UNESCAPED_OUTPUT warning (просто $var; форма)', () => {
    // Текущий регексп ловит только echo $VAR; без обращения к элементам массива.
    // Это известное ограничение детектора — фиксируем, чтобы регрессия была видна.
    const php = '<?php echo $_GET;';
    const files = {
      'src/danger.php': php,
    };
    const audit = auditInstantCmsProject(files) as {
      diagnostics: Array<{ code: string; severity: string }>;
    };
    const out = audit.diagnostics.filter(d => d.code === 'POSSIBLE_UNESCAPED_OUTPUT');
    expect(out.length).toBeGreaterThanOrEqual(1);
    expect(out[0].severity).toBe('warning');
  });

  test('repair: MISPLACED_LANGUAGE_FILE перемещается на правильный путь', () => {
    const files = validAddonFiles();
    files['package/system/controllers/wfextest/languages/ru/lang.php'] = '<?php // misplaced';
    const result = repairInstantCmsProject(files) as {
      files: Record<string, string>;
      applied: Array<{ kind: string; path: string; target?: string }>;
      patch: { patch: string };
      remaining: { diagnostics: Array<{ code: string }> };
    };
    expect(result.applied).toHaveLength(1);
    expect(result.applied[0].kind).toBe('move');
    expect(result.applied[0].target).toBe(
      'package/system/languages/ru/controllers/wfextest/lang.php'
    );
    expect(result.files['package/system/languages/ru/controllers/wfextest/lang.php']).toBeDefined();
    expect(
      result.files['package/system/controllers/wfextest/languages/ru/lang.php']
    ).toBeUndefined();
    expect(result.patch.patch).toContain('rename from');
    const remaining = result.remaining.diagnostics.filter(
      d => d.code === 'MISPLACED_LANGUAGE_FILE'
    );
    expect(remaining).toHaveLength(0);
  });

  test('repair идемпотентен: повторный вызов не меняет files', () => {
    const files = validAddonFiles();
    files['package/system/controllers/wfextest/languages/ru/lang.php'] = '<?php // misplaced';
    const first = repairInstantCmsProject(files) as { files: Record<string, string> };
    const second = repairInstantCmsProject(first.files) as {
      files: Record<string, string>;
      applied: unknown[];
    };
    expect(second.applied).toHaveLength(0);
    expect(Object.keys(second.files).sort()).toEqual(Object.keys(first.files).sort());
  });

  test('repair не применяет UNSAFE операции (cmsGrid class, SQL interpolation)', () => {
    const files = {
      'package/system/controllers/demo/grids/old.php': '<?php class custom extends cmsGrid {}',
      'src/danger.php': '<?php $db->query("...$id");',
    };
    const result = repairInstantCmsProject(files) as { applied: unknown[] };
    expect(result.applied).toHaveLength(0);
  });

  test('explain: считает controllers, hooks, actions, forms', () => {
    const files = validAddonFiles();
    files['package/system/controllers/wfextest/hooks/sample.php'] = '<?php';
    files['package/system/controllers/wfextest/actions/test.php'] = '<?php';
    files['package/system/controllers/wfextest/forms/sample.php'] = '<?php';
    const explanation = explainInstantCmsProject(files) as {
      controllers: string[];
      hooks: string[];
      actions: string[];
      forms: string[];
    };
    expect(explanation.controllers).toContain('wfextest');
    expect(explanation.hooks.length).toBeGreaterThanOrEqual(1);
    expect(explanation.actions.length).toBeGreaterThanOrEqual(1);
    expect(explanation.forms.length).toBeGreaterThanOrEqual(1);
  });

  test('plan: возвращает операции с правильными kind', () => {
    const files = {
      'package/system/controllers/foo/languages/ru/lang.php': '<?php',
    };
    const plan = planProjectChanges(files) as {
      operations: Array<{ kind: string; safe: boolean; target?: string }>;
    };
    expect(plan.operations.length).toBe(1);
    expect(plan.operations[0].kind).toBe('move');
    expect(plan.operations[0].safe).toBe(true);
    expect(plan.operations[0].target).toBe('package/system/languages/ru/controllers/foo/lang.php');
  });

  test('upgrade: known версии (2.17 → 2.18.2) — checklist не пустой', () => {
    const result = planInstantCmsUpgrade({}, '2.17', '2.18.2') as {
      checklist: string[];
      from: string;
      to: string;
    };
    expect(result.checklist.length).toBeGreaterThan(0);
    expect(result.from).toBe('2.17');
    expect(result.to).toBe('2.18.2');
  });

  test('upgrade: unknown версия → warnings присутствуют', () => {
    const result = planInstantCmsUpgrade({}, '99.99.99', '2.18.2') as {
      comparison: { warnings?: string[] };
    };
    expect(result.comparison.warnings).toBeDefined();
  });

  test('property-based: для произвольного набора PHP files → diagnostics всегда массив', () => {
    const safePath = fc
      .stringMatching(/^[a-z][a-z0-9_]{0,15}(\/[a-z0-9_]{0,15})*$/)
      .filter(s => s.length > 0);
    fc.assert(
      fc.property(fc.dictionary(safePath, fc.string({ maxLength: 500 }), { maxKeys: 5 }), files => {
        const audit = auditInstantCmsProject(files) as { diagnostics: unknown[] };
        expect(Array.isArray(audit.diagnostics)).toBe(true);
        return true;
      }),
      { numRuns: 20 }
    );
  });

  test('property-based: repair не выбрасывает на корректных путях', () => {
    const safePath = fc
      .stringMatching(/^[a-z][a-z0-9_]{0,15}(\/[a-z0-9_]{0,15})*$/)
      .filter(s => s.length > 0);
    fc.assert(
      fc.property(fc.dictionary(safePath, fc.string({ maxLength: 200 }), { maxKeys: 5 }), files => {
        const result = repairInstantCmsProject(files) as { files: Record<string, string> };
        expect(typeof result.files).toBe('object');
        return true;
      }),
      { numRuns: 20 }
    );
  });
});
