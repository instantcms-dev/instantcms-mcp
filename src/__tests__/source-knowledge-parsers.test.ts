import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverHooks, generateHooksSource } from '../tools/parser/hooks-parser.js';
import { generateComponentsSource } from '../tools/parser/components-parser.js';
import { parseEventsFromSql } from '../tools/parser/events-parser.js';
import { parseSqlFile } from '../tools/parser/sql-parser.js';
import { generateControllersMap } from '../tools/parser/controllers-parser.js';

describe('source-backed knowledge parsers', () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'instantcms-knowledge-'));

  beforeAll(() => {
    mkdirSync(join(fixtureRoot, 'system/core'), { recursive: true });
    mkdirSync(join(fixtureRoot, 'system/controllers/demo/actions'), { recursive: true });
    writeFileSync(
      join(fixtureRoot, 'system/controllers/demo/frontend.php'),
      '<?php class demo extends cmsFrontend {}'
    );
    writeFileSync(
      join(fixtureRoot, 'system/controllers/demo/actions/index.php'),
      `<?php class actionDemoIndex extends cmsAction { public function run($page = 1) {} }
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

  test('controller parser / парсер контроллеров / 控制器解析器 finds separate actions', () => {
    const output = join(fixtureRoot, 'controllers-map.ts');
    generateControllersMap(fixtureRoot, output);
    const generated = readFileSync(output, 'utf8');
    expect(generated).toContain('actionDemoIndex');
    expect(generated).toContain('actions/index.php');
  });

  test('SQL parser / парсер SQL / SQL 解析器 retains fields and indexes', () => {
    const source = join(fixtureRoot, 'base.sql');
    writeFileSync(
      source,
      "DROP TABLE IF EXISTS `{#}demo`;\nCREATE TABLE `{#}demo` (\n  `id` int(11) NOT NULL AUTO_INCREMENT,\n  `title` varchar(255) NOT NULL DEFAULT '',\n  PRIMARY KEY (`id`),\n  KEY `title` (`title`)\n) ENGINE=InnoDB;"
    );
    const schema = parseSqlFile(source);
    expect(schema.tables[0].name).toBe('cms_demo');
    expect(schema.tables[0].fields.map(field => field.name)).toEqual(['id', 'title']);
    expect(schema.tables[0].indexes.map(index => index.name)).toEqual(['PRIMARY', 'title']);
  });

  test('event parser / парсер событий / 事件解析器 preserves listener and status', () => {
    const result = parseEventsFromSql(
      "INSERT INTO `{#}events` (`id`, `event`, `listener`, `ordering`, `is_enabled`) VALUES (1, 'demo_after_save', 'demo', 10, 1);"
    );
    expect(result.eventCount).toBe(1);
    expect(result.byEvent.demo_after_save).toMatchObject({ listener: 'demo', isEnabled: true });
  });
});
