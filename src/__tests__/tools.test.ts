import { listHooks, getHookDetails, searchHooks } from '../tools/hooks-tool';
import {
  getAddonStructure,
  getComponentApi,
  listComponents,
  validateAddon,
  getFieldTypes,
  getCodeExample,
} from '../tools/addon-tool';
import { scaffoldAddon, scaffoldTemplate } from '../tools/scaffold-tool';
import { scaffoldCrud } from '../tools/crud-tool';
import { scaffoldForm } from '../tools/form-tool';
import { scaffoldGrid } from '../tools/grid-tool';
import { scaffoldApi } from '../tools/api-tool';
import { scaffoldTest } from '../tools/test-tool';
import { scaffoldEmail } from '../tools/email-tool';
import { scaffoldLayoutOverride } from '../tools/layout-override-tool';
import { scaffoldAdminPartial } from '../tools/admin-partial-tool';
import { listTemplateOverrides, getTemplateOverrideInfo } from '../tools/template-overrides-tool';
import { scaffoldCron } from '../tools/cron-tool';
import { scaffoldPermission } from '../tools/permission-tool';
import { scaffoldFilter } from '../tools/filter-tool';
import { scaffoldSeo } from '../tools/seo-tool';
import { scaffoldImportExport } from '../tools/import-export-tool';
import { scaffoldCache } from '../tools/cache-tool';
import { scaffoldWebhook } from '../tools/webhook-tool';
import { scaffoldExternalApi } from '../tools/external-api-tool';
import { scaffoldOAuth } from '../tools/oauth-tool';
import { scaffoldComponent } from '../tools/component-tool';
import { scaffoldWidget } from '../tools/widget-tool';
import { scaffoldTemplate as scaffoldTheme } from '../tools/template-tool';
import { scaffoldLayoutScheme, listLayoutPresets } from '../tools/layout-tool';
import {
  introspectDatabase,
  listContentTypes,
  listDatabaseEvents,
  describeTable,
} from '../tools/db-tool';
import {
  analyzeController,
  listControllers,
  getControllerActionsList,
  listSystemTraits,
} from '../tools/controllers-tool';
import {
  listWidgets,
  getWidgetInfo,
  listTraits,
  getTraitInfo,
  listFields,
  getFieldInfo,
} from '../tools/source-tool';
import { generateMigration, generateFieldSuggestions } from '../tools/migration-tool';
import { analyzeRequirement, suggestAddonStructure } from '../tools/requirement-tool';

describe('Hooks Tool', () => {
  test('listHooks returns array', () => {
    const result = listHooks() as any;
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('hooks');
    expect(Array.isArray(result.hooks)).toBe(true);
  });

  test('listHooks with category filter', () => {
    const result = listHooks('content') as any;
    expect(result.total).toBeGreaterThan(0);
    result.hooks.forEach((hook: any) => {
      expect(hook.category).toBe('content');
    });
  });

  test('getHookDetails returns hook details', () => {
    const result = getHookDetails('content_after_add_approve') as any;
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('example');
  });

  test('getHookDetails returns error for unknown hook', () => {
    const result = getHookDetails('unknown_hook_xyz') as any;
    expect(result).toHaveProperty('error');
  });

  test('searchHooks returns matching hooks', () => {
    const result = searchHooks('user registered') as any;
    expect(result).toHaveProperty('results');
  });
});

describe('Addon Tool', () => {
  test('getAddonStructure returns structure', () => {
    const result = getAddonStructure('basic') as any;
    expect(result).toHaveProperty('type', 'basic');
    expect(result).toHaveProperty('files');
    expect(Array.isArray(result.files)).toBe(true);
  });

  test('getAddonStructure returns error for unknown type', () => {
    const result = getAddonStructure('unknown' as any) as any;
    expect(result).toHaveProperty('error');
  });

  test('getComponentApi returns component info', () => {
    const result = getComponentApi('cmsModel') as any;
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('methods');
    expect(Array.isArray(result.methods)).toBe(true);
  });

  test('getComponentApi returns error for unknown component', () => {
    const result = getComponentApi('unknownComponent') as any;
    expect(result).toHaveProperty('error');
  });

  test('listComponents returns array', () => {
    const result = listComponents() as any;
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThan(0);
    expect(result).toHaveProperty('components');
  });

  test('validateAddon detects missing manifest.xml', () => {
    const result = validateAddon({ 'frontend.php': 'test' }) as any;
    expect(result.is_valid).toBe(false);
    expect(result.errors).toContain('Отсутствует обязательный файл: manifest.xml');
  });

  test('validateAddon passes valid addon', () => {
    const result = validateAddon({
      'manifest.xml': '<addon><name>test</name><title>Test</title><version>1.0</version></addon>',
      'install.php': 'class installerTest extends cmsInstaller { public function install() {} }',
      'uninstall.php':
        'class uninstallerTest extends cmsInstaller { public function uninstall() {} }',
      'frontend.php': 'class test extends cmsFrontend { public function actionIndex() {} }',
    }) as any;
    expect(result.is_valid).toBe(true);
  });

  test('getFieldTypes returns all types', () => {
    const result = getFieldTypes() as any;
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThan(0);
    expect(result).toHaveProperty('field_types');
  });

  test('getFieldTypes returns specific type', () => {
    const result = getFieldTypes('fieldString') as any;
    expect(result).toHaveProperty('name', 'fieldString');
  });

  test('getCodeExample returns examples', () => {
    const result = getCodeExample('список') as any;
    expect(result).toHaveProperty('found');
    expect(result.found).toBeGreaterThan(0);
    expect(result).toHaveProperty('examples');
  });

  test('getCodeExample returns tip for unknown task', () => {
    const result = getCodeExample('xyz_unknown_task_123') as any;
    expect(result).toHaveProperty('available_topics');
  });
});

describe('Scaffold Tool', () => {
  test('scaffoldAddon generates files', () => {
    const result = scaffoldAddon({ name: 'test_addon', title: 'Test Addon', type: 'basic' }) as any;
    expect(result).toHaveProperty('files');
    expect(Object.keys(result.files).length).toBeGreaterThan(0);
  });

  test('scaffoldAddon with_hooks generates hooks', () => {
    const result = scaffoldAddon({
      name: 'test_addon',
      title: 'Test',
      type: 'with_hooks',
      hooks: ['content_after_add_approve'],
    }) as any;
    const hookContent = JSON.stringify(result.files);
    expect(hookContent).toContain('content_after_add_approve');
  });

  test('scaffoldTemplate generates template files', () => {
    const result = scaffoldTemplate({ name: 'test_theme', title: 'Test Theme' }) as any;
    expect(result).toHaveProperty('files');
    expect(Object.keys(result.files).length).toBeGreaterThan(0);
  });
});

describe('CRUD Tool', () => {
  test('scaffoldCrud generates basic CRUD files', () => {
    const result = scaffoldCrud({
      addon_name: 'test_crud',
      fields: [
        { name: 'title', type: 'varchar', title: 'Заголовок' },
        { name: 'description', type: 'text', title: 'Описание' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_crud');
    expect(result).toHaveProperty('files');
    expect('package/system/controllers/test_crud/model.php' in result.files).toBe(true);
    expect('package/system/controllers/test_crud/frontend.php' in result.files).toBe(true);
    expect('package/system/controllers/test_crud/actions/index.php' in result.files).toBe(true);
    expect('package/system/controllers/test_crud/actions/view.php' in result.files).toBe(true);
  });

  test('scaffoldCrud generates backend files', () => {
    const result = scaffoldCrud({
      addon_name: 'test_crud',
      fields: [{ name: 'title', type: 'varchar', title: 'Заголовок' }],
    }) as any;
    expect('package/system/controllers/test_crud/backend.php' in result.files).toBe(true);
    expect('package/system/controllers/test_crud/backend/actions/index.php' in result.files).toBe(
      true
    );
    expect('package/system/controllers/test_crud/backend/actions/items.php' in result.files).toBe(
      true
    );
    expect(
      'package/system/controllers/test_crud/backend/grids/grid_items.php' in result.files
    ).toBe(true);
  });

  test('scaffoldCrud generates form files', () => {
    const result = scaffoldCrud({
      addon_name: 'test_crud',
      fields: [
        { name: 'title', type: 'varchar', title: 'Заголовок' },
        { name: 'content', type: 'html', title: 'Контент' },
      ],
    }) as any;
    const formContent =
      result.files['package/system/controllers/test_crud/backend/forms/form_item.php'];
    expect(formContent).toContain('fieldString');
    expect(formContent).toContain('fieldHtml');
  });

  test('scaffoldCrud generates language file', () => {
    const result = scaffoldCrud({
      addon_name: 'test_crud',
      fields: [{ name: 'title', type: 'varchar', title: 'Заголовок' }],
    }) as any;
    const langContent =
      result.files['package/system/languages/ru/controllers/test_crud/test_crud.php'];
    expect(langContent).toContain('LANG_TEST_CRUD_TITLE');
  });

  test('scaffoldCrud with category option', () => {
    const result = scaffoldCrud({
      addon_name: 'test_crud',
      fields: [{ name: 'title', type: 'varchar', title: 'Заголовок' }],
      options: { use_category: true },
    }) as any;
    expect('package/system/controllers/test_crud/actions/category.php' in result.files).toBe(true);
  });

  test('scaffoldCrud includes all CRUD actions', () => {
    const result = scaffoldCrud({
      addon_name: 'my_crud',
      fields: [{ name: 'title', type: 'varchar', title: 'Title' }],
    }) as any;
    const files = result.files;
    expect('package/system/controllers/my_crud/actions/add.php' in files).toBe(true);
    expect('package/system/controllers/my_crud/actions/edit.php' in files).toBe(true);
    expect('package/system/controllers/my_crud/actions/delete.php' in files).toBe(true);
  });
});

describe('Form Tool', () => {
  test('scaffoldForm generates basic form', () => {
    const result = scaffoldForm({
      addon_name: 'test_form',
      form_name: 'item',
      fields: [
        { name: 'title', type: 'varchar', title: 'Заголовок' },
        { name: 'content', type: 'text', title: 'Контент' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_form');
    expect(result).toHaveProperty('form_name', 'item');
    expect(result).toHaveProperty('form_class', 'formTestFormItem');
    expect('package/system/controllers/test_form/backend/forms/form_item.php' in result.files).toBe(
      true
    );
  });

  test('scaffoldForm generates correct field classes', () => {
    const result = scaffoldForm({
      addon_name: 'test_form',
      form_name: 'item',
      fields: [
        { name: 'title', type: 'varchar', title: 'Title' },
        { name: 'body', type: 'html', title: 'Body' },
        { name: 'price', type: 'decimal', title: 'Price' },
        { name: 'is_active', type: 'checkbox', title: 'Active' },
        { name: 'published_at', type: 'date', title: 'Date' },
      ],
    }) as any;
    const formContent =
      result.files['package/system/controllers/test_form/backend/forms/form_item.php'];
    expect(formContent).toContain('fieldString');
    expect(formContent).toContain('fieldHtml');
    expect(formContent).toContain('fieldNumber');
    expect(formContent).toContain('fieldCheckbox');
    expect(formContent).toContain('fieldDate');
  });

  test('scaffoldForm with tabs option', () => {
    const result = scaffoldForm({
      addon_name: 'test_form',
      form_name: 'item',
      fields: [
        { name: 'title', type: 'varchar', title: 'Title' },
        { name: 'content', type: 'text', title: 'Content' },
      ],
      options: { use_tabs: true },
    }) as any;
    const formContent =
      result.files['package/system/controllers/test_form/backend/forms/form_item.php'];
    expect(formContent).toContain("'basic'");
  });

  test('scaffoldForm with separate save', () => {
    const result = scaffoldForm({
      addon_name: 'test_form',
      form_name: 'item',
      fields: [{ name: 'title', type: 'varchar', title: 'Title' }],
      options: { use_separate_save: true },
    }) as any;
    expect(
      'package/system/controllers/test_form/backend/forms/form_item_save.php' in result.files
    ).toBe(true);
  });

  test('scaffoldForm returns correct field info', () => {
    const result = scaffoldForm({
      addon_name: 'test_form',
      form_name: 'item',
      fields: [
        { name: 'title', type: 'varchar' },
        { name: 'image', type: 'image' },
      ],
    }) as any;
    expect(result.form_fields).toHaveLength(2);
    expect(result.form_fields[0]).toEqual({ name: 'title', type: 'varchar', class: 'fieldString' });
    expect(result.form_fields[1]).toEqual({ name: 'image', type: 'image', class: 'fieldImage' });
  });
});

describe('Grid Tool', () => {
  test('scaffoldGrid generates grid file', () => {
    const result = scaffoldGrid({
      addon_name: 'test_grid',
      grid_name: 'items',
      columns: [
        { name: 'id', title: 'ID', width: 60 },
        {
          name: 'title',
          title: 'Title',
          filter: 'like',
          href: "href_to($controller->root_url, 'items', ['edit', '{id}'])",
        },
        { name: 'date_pub', title: 'Date', width: 150, filter: 'date' },
        { name: 'is_pub', title: 'Published', width: 80, flag: true },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_grid');
    expect(result).toHaveProperty('grid_name', 'items');
    expect(result).toHaveProperty('function_name', 'grid_items');
    expect(
      'package/system/controllers/test_grid/backend/grids/grid_items.php' in result.files
    ).toBe(true);
  });

  test('scaffoldGrid with default columns', () => {
    const result = scaffoldGrid({
      addon_name: 'test_grid',
      grid_name: 'items',
      columns: [{ name: 'title', title: 'Title' }],
    }) as any;
    const gridContent =
      result.files['package/system/controllers/test_grid/backend/grids/grid_items.php'];
    expect(gridContent).toContain('function grid_items');
    expect(gridContent).toContain("'is_sortable'");
    expect(gridContent).toContain("'is_filter'");
  });

  test('scaffoldGrid with draggable option', () => {
    const result = scaffoldGrid({
      addon_name: 'test_grid',
      grid_name: 'items',
      columns: [{ name: 'title', title: 'Title' }],
      options: { is_draggable: true },
    }) as any;
    const gridContent =
      result.files['package/system/controllers/test_grid/backend/grids/grid_items.php'];
    expect(gridContent).toContain("'is_draggable'  => true");
  });

  test('scaffoldGrid with custom actions', () => {
    const result = scaffoldGrid({
      addon_name: 'test_grid',
      grid_name: 'items',
      columns: [{ name: 'title', title: 'Title' }],
      actions: [
        { title: 'VIEW', href: "href_to('test_grid', '{id}')", icon: 'eye' },
        {
          title: 'EDIT',
          href: "href_to($controller->root_url, 'items', ['edit', '{id}'])",
          icon: 'pen',
        },
      ],
    }) as any;
    const gridContent =
      result.files['package/system/controllers/test_grid/backend/grids/grid_items.php'];
    expect(gridContent).toContain('LANG_VIEW');
    expect(gridContent).toContain('LANG_EDIT');
  });

  test('scaffoldGrid returns correct structure', () => {
    const result = scaffoldGrid({
      addon_name: 'test_grid',
      grid_name: 'items',
      columns: [
        { name: 'title', title: 'Title' },
        { name: 'is_pub', title: 'Published', flag: true },
      ],
      options: { is_sortable: false, is_filter: false },
    }) as any;
    expect(result.columns_count).toBe(2);
    expect(result.options.is_sortable).toBe(false);
    expect(result.options.is_filter).toBe(false);
  });
});

describe('API Tool', () => {
  test('scaffoldApi generates API controller', () => {
    const result = scaffoldApi({
      addon_name: 'test_api',
      version: 'v1',
      endpoints: [
        { name: 'list', method: 'GET', path: '/list', description: 'Get list' },
        { name: 'get', method: 'GET', path: '/{id}', description: 'Get one' },
        { name: 'create', method: 'POST', path: '/', description: 'Create' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_api');
    expect(result).toHaveProperty('api_version', 'v1');
    expect(result).toHaveProperty('endpoints_count', 3);
    expect('package/system/controllers/test_api/api/v1/index.php' in result.files).toBe(true);
  });

  test('scaffoldApi with swagger', () => {
    const result = scaffoldApi({
      addon_name: 'test_api',
      version: 'v1',
      endpoints: [{ name: 'list', method: 'GET', path: '/list' }],
      options: { use_swagger: true },
    }) as any;
    expect('package/docs/openapi.json' in result.files).toBe(true);
  });

  test('scaffoldApi returns correct endpoint info', () => {
    const result = scaffoldApi({
      addon_name: 'test_api',
      version: 'v1',
      endpoints: [{ name: 'list', method: 'GET', path: '/list', auth_required: false }],
    }) as any;
    expect(result.endpoints[0]).toEqual({
      method: 'GET',
      path: '/api/v1/test_api/list',
      name: 'list',
      auth_required: false,
    });
  });

  test('scaffoldApi generates GET handler', () => {
    const result = scaffoldApi({
      addon_name: 'test_api',
      endpoints: [{ name: 'list', method: 'GET', path: '/list' }],
    }) as any;
    const apiContent = result.files['package/system/controllers/test_api/api/v1/index.php'];
    expect(apiContent).toContain('function run()');
    expect(apiContent).toContain('checkAuth');
  });

  test('scaffoldApi generates POST handler', () => {
    const result = scaffoldApi({
      addon_name: 'test_api',
      endpoints: [{ name: 'create', method: 'POST', path: '/' }],
    }) as any;
    const apiContent = result.files['package/system/controllers/test_api/api/v1/index.php'];
    expect(apiContent).toContain('addTest_api');
  });
});

describe('Test Tool', () => {
  test('scaffoldTest generates phpunit test', () => {
    const result = scaffoldTest({
      addon_name: 'test_addon',
      class_name: 'TestAddon',
      class_type: 'model',
      methods: ['getItem', 'getList', 'save'],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_addon');
    expect(result).toHaveProperty('test_framework', 'phpunit');
    expect('tests/phpunit/TestAddonTest.php' in result.files).toBe(true);
    expect('phpunit.xml' in result.files).toBe(true);
  });

  test('scaffoldTest generates codeception test', () => {
    const result = scaffoldTest({
      addon_name: 'test_addon',
      class_name: 'TestAddon',
      class_type: 'controller',
      methods: ['run', 'actionIndex'],
      options: { test_framework: 'codeception' },
    }) as any;
    expect(result).toHaveProperty('test_framework', 'codeception');
    expect('tests/unit/test_addon/TestAddonTest.php' in result.files).toBe(true);
    expect('tests/unit.suite.yml' in result.files).toBe(true);
  });

  test('scaffoldTest generates correct method tests', () => {
    const result = scaffoldTest({
      addon_name: 'test_addon',
      class_name: 'ModelTest',
      class_type: 'model',
      methods: ['getItem', 'save'],
    }) as any;
    const testContent = result.files['tests/phpunit/ModelTestTest.php'];
    expect(testContent).toContain('testGetItem');
    expect(testContent).toContain('testSave');
  });

  test('scaffoldTest returns correct structure', () => {
    const result = scaffoldTest({
      addon_name: 'test_addon',
      class_name: 'TestAddon',
      class_type: 'model',
      methods: ['method1', 'method2', 'method3'],
    }) as any;
    expect(result.methods_count).toBe(3);
  });
});

describe('Email Tool', () => {
  test('scaffoldEmail generates email templates', () => {
    const result = scaffoldEmail({
      addon_name: 'test_email',
      templates: [
        { name: 'welcome', subject: 'Добро пожаловать!', body: 'Привет {user_name}!' },
        { name: 'notification', subject: 'Уведомление', body: 'Новое уведомление для {user_name}' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_email');
    expect(result).toHaveProperty('templates_count', 2);
    expect(
      'package/system/languages/ru/controllers/test_email/test_email_welcome.email.php' in
        result.files
    ).toBe(true);
    expect(
      'package/system/languages/ru/controllers/test_email/test_email_notification.email.php' in
        result.files
    ).toBe(true);
  });

  test('scaffoldEmail generates email index', () => {
    const result = scaffoldEmail({
      addon_name: 'test_email',
      templates: [{ name: 'welcome', subject: 'Test', body: 'Body' }],
    }) as any;
    expect(
      'package/system/languages/ru/controllers/test_email/test_email_emails.php' in result.files
    ).toBe(true);
  });

  test('scaffoldEmail with HTML', () => {
    const result = scaffoldEmail({
      addon_name: 'test_email',
      templates: [{ name: 'welcome', subject: 'Test', body: 'Hello' }],
      options: { use_html: true, base_template: 'default' },
    }) as any;
    const emailContent =
      result.files[
        'package/system/languages/ru/controllers/test_email/test_email_welcome.email.php'
      ];
    expect(emailContent).toContain('HTML');
    expect(emailContent).toContain('email-container');
  });

  test('scaffoldEmail returns correct template info', () => {
    const result = scaffoldEmail({
      addon_name: 'test_email',
      templates: [
        { name: 'test', subject: 'Test Subject', body: 'Body', variables: [{ name: 'user_name' }] },
      ],
    }) as any;
    expect(result.templates[0].name).toBe('test');
    expect(result.templates[0].variables_count).toBe(1);
  });
});

describe('Layout Override Tool', () => {
  test('scaffoldLayoutOverride generates override templates', () => {
    const result = scaffoldLayoutOverride({
      addon_name: 'test_override',
      overrides: [
        { controller: 'content', template: 'modern', action: 'view' },
        { controller: 'users', template: 'modern' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_override');
    expect(result).toHaveProperty('overrides_count', 2);
    expect('templates/modern/controllers/content/view.tpl.php' in result.files).toBe(true);
    expect('templates/modern/controllers/users/index.tpl.php' in result.files).toBe(true);
  });

  test('scaffoldLayoutOverride generates language file', () => {
    const result = scaffoldLayoutOverride({
      addon_name: 'test_override',
      overrides: [{ controller: 'content', template: 'modern', action: 'view' }],
    }) as any;
    expect(
      'package/system/languages/ru/controllers/test_override/test_override.php' in result.files
    ).toBe(true);
  });

  test('scaffoldLayoutOverride returns correct override info', () => {
    const result = scaffoldLayoutOverride({
      addon_name: 'test_override',
      overrides: [{ controller: 'content', template: 'modern', action: 'view' }],
    }) as any;
    expect(result.overrides[0].controller).toBe('content');
    expect(result.overrides[0].template).toBe('modern');
    expect(result.overrides[0].action).toBe('view');
    expect(result.overrides[0].path).toBe('templates/modern/controllers/content/view.tpl.php');
  });

  test('scaffoldLayoutOverride with options', () => {
    const result = scaffoldLayoutOverride({
      addon_name: 'test_override',
      overrides: [{ controller: 'content', template: 'modern' }],
      options: { use_wrapper: true, add_breadcrumbs: true },
    }) as any;
    const content = result.files['templates/modern/controllers/content/index.tpl.php'];
    expect(content).toContain('content-breadcrumbs');
    expect(content).toContain('test_override-sidebar');
  });
});

describe('Admin Partial Tool', () => {
  test('scaffoldAdminPartial generates partials', () => {
    const result = scaffoldAdminPartial({
      addon_name: 'test_partial',
      partials: [
        { name: 'menu', type: 'sidebar' },
        { name: 'info', type: 'panel' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_partial');
    expect(result).toHaveProperty('partials_count', 2);
    expect(
      'package/templates/admincoreui/partials/test_partial/sidebar_menu.php' in result.files
    ).toBe(true);
    expect(
      'package/templates/admincoreui/partials/test_partial/panel_info.php' in result.files
    ).toBe(true);
  });

  test('scaffoldAdminPartial generates header partial', () => {
    const result = scaffoldAdminPartial({
      addon_name: 'test_partial',
      partials: [{ name: 'main', type: 'header', items: ['dashboard', 'users'] }],
    }) as any;
    const content =
      result.files['package/templates/admincoreui/partials/test_partial/header_main.php'];
    expect(content).toContain('navbar');
    expect(content).toContain('icon-');
  });

  test('scaffoldAdminPartial generates modal partial', () => {
    const result = scaffoldAdminPartial({
      addon_name: 'test_partial',
      partials: [{ name: 'confirm', type: 'modal' }],
    }) as any;
    const content =
      result.files['package/templates/admincoreui/partials/test_partial/modal_confirm.php'];
    expect(content).toContain('modal');
    expect(content).toContain('modal-title');
  });

  test('scaffoldAdminPartial generates index file', () => {
    const result = scaffoldAdminPartial({
      addon_name: 'test_partial',
      partials: [{ name: 'menu', type: 'sidebar' }],
    }) as any;
    expect(
      'package/templates/admincoreui/partials/test_partial/test_partial.php' in result.files
    ).toBe(true);
  });
});

describe('Template Overrides Tool', () => {
  test('listTemplateOverrides returns all overrides', () => {
    const result = listTemplateOverrides() as any;
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThan(0);
    expect(result).toHaveProperty('overrides');
    expect(Array.isArray(result.overrides)).toBe(true);
  });

  test('listTemplateOverrides filters by controller', () => {
    const result = listTemplateOverrides('content') as any;
    expect(result.controller).toBe('content');
    result.overrides.forEach((o: any) => {
      expect(o.controller.toLowerCase()).toBe('content');
    });
  });

  test('listTemplateOverrides returns correct structure', () => {
    const result = listTemplateOverrides('users') as any;
    expect(result.overrides[0]).toHaveProperty('controller');
    expect(result.overrides[0]).toHaveProperty('action');
    expect(result.overrides[0]).toHaveProperty('path');
    expect(result.overrides[0]).toHaveProperty('description');
  });

  test('getTemplateOverrideInfo returns override details', () => {
    const result = getTemplateOverrideInfo('content', 'view') as any;
    expect(result).toHaveProperty('controller', 'content');
    expect(result).toHaveProperty('action', 'view');
    expect(result).toHaveProperty('path');
    expect(result).toHaveProperty('example');
  });

  test('getTemplateOverrideInfo returns error for unknown', () => {
    const result = getTemplateOverrideInfo('unknown_controller') as any;
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('available');
  });
});

describe('Cron Tool', () => {
  test('scaffoldCron generates cron files', () => {
    const result = scaffoldCron({
      addon_name: 'test_cron',
      tasks: [
        {
          name: 'cleanup',
          schedule: { minute: '0', hour: '*', day: '*', month: '*', day_of_week: '*' },
          action: 'taskCleanup',
        },
        {
          name: 'send_notifications',
          schedule: { minute: '*/15' },
          action: 'taskSendNotifications',
        },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'test_cron');
    expect(result).toHaveProperty('tasks_count', 2);
    expect('package/system/controllers/test_cron/cron.php' in result.files).toBe(true);
  });

  test('scaffoldCron generates manifest with tasks', () => {
    const result = scaffoldCron({
      addon_name: 'test_cron',
      tasks: [{ name: 'daily', schedule: { minute: '0', hour: '0' }, action: 'taskDaily' }],
    }) as any;
    const manifest = result.files['package/system/controllers/test_cron/manifest.xml'];
    expect(manifest).toContain('<task name="daily"');
    expect(manifest).toContain('schedule="0 0 * * *"');
  });

  test('scaffoldCron generates language file', () => {
    const result = scaffoldCron({
      addon_name: 'test_cron',
      tasks: [
        {
          name: 'cleanup',
          schedule: { minute: '0' },
          action: 'taskCleanup',
          description: 'Clean old data',
        },
      ],
    }) as any;
    expect('package/system/languages/ru/controllers/test_cron/test_cron.php' in result.files).toBe(
      true
    );
    const lang = result.files['package/system/languages/ru/controllers/test_cron/test_cron.php'];
    expect(lang).toContain('LANG_TEST_CRON_TASK_CLEANUP');
  });

  test('scaffoldCron returns correct task info', () => {
    const result = scaffoldCron({
      addon_name: 'test_cron',
      tasks: [{ name: 'hourly', schedule: { minute: '0', hour: '*' }, action: 'taskHourly' }],
    }) as any;
    expect(result.tasks[0].name).toBe('hourly');
    expect(result.tasks[0].schedule).toBe('0 * * * *');
  });

  test('scaffoldCron with lock and logging options', () => {
    const result = scaffoldCron({
      addon_name: 'test_cron',
      tasks: [{ name: 'test', schedule: { minute: '*' }, action: 'taskTest' }],
      options: { use_lock_file: true, log_execution: true },
    }) as any;
    const cron = result.files['package/system/controllers/test_cron/cron.php'];
    expect(cron).toContain('is_locked');
    expect(cron).toContain('cache/logs/test_cron.log');
  });
});

describe('Permission Tool', () => {
  test('scaffoldPermission generates permission files', () => {
    const result = scaffoldPermission({
      name: 'blog_post',
      title: 'Записи блога',
    }) as any;
    expect(result).toHaveProperty('addon_name', 'blog_post');
    expect(result).toHaveProperty('title', 'Записи блога');
    expect(result).toHaveProperty('permissions_count', 4);
    expect('blog_post/manifest.json' in result.files).toBe(true);
    expect('system/config/permissions/blog_post.php' in result.files).toBe(true);
  });

  test('scaffoldPermission includes permission checker class', () => {
    const result = scaffoldPermission({
      name: 'article',
      title: 'Статьи',
      permissions: ['view', 'add', 'edit', 'delete', 'publish'],
    }) as any;
    const permFile = result.files['article/permissions.php'];
    expect(permFile).toContain('ArticlePermissions');
    expect(permFile).toContain('function can(');
    expect(permFile).toContain("'view'");
    expect(permFile).toContain("'publish'");
  });

  test('scaffoldPermission generates hook handlers', () => {
    const result = scaffoldPermission({
      name: 'news_item',
      title: 'Новости',
    }) as any;
    const hookFile = result.files['system/hooks/news_item/permissions.hooks.php'];
    expect(hookFile).toContain('onNewsItemPermissionsHook');
    expect(hookFile).toContain('onContentBeforeSave');
    expect(hookFile).toContain('onContentBeforeDelete');
  });

  test('scaffoldPermission generates admin backend', () => {
    const result = scaffoldPermission({
      name: 'test_perm',
      title: 'Тест',
      permissions: ['view', 'edit'],
    }) as any;
    const backendFile = result.files['test_perm/backend/permissions.php'];
    expect(backendFile).toContain('backendTestPermPermissions');
    expect(backendFile).toContain('actionIndex');
    expect(backendFile).toContain('actionSave');
  });

  test('scaffoldPermission with roles option', () => {
    const result = scaffoldPermission({
      name: 'catalog',
      title: 'Каталог',
      permissions: ['view', 'add', 'edit', 'delete', 'admin'],
      options: { withRoles: true, withOwnership: true, withCategories: true },
    }) as any;
    expect('catalog/roles.php' in result.files).toBe(true);
    const rolesFile = result.files['catalog/roles.php'];
    expect(rolesFile).toContain('admin');
    expect(rolesFile).toContain('moderator');
    expect(rolesFile).toContain('auth');
    expect(rolesFile).toContain('all');
  });
});

describe('Filter Tool', () => {
  test('scaffoldFilter generates filter files', () => {
    const result = scaffoldFilter({
      addon_name: 'catalog',
      fields: [
        { field: 'price', type: 'range', label: 'Цена' },
        { field: 'category_id', type: 'select', label: 'Категория' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'catalog');
    expect(result).toHaveProperty('filters_count', 2);
    expect('catalog/filters.php' in result.files).toBe(true);
    expect('catalog/filter.form.php' in result.files).toBe(true);
  });

  test('scaffoldFilter generates filter class with conditions', () => {
    const result = scaffoldFilter({
      addon_name: 'products',
      fields: [
        { field: 'name', type: 'text', label: 'Название' },
        { field: 'price', type: 'range', label: 'Цена' },
        { field: 'in_stock', type: 'checkbox', label: 'В наличии' },
      ],
    }) as any;
    const filterFile = result.files['products/filters.php'];
    expect(filterFile).toContain('ProductsFilter');
    expect(filterFile).toContain('function apply(');
    expect(filterFile).toContain("'text'");
    expect(filterFile).toContain("'range'");
    expect(filterFile).toContain("'checkbox'");
  });

  test('scaffoldFilter generates form fields', () => {
    const result = scaffoldFilter({
      addon_name: 'test_filter',
      fields: [
        { field: 'category', type: 'select', label: 'Категория' },
        { field: 'date_from', type: 'date', label: 'Дата от' },
      ],
    }) as any;
    const formFile = result.files['test_filter/filter.form.php'];
    expect(formFile).toContain('fieldList');
    expect(formFile).toContain('fieldDate');
  });

  test('scaffoldFilter generates hook handlers', () => {
    const result = scaffoldFilter({
      addon_name: 'news',
      fields: [{ field: 'title', type: 'text', label: 'Заголовок' }],
    }) as any;
    const hookFile = result.files['system/hooks/news/filter.hooks.php'];
    expect(hookFile).toContain('onNewsFilterHook');
    expect(hookFile).toContain('onBeforeLoadModel');
    expect(hookFile).toContain('onBeforeRender');
  });

  test('scaffoldFilter with save_filters option', () => {
    const result = scaffoldFilter({
      addon_name: 'articles',
      fields: [{ field: 'author', type: 'text', label: 'Автор' }],
      options: { save_filters: true },
    }) as any;
    expect('articles/saved_filters.php' in result.files).toBe(true);
    const savedFile = result.files['articles/saved_filters.php'];
    expect(savedFile).toContain('ArticlesSavedFilters');
    expect(savedFile).toContain('function save(');
    expect(savedFile).toContain('function load(');
  });
});

describe('SEO Tool', () => {
  test('scaffoldSeo generates SEO files', () => {
    const result = scaffoldSeo({
      addon_name: 'blog',
    }) as any;
    expect(result).toHaveProperty('addon_name', 'blog');
    expect(result).toHaveProperty('fields_count', 3);
    expect('blog/seo.php' in result.files).toBe(true);
    expect('system/hooks/blog/seo.hooks.php' in result.files).toBe(true);
  });

  test('scaffoldSeo generates sitemap when enabled', () => {
    const result = scaffoldSeo({
      addon_name: 'news',
      options: { use_sitemap: true },
    }) as any;
    expect('news/sitemap.php' in result.files).toBe(true);
    const sitemap = result.files['news/sitemap.php'];
    expect(sitemap).toContain('NewsSitemap');
    expect(sitemap).toContain('function getItems(');
    expect(sitemap).toContain('function generateXml(');
  });

  test('scaffoldSeo generates schema.org when enabled', () => {
    const result = scaffoldSeo({
      addon_name: 'articles',
      options: { use_schema_org: true },
    }) as any;
    expect('articles/schema.php' in result.files).toBe(true);
    const schema = result.files['articles/schema.php'];
    expect(schema).toContain('ArticlesSchemaOrg');
    expect(schema).toContain('function getArticleSchema(');
  });

  test('scaffoldSeo with custom fields', () => {
    const result = scaffoldSeo({
      addon_name: 'products',
      fields: [
        { field: 'meta_title', type: 'title', value: '{item.name} - {site.name}' },
        { field: 'meta_desc', type: 'description', value: '{item.excerpt}' },
      ],
    }) as any;
    const seoFile = result.files['products/seo.php'];
    expect(seoFile).toContain('ProductsSeo');
    expect(seoFile).toContain('function getTitle(');
    expect(seoFile).toContain('function getDescription(');
  });

  test('scaffoldSeo generates hook handlers', () => {
    const result = scaffoldSeo({
      addon_name: 'test_seo',
      options: { use_og_tags: true, use_sitemap: true },
    }) as any;
    const hooks = result.files['system/hooks/test_seo/seo.hooks.php'];
    expect(hooks).toContain('onTestSeoSeoHook');
    expect(hooks).toContain('function onBeforeRender(');
    expect(hooks).toContain('function onAfterSave(');
  });
});

describe('Import/Export Tool', () => {
  test('scaffoldImportExport generates import/export files', () => {
    const result = scaffoldImportExport({
      addon_name: 'products',
      fields: [
        { field: 'title', type: 'string', label: 'Название' },
        { field: 'price', type: 'number', label: 'Цена' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'products');
    expect(result).toHaveProperty('fields_count', 2);
    expect('products/import.php' in result.files).toBe(true);
    expect('products/export.php' in result.files).toBe(true);
  });

  test('scaffoldImportExport generates import class with parsing', () => {
    const result = scaffoldImportExport({
      addon_name: 'catalog',
      fields: [
        { field: 'name', type: 'string', label: 'Наименование', required: true },
        { field: 'quantity', type: 'number', label: 'Количество' },
        { field: 'is_active', type: 'bool', label: 'Активен' },
      ],
    }) as any;
    const importFile = result.files['catalog/import.php'];
    expect(importFile).toContain('CatalogImport');
    expect(importFile).toContain('function importFromArray(');
    expect(importFile).toContain('function importRow(');
    expect(importFile).toContain('floatval');
  });

  test('scaffoldImportExport generates export class with formats', () => {
    const result = scaffoldImportExport({
      addon_name: 'items',
      fields: [{ field: 'title', type: 'string', label: 'Заголовок' }],
    }) as any;
    const exportFile = result.files['items/export.php'];
    expect(exportFile).toContain('ItemsExport');
    expect(exportFile).toContain('function exportToCsv(');
    expect(exportFile).toContain('function exportToJson(');
    expect(exportFile).toContain('function exportToXml(');
  });

  test('scaffoldImportExport with JSON API enabled', () => {
    const result = scaffoldImportExport({
      addon_name: 'data_sync',
      fields: [{ field: 'id', type: 'number', label: 'ID' }],
      options: { use_json: true },
    }) as any;
    expect('data_sync/api.import.php' in result.files).toBe(true);
    const apiFile = result.files['data_sync/api.import.php'];
    expect(apiFile).toContain('DataSyncApiImport');
    expect(apiFile).toContain('function actionImport(');
    expect(apiFile).toContain('function actionExport(');
  });

  test('scaffoldImportExport with CSV form enabled', () => {
    const result = scaffoldImportExport({
      addon_name: 'test_ie',
      fields: [{ field: 'name', type: 'string', label: 'Название' }],
      options: { use_csv: true },
    }) as any;
    expect('test_ie/import.form.php' in result.files).toBe(true);
    const formFile = result.files['test_ie/import.form.php'];
    expect(formFile).toContain('TestIeImportForm');
    expect(formFile).toContain('fieldFile');
  });
});

describe('Cache Tool', () => {
  test('scaffoldCache generates cache files', () => {
    const result = scaffoldCache({
      addon_name: 'blog',
    }) as any;
    expect(result).toHaveProperty('addon_name', 'blog');
    expect('blog/cache.php' in result.files).toBe(true);
    expect('system/hooks/blog/cache.hooks.php' in result.files).toBe(true);
  });

  test('scaffoldCache generates cache class with methods', () => {
    const result = scaffoldCache({
      addon_name: 'content',
      options: { default_ttl: 7200 },
    }) as any;
    const cacheFile = result.files['content/cache.php'];
    expect(cacheFile).toContain('ContentCache');
    expect(cacheFile).toContain('function get(');
    expect(cacheFile).toContain('function set(');
    expect(cacheFile).toContain('function delete(');
    expect(cacheFile).toContain('function remember(');
  });

  test('scaffoldCache with tags enabled', () => {
    const result = scaffoldCache({
      addon_name: 'items',
      options: { use_tags: true },
    }) as any;
    expect('items/cache.tags.php' in result.files).toBe(true);
    const tagsFile = result.files['items/cache.tags.php'];
    expect(tagsFile).toContain('ItemsCacheTags');
    expect(tagsFile).toContain('function invalidateTag(');
    expect(tagsFile).toContain('function flushAll(');
  });

  test('scaffoldCache generates hooks for cache invalidation', () => {
    const result = scaffoldCache({
      addon_name: 'test_cache',
      options: { use_tags: true },
    }) as any;
    const hooksFile = result.files['system/hooks/test_cache/cache.hooks.php'];
    expect(hooksFile).toContain('onTestCacheCacheHook');
    expect(hooksFile).toContain('function onAfterSave(');
    expect(hooksFile).toContain('function onAfterDelete(');
    expect(hooksFile).toContain('function onClearCache(');
  });

  test('scaffoldCache with Redis backend', () => {
    const result = scaffoldCache({
      addon_name: 'fast_cache',
      options: { use_redis: true, use_tags: true },
    }) as any;
    const cacheFile = result.files['fast_cache/cache.php'];
    expect(cacheFile).toContain('redis');
  });
});

describe('Webhook Tool', () => {
  test('scaffoldWebhook generates webhook files', () => {
    const result = scaffoldWebhook({
      addon_name: 'notifications',
      events: ['user.registered', 'order.paid'],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'notifications');
    expect(result).toHaveProperty('events_count', 2);
    expect('notifications/webhooks.php' in result.files).toBe(true);
    expect('notifications/webhook.config.php' in result.files).toBe(true);
  });

  test('scaffoldWebhook generates webhook handler class', () => {
    const result = scaffoldWebhook({
      addon_name: 'shop',
      events: ['item.created', 'item.updated', 'item.deleted'],
    }) as any;
    const handlerFile = result.files['shop/webhooks.php'];
    expect(handlerFile).toContain('ShopWebhook');
    expect(handlerFile).toContain('function handle(');
    expect(handlerFile).toContain('handleitem_created');
  });

  test('scaffoldWebhook generates config file', () => {
    const result = scaffoldWebhook({
      addon_name: 'test_wh',
      events: ['event.one', 'event.two'],
      options: { use_signature: true },
    }) as any;
    const configFile = result.files['test_wh/webhook.config.php'];
    expect(configFile).toContain('event.one');
    expect(configFile).toContain('event.two');
    expect(configFile).toContain('signature');
  });

  test('scaffoldWebhook with retry enabled generates queue', () => {
    const result = scaffoldWebhook({
      addon_name: 'api_events',
      events: ['sync.data'],
      options: { use_retry: true, retry_count: 5 },
    }) as any;
    expect('api_events/webhook.queue.php' in result.files).toBe(true);
    const queueFile = result.files['api_events/webhook.queue.php'];
    expect(queueFile).toContain('ApiEventsWebhookQueue');
    expect(queueFile).toContain('function getPending(');
    expect(queueFile).toContain('function retry(');
  });

  test('scaffoldWebhook with signature enabled generates security', () => {
    const result = scaffoldWebhook({
      addon_name: 'secure_webhook',
      events: ['payment.completed'],
      options: { use_signature: true },
    }) as any;
    expect('secure_webhook/webhook.security.php' in result.files).toBe(true);
    const securityFile = result.files['secure_webhook/webhook.security.php'];
    expect(securityFile).toContain('SecureWebhookWebhookSecurity');
    expect(securityFile).toContain('function verifySignature(');
    expect(securityFile).toContain('function generateSignature(');
  });
});

describe('External API Tool', () => {
  test('scaffoldExternalApi generates API client files', () => {
    const result = scaffoldExternalApi({
      addon_name: 'payment_api',
      base_url: 'https://api.payment.com/v1',
      endpoints: [
        { path: '/payments', method: 'POST' },
        { path: '/payments/{id}', method: 'GET' },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'payment_api');
    expect(result).toHaveProperty('base_url', 'https://api.payment.com/v1');
    expect(result).toHaveProperty('endpoints_count', 2);
    expect('payment_api/api/client.php' in result.files).toBe(true);
    expect('payment_api/api/request.php' in result.files).toBe(true);
  });

  test('scaffoldExternalApi generates API client with methods', () => {
    const result = scaffoldExternalApi({
      addon_name: 'weather',
      base_url: 'https://api.weather.com',
      endpoints: [
        { path: '/forecast', method: 'GET' },
        { path: '/alerts', method: 'POST' },
      ],
    }) as any;
    const clientFile = result.files['weather/api/client.php'];
    expect(clientFile).toContain('WeatherApiClient');
    expect(clientFile).toContain('function get_forecast(');
    expect(clientFile).toContain('function post_alerts(');
  });

  test('scaffoldExternalApi with auth enabled generates auth file', () => {
    const result = scaffoldExternalApi({
      addon_name: 'secure_api',
      base_url: 'https://api.secure.com',
      endpoints: [{ path: '/data', method: 'GET' }],
      options: { use_auth: true, auth_type: 'bearer' },
    }) as any;
    expect('secure_api/api/auth.php' in result.files).toBe(true);
    const authFile = result.files['secure_api/api/auth.php'];
    expect(authFile).toContain('SecureApiApiAuth');
    expect(authFile).toContain('function getHeaders(');
  });

  test('scaffoldExternalApi with rate limit generates limiter', () => {
    const result = scaffoldExternalApi({
      addon_name: 'limited_api',
      base_url: 'https://api.limited.com',
      endpoints: [{ path: '/search', method: 'GET' }],
      options: { use_rate_limit: true, rate_limit: 30 },
    }) as any;
    expect('limited_api/api/rate_limiter.php' in result.files).toBe(true);
    const limiterFile = result.files['limited_api/api/rate_limiter.php'];
    expect(limiterFile).toContain('LimitedApiApiRateLimiter');
    expect(limiterFile).toContain('function canMakeRequest(');
  });

  test('scaffoldExternalApi with cache enabled generates cache', () => {
    const result = scaffoldExternalApi({
      addon_name: 'cached_api',
      base_url: 'https://api.cached.com',
      endpoints: [{ path: '/status', method: 'GET' }],
      options: { use_cache: true },
    }) as any;
    expect('cached_api/api/cache.php' in result.files).toBe(true);
    const cacheFile = result.files['cached_api/api/cache.php'];
    expect(cacheFile).toContain('CachedApiApiCache');
    expect(cacheFile).toContain('function get(');
    expect(cacheFile).toContain('function set(');
  });
});

describe('OAuth Tool', () => {
  test('scaffoldOAuth generates OAuth files', () => {
    const result = scaffoldOAuth({
      addon_name: 'social_login',
      providers: [
        {
          name: 'google',
          client_id: 'xxx',
          client_secret: 'yyy',
          auth_url: 'https://accounts.google.com/o/oauth2/auth',
          token_url: 'https://oauth2.googleapis.com/token',
        },
      ],
    }) as any;
    expect(result).toHaveProperty('addon_name', 'social_login');
    expect(result).toHaveProperty('providers_count', 1);
    expect('social_login/oauth/client.php' in result.files).toBe(true);
    expect('social_login/oauth/provider.php' in result.files).toBe(true);
    expect('social_login/oauth/callback.php' in result.files).toBe(true);
  });

  test('scaffoldOAuth generates OAuth client class', () => {
    const result = scaffoldOAuth({
      addon_name: 'oauth_test',
      providers: [
        {
          name: 'vkontakte',
          client_id: '123',
          client_secret: '456',
          auth_url: 'https://oauth.vk.com/authorize',
          token_url: 'https://oauth.vk.com/access_token',
        },
      ],
    }) as any;
    const clientFile = result.files['oauth_test/oauth/client.php'];
    expect(clientFile).toContain('OauthTestOAuthClient');
    expect(clientFile).toContain('function getProvider(');
    expect(clientFile).toContain('function getAuthUrl(');
  });

  test('scaffoldOAuth generates OAuth provider with token handling', () => {
    const result = scaffoldOAuth({
      addon_name: 'secure_oauth',
      providers: [
        {
          name: 'facebook',
          client_id: 'xxx',
          client_secret: 'yyy',
          auth_url: 'https://facebook.com/v10.0/dialog/oauth',
          token_url: 'https://graph.facebook.com/v10.0/oauth/access_token',
        },
      ],
    }) as any;
    const providerFile = result.files['secure_oauth/oauth/provider.php'];
    expect(providerFile).toContain('SecureOauthOAuthProvider');
    expect(providerFile).toContain('function getAuthorizationUrl(');
    expect(providerFile).toContain('function handleCallback(');
    expect(providerFile).toContain('function refreshToken(');
  });

  test('scaffoldOAuth with db storage generates storage class', () => {
    const result = scaffoldOAuth({
      addon_name: 'db_oauth',
      providers: [
        {
          name: 'github',
          client_id: 'xxx',
          client_secret: 'yyy',
          auth_url: 'https://github.com/login/oauth/authorize',
          token_url: 'https://github.com/login/oauth/access_token',
        },
      ],
      options: { store_tokens_in_db: true },
    }) as any;
    expect('db_oauth/oauth/storage.php' in result.files).toBe(true);
    const storageFile = result.files['db_oauth/oauth/storage.php'];
    expect(storageFile).toContain('DbOauthOAuthStorage');
    expect(storageFile).toContain('function storeTokens(');
    expect(storageFile).toContain('function getTokens(');
    expect(storageFile).toContain('function getValidToken(');
  });

  test('scaffoldOAuth generates hooks for login buttons', () => {
    const result = scaffoldOAuth({
      addon_name: 'login_oauth',
      providers: [
        {
          name: 'google',
          client_id: 'xxx',
          client_secret: 'yyy',
          auth_url: 'https://accounts.google.com/o/oauth2/auth',
          token_url: 'https://oauth2.googleapis.com/token',
        },
        {
          name: 'vkontakte',
          client_id: '123',
          client_secret: '456',
          auth_url: 'https://oauth.vk.com/authorize',
          token_url: 'https://oauth.vk.com/access_token',
        },
      ],
    }) as any;
    const hooksFile = result.files['system/hooks/login_oauth/oauth.hooks.php'];
    expect(hooksFile).toContain('onLoginOauthOAuthHook');
    expect(hooksFile).toContain('btn-google');
    expect(hooksFile).toContain('btn-vkontakte');
  });
});

describe('Component Tool', () => {
  test('scaffoldComponent generates component files', () => {
    const result = scaffoldComponent({
      addon_name: 'my_component',
    }) as any;
    expect(result).toHaveProperty('addon_name', 'my_component');
    expect(result).toHaveProperty('controllers_count', 1);
    expect('my_component/manifest.json' in result.files).toBe(true);
    expect('my_component/backend.php' in result.files).toBe(true);
    expect('my_component/frontend.php' in result.files).toBe(true);
    expect('my_component/model.php' in result.files).toBe(true);
  });

  test('scaffoldComponent generates manifest with correct structure', () => {
    const result = scaffoldComponent({
      addon_name: 'test_comp',
      controllers: [{ name: 'items', actions: ['index', 'view'], use_model: true }],
    }) as any;
    const manifest = result.files['test_comp/manifest.json'];
    expect(manifest).toContain("'type' => 'component'");
    expect(manifest).toContain("'name' => 'test_comp'");
  });

  test('scaffoldComponent with options generates additional files', () => {
    const result = scaffoldComponent({
      addon_name: 'full_comp',
      options: { with_routes: true, with_menu: true },
    }) as any;
    expect('full_comp/routes.php' in result.files).toBe(true);
    expect('full_comp/menu.php' in result.files).toBe(true);
  });

  test('scaffoldComponent generates backend with controllers', () => {
    const result = scaffoldComponent({
      addon_name: 'backend_test',
      controllers: [{ name: 'products', actions: ['index', 'add', 'edit'] }],
    }) as any;
    const backend = result.files['backend_test/backend.php'];
    expect(backend).toContain('BackendTestBackend');
    expect(backend).toContain('getBackendMenu');
  });
});

describe('Widget Tool', () => {
  test('scaffoldWidget generates widget files', () => {
    const result = scaffoldWidget({
      addon_name: 'blog',
      widget_name: 'recent_posts',
    }) as any;
    expect(result).toHaveProperty('addon_name', 'blog');
    expect(result).toHaveProperty('widget_name', 'recent_posts');
    expect('blog/widgets/recent_posts.php' in result.files).toBe(true);
    expect('blog/widgets/recent_posts.options.php' in result.files).toBe(true);
    expect('blog/widgets/recent_posts.html.php' in result.files).toBe(true);
  });

  test('scaffoldWidget generates widget class with options', () => {
    const result = scaffoldWidget({
      addon_name: 'news',
      widget_name: 'latest_news',
      options: [
        { name: 'title', type: 'text', label: 'Заголовок', default: 'Latest News' },
        { name: 'limit', type: 'number', label: 'Количество', default: 5 },
      ],
    }) as any;
    const widgetFile = result.files['news/widgets/latest_news.php'];
    expect(widgetFile).toContain('LatestNewsWidget');
    expect(widgetFile).toContain('getOptions');
  });

  test('scaffoldWidget with styles generates CSS', () => {
    const result = scaffoldWidget({
      addon_name: 'test_widget',
      widget_name: 'custom',
      options_config: { with_styles: true },
    }) as any;
    expect('test_widget/widgets/custom.css' in result.files).toBe(true);
  });
});

describe('Template Theme Tool', () => {
  test('scaffoldTemplate generates template files', () => {
    const result = scaffoldTheme({
      template_name: 'my_theme',
    }) as any;
    expect(result).toHaveProperty('template_name', 'my_theme');
    expect(result).toHaveProperty('blocks_count', 5);
    expect('my_theme/manifest.json' in result.files).toBe(true);
    expect('my_theme/main.tpl.php' in result.files).toBe(true);
    expect('my_theme/main.css' in result.files).toBe(true);
  });

  test('scaffoldTemplate generates manifest with options', () => {
    const result = scaffoldTheme({
      template_name: 'dark_theme',
      options: { with_dark_mode: true, with_responsive: true },
    }) as any;
    const manifest = result.files['dark_theme/manifest.json'];
    expect(manifest).toContain('dark_mode');
    expect(manifest).toContain('responsive');
  });

  test('scaffoldTemplate with layout generates YAML', () => {
    const result = scaffoldTheme({
      template_name: 'layout_test',
      options: { with_layout: true },
    }) as any;
    expect('layout_test/layout.yaml' in result.files).toBe(true);
  });

  test('scaffoldTemplate generates header and footer templates', () => {
    const result = scaffoldTheme({
      template_name: 'test_template',
    }) as any;
    expect('test_template/header.tpl.php' in result.files).toBe(true);
    expect('test_template/footer.tpl.php' in result.files).toBe(true);
  });
});

describe('Layout Tool', () => {
  test('listLayoutPresets returns presets', () => {
    const result = listLayoutPresets() as any;
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
  });

  test('scaffoldLayoutScheme with custom rows', () => {
    const result = scaffoldLayoutScheme({
      template: 'modern',
      rows: [
        {
          title: 'Test Row',
          cols: [{ title: 'Test Col', class: 'col-md-12' }],
        },
      ],
    }) as any;
    expect(result).toHaveProperty('yaml');
    expect(typeof result.yaml).toBe('string');
  });
});

describe('DB Tool', () => {
  test('introspectDatabase returns tables', () => {
    const result = introspectDatabase() as any;
    expect(result).toHaveProperty('totalTables');
    expect(result.totalTables).toBeGreaterThan(0);
    expect(result).toHaveProperty('tables');
  });

  test('introspectDatabase returns specific table', () => {
    const result = introspectDatabase('users') as any;
    expect(result).toHaveProperty('table');
    expect(result.table).toContain('cms_');
  });

  test('listContentTypes returns types', () => {
    const result = listContentTypes() as any;
    expect(result).toHaveProperty('table');
    expect(result).toHaveProperty('fields');
  });

  test('listDatabaseEvents returns events', () => {
    const result = listDatabaseEvents() as any;
    expect(result).toHaveProperty('totalEvents');
    expect(result.totalEvents).toBeGreaterThan(0);
  });

  test('describeTable returns table details', () => {
    const result = describeTable('users') as any;
    expect(result).toHaveProperty('table');
    expect(result).toHaveProperty('fields');
    expect(result).toHaveProperty('indexes');
  });
});

describe('Controllers Tool', () => {
  test('analyzeController returns controller info', () => {
    const result = analyzeController('content') as any;
    expect(result).toHaveProperty('name', 'content');
    expect(result).toHaveProperty('className');
    expect(result).toHaveProperty('actions');
  });

  test('analyzeController returns backend', () => {
    const result = analyzeController('admin', 'backend') as any;
    expect(result).toHaveProperty('type', 'backend');
  });

  test('listControllers returns list', () => {
    const result = listControllers() as any;
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThan(0);
    expect(result).toHaveProperty('allControllers');
  });

  test('listControllers with filter', () => {
    const result = listControllers('frontend') as any;
    expect(result).toHaveProperty('byType');
    expect(result.byType).toHaveProperty('frontend');
  });

  test('getControllerActionsList returns actions', () => {
    const result = getControllerActionsList('content') as any;
    expect(result).toHaveProperty('controller', 'content');
    expect(result).toHaveProperty('actions');
  });

  test('listSystemTraits returns traits', () => {
    const result = listSystemTraits() as any;
    expect(result).toHaveProperty('traits');
    expect(result.traits).toBeTruthy();
  });
});

describe('Source Tool', () => {
  test('listWidgets returns widgets', () => {
    const result = listWidgets() as any;
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThan(0);
    expect(result).toHaveProperty('widgets');
  });

  test('getWidgetInfo returns widget details', () => {
    const result = getWidgetInfo('text') as any;
    expect(result).toHaveProperty('name', 'text');
    expect(result).toHaveProperty('className');
    expect(result).toHaveProperty('optionsFormPath');
  });

  test('getWidgetInfo returns error for unknown widget', () => {
    const result = getWidgetInfo('unknown_widget_xyz') as any;
    expect(result).toHaveProperty('error');
  });

  test('listTraits returns traits', () => {
    const result = listTraits() as any;
    expect(result).toHaveProperty('traits');
  });

  test('getTraitInfo returns trait details', () => {
    const result = getTraitInfo('fieldsParseable') as any;
    expect(result).toHaveProperty('name', 'fieldsParseable');
    expect(result).toHaveProperty('methods');
  });

  test('listFields returns field types', () => {
    const result = listFields() as any;
    expect(result).toHaveProperty('total');
    expect(result.total).toBeGreaterThan(0);
  });

  test('getFieldInfo returns field details', () => {
    const result = getFieldInfo('string') as any;
    expect(result).toHaveProperty('name', 'string');
    expect(result).toHaveProperty('options');
  });

  test('getFieldInfo returns error for unknown field', () => {
    const result = getFieldInfo('unknown_field_xyz') as any;
    expect(result).toHaveProperty('error');
  });
});

describe('Migration Tool', () => {
  test('generateMigration generates install.php and SQL', () => {
    const result = generateMigration('test_items', [
      { name: 'title', type: 'varchar(255)' },
      { name: 'content', type: 'text' },
    ]) as any;
    expect(result).toHaveProperty('install_php');
    expect(result).toHaveProperty('sql');
    expect(result).toHaveProperty('table_name');
  });

  test('generateMigration with all options', () => {
    const result = generateMigration('products', [
      {
        name: 'title',
        type: 'varchar(255)',
        nullable: false,
        default: 'New',
        comment: 'Product title',
      },
      { name: 'price', type: 'decimal(10,2)', nullable: true },
      { name: 'created_at', type: 'datetime' },
    ]) as any;
    expect(result.sql).toContain('NOT NULL');
    expect(result.install_php).toContain('createTable');
  });

  test('generateFieldSuggestions returns suggestions', () => {
    const result = generateFieldSuggestions('string') as any;
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('generateFieldSuggestions for all types', () => {
    const types = ['string', 'text', 'number', 'datetime', 'user', 'bool'] as const;
    types.forEach(type => {
      const result = generateFieldSuggestions(type) as any;
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('Requirement Tool', () => {
  test('analyzeRequirement returns analysis', () => {
    const result = analyzeRequirement('каталог товаров') as any;
    expect(result).toHaveProperty('addon_type');
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('suggested_title');
  });

  test('suggestAddonStructure returns structure', () => {
    const result = suggestAddonStructure('with_admin') as any;
    expect(result).toHaveProperty('type', 'with_admin');
    expect(result).toHaveProperty('files');
    expect(result).toHaveProperty('description');
  });
});

const fs = require('fs');
const SOURCE_PATH = './source/system/core/user.php';
const sourceExists = fs.existsSync(SOURCE_PATH);

const describeOrSkip = sourceExists ? describe : describe.skip;

describeOrSkip('Core Parser', () => {
  test('parseCoreFile parses user.php correctly', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/user.php');
    expect(result).not.toBeNull();
    expect(result.name).toBe('cmsUser');
    expect(result.file).toBe('user');
    expect(result.methods.length).toBeGreaterThan(0);
  });

  test('parseCoreFile parses database.php correctly', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/database.php');
    expect(result).not.toBeNull();
    expect(result.name).toBe('cmsDatabase');
    expect(result.methods.length).toBeGreaterThan(40);
  });

  test('parseCoreFile parses config.php correctly', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/config.php');
    expect(result).not.toBeNull();
    expect(result.name).toBe('cmsConfig');
    expect(result.extends).toBe('cmsConfigs');
  });

  test('parseCoreFile parses autoloader.php correctly', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/autoloader.php');
    expect(result).not.toBeNull();
    expect(result.methods.length).toBeGreaterThan(0);
  });

  test('parseAllCoreFiles finds 38 classes', () => {
    const { parseAllCoreFiles } = require('../tools/parser/core-parser');
    const result = parseAllCoreFiles('./source');
    expect(result.length).toBe(38);
  });

  test('cmsUser has some public methods', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/user.php');
    const publicMethods = result.methods.filter((m: any) => m.visibility === 'public');
    expect(publicMethods.length).toBeGreaterThan(0);
  });

  test('cmsDatabase has expected public methods', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/database.php');
    const publicMethods = result.methods.filter((m: any) => m.visibility === 'public');
    expect(publicMethods.some((m: any) => m.name === 'query')).toBe(true);
    expect(publicMethods.some((m: any) => m.name === 'insert')).toBe(true);
    expect(publicMethods.some((m: any) => m.name === 'update')).toBe(true);
    expect(publicMethods.some((m: any) => m.name === 'delete')).toBe(true);
  });

  test('cmsPermissions has expected methods', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/permissions.php');
    const publicMethods = result.methods.filter((m: any) => m.visibility === 'public');
    expect(publicMethods.some((m: any) => m.name === 'isAllowed')).toBe(true);
    expect(publicMethods.some((m: any) => m.name === 'isDenied')).toBe(true);
  });

  test('cmsPaginator has some methods', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/paginator.php');
    expect(result.methods.length).toBeGreaterThan(0);
  });

  test('cmsResponse has some public methods', () => {
    const { parseCoreFile } = require('../tools/parser/core-parser');
    const result = parseCoreFile('./source/system/core/response.php');
    const publicMethods = result.methods.filter((m: any) => m.visibility === 'public');
    expect(publicMethods.length).toBeGreaterThan(0);
    expect(publicMethods.some((m: any) => m.name === 'send')).toBe(true);
  });

  test('all core classes have required properties', () => {
    const { parseAllCoreFiles } = require('../tools/parser/core-parser');
    const classes = parseAllCoreFiles('./source');
    classes.forEach((cls: any) => {
      expect(cls).toHaveProperty('name');
      expect(cls).toHaveProperty('file');
      expect(cls).toHaveProperty('methods');
      expect(cls).toHaveProperty('properties');
      expect(cls).toHaveProperty('constants');
    });
  });

  test('coreClasses array has 38 entries', () => {
    const { coreClasses } = require('../data/core-api');
    expect(coreClasses.length).toBe(38);
  });

  test('coreAPIMap has all 38 classes', () => {
    const { coreAPIMap } = require('../data/core-api');
    expect(Object.keys(coreAPIMap).length).toBe(38);
  });

  test('cmsTemplate has many methods', () => {
    const { coreAPIMap } = require('../data/core-api');
    expect(coreAPIMap.cmsTemplate.methods.length).toBeGreaterThan(100);
  });

  test('cmsModel has many methods', () => {
    const { coreAPIMap } = require('../data/core-api');
    expect(coreAPIMap.cmsModel.methods.length).toBeGreaterThan(50);
  });

  test('cmsDatabase has many methods', () => {
    const { coreAPIMap } = require('../data/core-api');
    expect(coreAPIMap.cmsDatabase.methods.length).toBeGreaterThan(40);
  });

  test('coreAPIMap method signatures are valid strings', () => {
    const { coreAPIMap } = require('../data/core-api') as any;
    for (const cls of Object.values(coreAPIMap) as any[]) {
      for (const method of cls.methods) {
        expect(typeof method.signature).toBe('string');
        expect(method.signature.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('Libs API', () => {
  test('libsData has helpers, classes and thirdParty', () => {
    const { libsData } = require('../data/libs-api');
    expect(libsData).toHaveProperty('helpers');
    expect(libsData).toHaveProperty('classes');
    expect(libsData).toHaveProperty('thirdParty');
  });

  test('helpers has 4 modules', () => {
    const { libsData } = require('../data/libs-api');
    expect(Object.keys(libsData.helpers).length).toBe(4);
    expect(libsData.helpers).toHaveProperty('template');
    expect(libsData.helpers).toHaveProperty('html');
    expect(libsData.helpers).toHaveProperty('files');
    expect(libsData.helpers).toHaveProperty('strings');
  });

  test('template helper has many functions', () => {
    const { libsData } = require('../data/libs-api');
    expect(libsData.helpers.template.functions.length).toBeGreaterThan(20);
  });

  test('html helper has many functions', () => {
    const { libsData } = require('../data/libs-api');
    expect(libsData.helpers.html.functions.length).toBeGreaterThan(25);
  });

  test('files helper has many functions', () => {
    const { libsData } = require('../data/libs-api');
    expect(libsData.helpers.files.functions.length).toBeGreaterThan(10);
  });

  test('strings helper has many functions', () => {
    const { libsData } = require('../data/libs-api');
    expect(libsData.helpers.strings.functions.length).toBeGreaterThan(30);
  });

  test('classes has 6 class libraries', () => {
    const { libsData } = require('../data/libs-api');
    expect(Object.keys(libsData.classes).length).toBe(6);
    expect(libsData.classes).toHaveProperty('jevix');
    expect(libsData.classes).toHaveProperty('googleAuthenticator');
    expect(libsData.classes).toHaveProperty('mobileDetect');
    expect(libsData.classes).toHaveProperty('lastRSS');
    expect(libsData.classes).toHaveProperty('idnaConvert');
    expect(libsData.classes).toHaveProperty('spyc');
  });

  test('thirdParty has 3 libraries', () => {
    const { libsData } = require('../data/libs-api');
    expect(Object.keys(libsData.thirdParty).length).toBe(3);
    expect(libsData.thirdParty).toHaveProperty('scssphp');
    expect(libsData.thirdParty).toHaveProperty('geshi');
    expect(libsData.thirdParty).toHaveProperty('phpmailer');
  });
});

describe('Database Schema', () => {
  test('databaseSchema has all required tables', () => {
    const { databaseSchema } = require('../data/database-schema');
    expect(databaseSchema.tableCount).toBe(50);
  });

  test('databaseSchema has cms_users table', () => {
    const { databaseSchema } = require('../data/database-schema');
    const usersTable = databaseSchema.tables.find((t: any) => t.name === 'cms_users');
    expect(usersTable).toBeDefined();
    expect(usersTable.fields.length).toBeGreaterThan(10);
  });

  test('databaseSchema has cms_content_types table', () => {
    const { databaseSchema } = require('../data/database-schema');
    const ctTable = databaseSchema.tables.find((t: any) => t.name === 'cms_content_types');
    expect(ctTable).toBeDefined();
  });

  test('all tables have name and fields', () => {
    const { databaseSchema } = require('../data/database-schema');
    databaseSchema.tables.forEach((table: any) => {
      expect(table).toHaveProperty('name');
      expect(table).toHaveProperty('fields');
      expect(Array.isArray(table.fields)).toBe(true);
    });
  });

  test('all tables have indexes', () => {
    const { databaseSchema } = require('../data/database-schema');
    databaseSchema.tables.forEach((table: any) => {
      expect(table).toHaveProperty('indexes');
      expect(Array.isArray(table.indexes)).toBe(true);
    });
  });
});

describe('Events Map', () => {
  test('eventsMap has 95 events', () => {
    const { eventsMap } = require('../data/events-map');
    expect(eventsMap.eventCount).toBe(95);
  });

  test('eventsMap has byEvent lookup', () => {
    const { eventsMap } = require('../data/events-map');
    expect(eventsMap.byEvent).toBeDefined();
    expect(typeof eventsMap.byEvent).toBe('object');
  });

  test('eventsMap has byController lookup', () => {
    const { eventsMap } = require('../data/events-map');
    expect(eventsMap.byController).toBeDefined();
  });

  test('events have required properties', () => {
    const { eventsMap } = require('../data/events-map');
    eventsMap.events.slice(0, 10).forEach((event: any) => {
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('event');
      expect(event).toHaveProperty('listener');
    });
  });
});

describe('Widgets Map', () => {
  test('widgetsMap has 4 system widgets', () => {
    const { widgetsMap } = require('../data/widgets-map');
    expect(widgetsMap.widgetCount).toBe(4);
  });

  test('widgetsMap has text, menu, html, template', () => {
    const { widgetsMap } = require('../data/widgets-map');
    expect(widgetsMap.byName).toHaveProperty('text');
    expect(widgetsMap.byName).toHaveProperty('menu');
    expect(widgetsMap.byName).toHaveProperty('html');
    expect(widgetsMap.byName).toHaveProperty('template');
  });

  test('getWidget function works', () => {
    const { getWidget } = require('../data/widgets-map');
    const textWidget = getWidget('text');
    expect(textWidget).toBeDefined();
    expect(textWidget.name).toBe('text');
  });

  test('all widgets have className', () => {
    const { widgetsMap } = require('../data/widgets-map');
    widgetsMap.widgets.forEach((widget: any) => {
      expect(widget).toHaveProperty('className');
      expect(widget.className).toMatch(/^widget/);
    });
  });
});

describe('Traits Map', () => {
  test('traitsMap has traits', () => {
    const { traitsMap } = require('../data/traits-map');
    expect(traitsMap.traits.length).toBeGreaterThan(5);
  });

  test('traitsMap has byNamespace', () => {
    const { traitsMap } = require('../data/traits-map');
    expect(traitsMap.byNamespace).toBeDefined();
    expect(Object.keys(traitsMap.byNamespace).length).toBeGreaterThan(0);
  });

  test('listgrid trait exists', () => {
    const { traitsMap } = require('../data/traits-map');
    const listgrid = traitsMap.traits.find((t: any) => t.name === 'listgrid');
    expect(listgrid).toBeDefined();
  });

  test('all traits have methods', () => {
    const { traitsMap } = require('../data/traits-map');
    traitsMap.traits.forEach((trait: any) => {
      expect(trait).toHaveProperty('methods');
      expect(Array.isArray(trait.methods)).toBe(true);
    });
  });
});

describe('Fields Map', () => {
  test('fieldsMap has 31+ field types', () => {
    const { fieldsMap } = require('../data/fields-map');
    expect(fieldsMap.fieldCount).toBeGreaterThan(30);
  });

  test('fieldsMap has string, number, list fields', () => {
    const { fieldsMap } = require('../data/fields-map');
    expect(fieldsMap.byName).toHaveProperty('string');
    expect(fieldsMap.byName).toHaveProperty('number');
    expect(fieldsMap.byName).toHaveProperty('list');
  });

  test('fields have options array', () => {
    const { fieldsMap } = require('../data/fields-map');
    const stringField = fieldsMap.byName['string'];
    expect(stringField.options).toBeDefined();
    expect(Array.isArray(stringField.options)).toBe(true);
  });

  test('fields have validationRules', () => {
    const { fieldsMap } = require('../data/fields-map');
    const numberField = fieldsMap.byName['number'];
    expect(numberField.validationRules).toBeDefined();
  });
});

describe('Controllers Map', () => {
  test('controllersMap has 61+ controllers', () => {
    const { controllersMap } = require('../data/controllers-map');
    expect(controllersMap.controllerCount).toBeGreaterThan(60);
  });

  test('controllersMap has activity_frontend, admin_frontend, content_frontend', () => {
    const { controllersMap } = require('../data/controllers-map');
    expect(controllersMap.byName).toHaveProperty('activity_frontend');
    expect(controllersMap.byName).toHaveProperty('admin_frontend');
    expect(controllersMap.byName).toHaveProperty('content_frontend');
  });

  test('content_frontend controller has many actions', () => {
    const { controllersMap } = require('../data/controllers-map');
    const content = controllersMap.byName['content_frontend'];
    expect(content).toBeDefined();
    expect(content.actions.length).toBeGreaterThan(5);
  });

  test('controllers have frontend and backend', () => {
    const { controllersMap } = require('../data/controllers-map');
    const activity = controllersMap.controllers.filter((c: any) => c.name === 'activity');
    expect(activity.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Components API', () => {
  test('components array has cmsModel', () => {
    const { components } = require('../data/components');
    const cmsModel = components.find((c: any) => c.name === 'cmsModel');
    expect(cmsModel).toBeDefined();
    expect(cmsModel.methods.length).toBeGreaterThan(30);
  });

  test('components have required properties', () => {
    const { components } = require('../data/components');
    components.forEach((comp: any) => {
      expect(comp).toHaveProperty('name');
      expect(comp).toHaveProperty('class');
      expect(comp).toHaveProperty('methods');
    });
  });

  test('cmsModel has filterEqual method', () => {
    const { components } = require('../data/components');
    const cmsModel = components.find((c: any) => c.name === 'cmsModel');
    const filterEqual = cmsModel.methods.find((m: any) => m.name === 'filterEqual');
    expect(filterEqual).toBeDefined();
  });
});

describe('Hooks Data', () => {
  test('hooks array includes source-backed and curated hooks', () => {
    const { hooks } = require('../data/hooks');
    expect(hooks.length).toBeGreaterThan(250);
    expect(hooks.some((hook: any) => hook.source?.files?.length > 0)).toBe(true);
  });

  test('source-backed components include provenance', () => {
    const { components } = require('../data/components');
    const cmsModel = components.find((component: any) => component.name === 'cmsModel');
    expect(cmsModel.source.file).toBe('system/core/model.php');
    expect(cmsModel.source.repository).toContain('instantsoft/icms2');
  });

  test('hooks have required properties', () => {
    const { hooks } = require('../data/hooks');
    hooks.forEach((hook: any) => {
      expect(hook).toHaveProperty('name');
      expect(hook).toHaveProperty('type');
      expect(hook).toHaveProperty('category');
      expect(hook).toHaveProperty('parameters');
    });
  });

  test('content_after_add_approve hook exists', () => {
    const { hooks } = require('../data/hooks');
    const hook = hooks.find((h: any) => h.name === 'content_after_add_approve');
    expect(hook).toBeDefined();
    expect(hook.type).toBe('action');
  });
});

describe('Routes Map', () => {
  test('routesMap has content and photos controllers', () => {
    const { routesMap } = require('../data/routes-map');
    expect(routesMap.controllers.length).toBe(2);
    expect(routesMap.routeCount).toBeGreaterThan(30);
  });

  test('content controller has many routes', () => {
    const { getRoutesByController } = require('../data/routes-map');
    const content = getRoutesByController('content');
    expect(content).toBeDefined();
    expect(content.routes.length).toBeGreaterThan(20);
  });

  test('all routes have pattern and action', () => {
    const { routesMap } = require('../data/routes-map');
    routesMap.controllers.forEach((ctrl: any) => {
      ctrl.routes.forEach((route: any) => {
        expect(route).toHaveProperty('pattern');
        expect(route).toHaveProperty('action');
      });
    });
  });
});

describe('Zod Validation', () => {
  const {
    validateHook,
    validateComponent,
    validateField,
    validateWidget,
    validateTrait,
    validateTable,
    validateEvent,
    validateController,
    validateRoute,
    validateDatabaseSchema,
    validateEventsMap,
    validateControllersMap,
    validateRoutesMap,
    validateCoreClass,
  } = require('../data/schemas-validation');

  test('validateHook accepts valid hook', () => {
    const { hooks } = require('../data/hooks');
    const result = validateHook(hooks[0]);
    expect(result.success).toBe(true);
  });

  test('validateHook rejects invalid data', () => {
    const result = validateHook({ name: 123 });
    expect(result.success).toBe(false);
  });

  test('validateComponent accepts valid component', () => {
    const { components } = require('../data/components');
    const result = validateComponent(components[0]);
    expect(result.success).toBe(true);
  });

  test('validateComponent rejects invalid data', () => {
    const result = validateComponent({ name: 123 });
    expect(result.success).toBe(false);
  });

  test('validateField accepts valid field', () => {
    const { fieldsMap } = require('../data/fields-map');
    const result = validateField(fieldsMap.fields[0]);
    expect(result.success).toBe(true);
  });

  test('validateField rejects invalid data', () => {
    const result = validateField({ name: 123 });
    expect(result.success).toBe(false);
  });

  test('validateWidget accepts valid widget', () => {
    const { widgetsMap } = require('../data/widgets-map');
    const result = validateWidget(widgetsMap.widgets[0]);
    expect(result.success).toBe(true);
  });

  test('validateWidget rejects invalid data', () => {
    const result = validateWidget({ name: 123 });
    expect(result.success).toBe(false);
  });

  test('validateTrait accepts valid trait', () => {
    const { traitsMap } = require('../data/traits-map');
    const result = validateTrait(traitsMap.traits[0]);
    expect(result.success).toBe(true);
  });

  test('validateTrait rejects invalid data', () => {
    const result = validateTrait({ name: 123 });
    expect(result.success).toBe(false);
  });

  test('validateTable accepts valid table', () => {
    const { databaseSchema } = require('../data/database-schema');
    const result = validateTable(databaseSchema.tables[0]);
    expect(result.success).toBe(true);
  });

  test('validateTable rejects invalid data', () => {
    const result = validateTable({ name: 123 });
    expect(result.success).toBe(false);
  });

  test('validateEvent accepts valid event', () => {
    const { eventsMap } = require('../data/events-map');
    const result = validateEvent(eventsMap.events[0]);
    expect(result.success).toBe(true);
  });

  test('validateEvent rejects invalid data', () => {
    const result = validateEvent({ id: 'not-a-number' });
    expect(result.success).toBe(false);
  });

  test('validateController accepts valid controller', () => {
    const { controllersMap } = require('../data/controllers-map');
    const result = validateController(controllersMap.controllers[0]);
    expect(result.success).toBe(true);
  });

  test('validateController rejects invalid data', () => {
    const result = validateController({ name: 123 });
    expect(result.success).toBe(false);
  });

  test('validateRoute accepts valid route', () => {
    const { routesMap } = require('../data/routes-map');
    const result = validateRoute(routesMap.controllers[0].routes[0]);
    expect(result.success).toBe(true);
  });

  test('validateRoute rejects invalid data', () => {
    const result = validateRoute({ pattern: 123 });
    expect(result.success).toBe(false);
  });

  test('validateDatabaseSchema accepts valid schema', () => {
    const { databaseSchema } = require('../data/database-schema');
    const result = validateDatabaseSchema(databaseSchema);
    expect(result.success).toBe(true);
  });

  test('validateDatabaseSchema rejects invalid data', () => {
    const result = validateDatabaseSchema({ tables: 'not-array' });
    expect(result.success).toBe(false);
  });

  test('validateEventsMap accepts valid map', () => {
    const { eventsMap } = require('../data/events-map');
    const result = validateEventsMap(eventsMap);
    expect(result.success).toBe(true);
  });

  test('validateEventsMap rejects invalid data', () => {
    const result = validateEventsMap({ events: 'not-array' });
    expect(result.success).toBe(false);
  });

  test('validateControllersMap accepts valid map', () => {
    const { controllersMap } = require('../data/controllers-map');
    const result = validateControllersMap(controllersMap);
    expect(result.success).toBe(true);
  });

  test('validateControllersMap rejects invalid data', () => {
    const result = validateControllersMap({ controllers: 'not-array' });
    expect(result.success).toBe(false);
  });

  test('validateRoutesMap accepts valid map', () => {
    const { routesMap } = require('../data/routes-map');
    const result = validateRoutesMap(routesMap);
    expect(result.success).toBe(true);
  });

  test('validateRoutesMap rejects invalid data', () => {
    const result = validateRoutesMap({ controllers: 'not-array' });
    expect(result.success).toBe(false);
  });

  test('validateCoreClass accepts valid class', () => {
    const { coreClasses } = require('../data/core-api');
    const result = validateCoreClass(coreClasses[0]);
    expect(result.success).toBe(true);
  });

  test('validateCoreClass rejects invalid data', () => {
    const result = validateCoreClass({ name: 123 });
    expect(result.success).toBe(false);
  });
});

describe('List Routes Tool', () => {
  const { listRoutes } = require('../tools/source-tool');

  test('listRoutes returns all routes without filter', () => {
    const result = listRoutes();
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('controllersCount');
    expect(result.total).toBeGreaterThan(30);
  });

  test('listRoutes returns routes for content controller', () => {
    const result = listRoutes('content');
    expect(result).toHaveProperty('controller', 'content');
    expect(result).toHaveProperty('routes');
    expect(result.routes.length).toBeGreaterThan(20);
  });

  test('listRoutes returns routes for photos controller', () => {
    const result = listRoutes('photos');
    expect(result).toHaveProperty('controller', 'photos');
    expect(result).toHaveProperty('routes');
    expect(result.routes.length).toBe(2);
  });

  test('listRoutes returns error for unknown controller', () => {
    const result = listRoutes('unknown_controller');
    expect(result).toHaveProperty('error');
  });
});

describe('Hooks Tool Extended', () => {
  const { listHooks, getHookDetails, searchHooks } = require('../tools/hooks-tool');

  test('listHooks returns all hooks by default', () => {
    const result = listHooks();
    expect(result.total).toBeGreaterThan(250);
  });

  test('listHooks filters by category engine', () => {
    const result = listHooks('engine');
    expect(result.total).toBe(9);
    result.hooks.forEach((h: any) => {
      expect(h.category).toBe('engine');
    });
  });

  test('listHooks filters by type action', () => {
    const result = listHooks(undefined, 'action');
    expect(result.total).toBeGreaterThan(40);
    result.hooks.forEach((h: any) => {
      expect(h.type).toMatch(/action/);
    });
  });

  test('getHookDetails returns content_after_add_approve', () => {
    const result = getHookDetails('content_after_add_approve');
    expect(result.name).toBe('content_after_add_approve');
    expect(result.type).toBe('action');
  });

  test('getHookDetails returns html_filter', () => {
    const result = getHookDetails('html_filter');
    expect(result.name).toBe('html_filter');
    expect(result.type).toBe('filter');
  });

  test('searchHooks finds hooks by keyword', () => {
    const result = searchHooks('user');
    expect(result.results.length).toBeGreaterThan(0);
  });
});

describe('Components Tool Extended', () => {
  const {
    getAddonStructure,
    getComponentApi,
    listComponents,
    getFieldTypes,
  } = require('../tools/addon-tool');

  test('getAddonStructure basic type', () => {
    const result = getAddonStructure('basic');
    expect(result.type).toBe('basic');
    expect(result.files.length).toBeGreaterThan(0);
  });

  test('getAddonStructure with_admin type', () => {
    const result = getAddonStructure('with_admin');
    expect(result.type).toBe('with_admin');
  });

  test('listComponents returns components object', () => {
    const result = listComponents();
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('components');
    expect(result.total).toBeGreaterThan(0);
  });

  test('getComponentApi returns cmsModel', () => {
    const result = getComponentApi('cmsModel');
    expect(result).toHaveProperty('name', 'cmsModel');
    expect(result.methods.length).toBeGreaterThan(30);
  });

  test('getComponentApi returns cmsTemplate', () => {
    const result = getComponentApi('cmsTemplate');
    expect(result).toHaveProperty('name', 'cmsTemplate');
  });

  test('getComponentApi returns error for unknown', () => {
    const result = getComponentApi('unknownClass');
    expect(result).toHaveProperty('error');
  });

  test('getFieldTypes returns field types object', () => {
    const result = getFieldTypes();
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('field_types');
    expect(result.total).toBeGreaterThan(0);
  });
});

describe('Scaffold Tool', () => {
  const { scaffoldAddon, scaffoldTemplate } = require('../tools/scaffold-tool');

  test('scaffoldAddon returns files object', () => {
    const result = scaffoldAddon({
      name: 'test_addon',
      title: 'Test Addon',
    });
    expect(result).toHaveProperty('addon_name');
    expect(result).toHaveProperty('files');
    expect(result.addon_name).toBe('test_addon');
    expect(result.files_count).toBeGreaterThan(0);
  });

  test('scaffoldAddon includes backend for with_admin type', () => {
    const result = scaffoldAddon({
      name: 'test_addon',
      title: 'Test Addon',
      type: 'with_admin',
    });
    expect(result.type).toBe('with_admin');
    const backendKey = Object.keys(result.files).find(k => k.endsWith('backend.php'));
    expect(backendKey).toBeTruthy();
  });

  test('scaffoldAddon includes hooks if specified', () => {
    const result = scaffoldAddon({
      name: 'test_addon',
      title: 'Test Addon',
      hooks: ['content_after_add_approve'],
    });
    expect(JSON.stringify(result.files)).toContain('content_after_add_approve');
  });

  test('scaffoldTemplate returns template structure', () => {
    const result = scaffoldTemplate({
      name: 'test_template',
      title: 'Test Template',
    });
    expect(result).toHaveProperty('template_name');
    expect(result).toHaveProperty('files');
    expect(result.template_name).toBe('test_template');
  });
});
