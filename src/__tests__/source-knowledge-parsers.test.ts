import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverHooks, generateHooksSource } from '../tools/parser/hooks-parser.js';
import { generateComponentsSource } from '../tools/parser/components-parser.js';

describe('source-backed knowledge parsers', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'instantcms-knowledge-'));

  beforeAll(() => {
    mkdirSync(join(fixtureRoot, 'system/core'), { recursive: true });
    mkdirSync(join(fixtureRoot, 'system/controllers/demo/actions'), { recursive: true });
    writeFileSync(
      join(fixtureRoot, 'system/controllers/demo/actions/index.php'),
      `<?php
$data = cmsEventsManager::hook('demo_before_save', [$item, $user]);
cmsEventsManager::hookAll('demo_after_save', $item);
$controller->runHook('demo_before_save', [$item]);`
    );
    writeFileSync(
      join(fixtureRoot, 'system/core/demo.php'),
      `<?php
/** Demo API */
class cmsDemo {
    /** @return string */
    public function hello(string $name) { return $name; }
    protected function hidden() {}
}`
    );
  });

  afterAll(() => rmSync(fixtureRoot, { recursive: true, force: true }));

  test('discovers, merges and sorts literal hook calls', () => {
    const hooks = discoverHooks(fixtureRoot);
    expect(hooks.map(hook => hook.name)).toEqual(['demo_after_save', 'demo_before_save']);
    expect(hooks.find(hook => hook.name === 'demo_before_save')).toMatchObject({
      inferredType: 'filter',
      occurrences: 2,
      parameters: ['$item', '$user'],
    });
    expect(generateHooksSource(fixtureRoot)).toContain('system/controllers/demo/actions/index.php');
  });

  test('exports public core methods and excludes protected methods', () => {
    const generated = generateComponentsSource(fixtureRoot);
    expect(generated).toContain('cmsDemo');
    expect(generated).toContain('hello');
    expect(generated).not.toContain('hidden');
  });
});
