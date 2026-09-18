interface ScaffoldTestOptions {
  addon_name: string;
  class_name: string;
  class_type: 'model' | 'controller' | 'component' | 'widget';
  methods: string[];
  options?: {
    test_framework?: 'phpunit' | 'codeception';
    mock_db?: boolean;
    mock_cache?: boolean;
  };
}

export function scaffoldTest(opts: ScaffoldTestOptions): object {
  const name = opts.addon_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const Name = opts.class_name || name.split('_').map(capitalize).join('');
  const classType = opts.class_type || 'model';

  const files: Record<string, string> = {};

  if (opts.options?.test_framework === 'codeception') {
    files[`tests/unit/${name}/${Name}Test.php`] = generateCodeceptionTest(
      name,
      Name,
      classType,
      opts.methods,
      opts.options
    );
    files[`tests/unit.suite.yml`] = generateCodeceptionSuite(name);
  } else {
    files[`tests/phpunit/${Name}Test.php`] = generatePhpUnitTest(
      name,
      Name,
      classType,
      opts.methods,
      opts.options
    );
    files[`phpunit.xml`] = generatePhpUnitConfig(name);
  }

  return {
    addon_name: name,
    class_name: Name,
    class_type: classType,
    test_framework: opts.options?.test_framework || 'phpunit',
    files,
    methods_count: opts.methods.length,
    structure_notes: [
      `Тесты: ${Object.keys(files).join(', ')}`,
      `Запуск: ./vendor/bin/phpunit или ./codecept run unit`,
    ],
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generatePhpUnitTest(
  name: string,
  Name: string,
  classType: string,
  methods: string[],
  options?: ScaffoldTestOptions['options']
): string {
  const mockDb = options?.mock_db ?? true;
  const mockCache = options?.mock_cache ?? true;

  let code = `<?php

use PHPUnit\\Framework\\TestCase;

class ${Name}Test extends TestCase {

`;

  if (mockDb) {
    code += `    protected $db;

`;
  }

  if (mockCache) {
    code += `    protected $cache;

`;
  }

  if (mockDb || mockCache) {
    code += `    protected function setUp(): void {
        parent::setUp();
`;
    if (mockDb) {
      code += `        $this->db = $this->createMock(\\icms\\db\\DatabaseConnection::class);
`;
    }
    if (mockCache) {
      code += `        $this->cache = $this->createMock(\\icms\\cache\\Cache::class);
`;
    }
    code += `    }

`;
  }

  if (mockDb) {
    code += `    protected function tearDown(): void {
        unset($this->db);
        parent::tearDown();
    }

`;
  }

  for (const method of methods) {
    code += generateMethodTest(name, Name, classType, method);
  }

  code += `}
`;
  return code;
}

function generateMethodTest(name: string, Name: string, classType: string, method: string): string {
  const methodName = method.replace(/[^a-zA-Z0-9_]/g, '_');
  let code = `
    /**
     * @covers ${Name}::${method}
     */
    public function test${capitalize(methodName)}() {
`;

  switch (classType) {
    case 'model':
      code += `        $model = new model${Name}();
        $this->assertInstanceOf(\\cmsModel::class, $model);
`;
      break;
    case 'controller':
      code += `        $controller = $this->createMock(\\cmsController::class);
        $this->assertInstanceOf(\\cmsController::class, $controller);
`;
      break;
    case 'component':
      code += `        $component = new ${Name}($this->request);
        $this->assertTrue(method_exists($component, '${method}'));
`;
      break;
    case 'widget':
      code += `        $widget = new ${Name}();
        $this->assertInstanceOf(\\cmsWidget::class, $widget);
`;
      break;
    default:
      code += `        // Test for ${classType}::${method}
        $this->assertTrue(true);
`;
  }

  code += `    }

`;
  return code;
}

function generatePhpUnitConfig(name: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         cacheDirectory=".phpunit.cache"
>
    <testsuites>
        <testsuite name="${name}">
            <directory>tests/phpunit</directory>
        </testsuite>
    </testsuites>
    <coverage>
        <include>
            <directory suffix=".php">system/controllers/${name}</directory>
        </include>
    </coverage>
</phpunit>
`;
}

function generateCodeceptionTest(
  name: string,
  Name: string,
  classType: string,
  methods: string[],
  options?: ScaffoldTestOptions['options']
): string {
  const mockDb = options?.mock_db ?? true;

  let code = `<?php

namespace tests\\unit\\${name};

use Codeception\\Test\\Unit;

class ${Name}Test extends Unit {

`;

  if (mockDb) {
    code += `    /** @var \\UnitTester */
    protected $tester;

    protected function _before() {
        parent::_before();
    }

    protected function _after() {
        unset($this->tester);
        parent::_after();
    }

`;
  }

  for (const method of methods) {
    code += `
    /**
     * @covers ${Name}::${method}
     */
    public function test${capitalize(method)}($I) {
        $I->assertTrue(true);
    }
`;
  }

  code += `
}
`;
  return code;
}

function generateCodeceptionSuite(_name: string): string {
  return `actor: UnitTester
modules:
  enabled:
    - Asserts
    - \\Helper\\Unit
`;
}
