import { scaffoldCrud } from '../tools/crud-tool.js';
import { scaffoldWidget } from '../tools/widget-tool.js';

/**
 * Связка генераторов: CRUD отдаёт контракт для scaffold_api, виджет
 * регистрируется в cms_widgets через отдельную функцию без конфликта имён.
 */
describe('generator integration', () => {
  const fields = [{ name: 'title', type: 'varchar', title: 'Заголовок' }];

  test('with_api_model добавляет контракт, который вызывают экшены API', () => {
    const result = scaffoldCrud({
      addon_name: 'demo',
      fields,
      options: { with_api_model: true },
    }) as { files: Record<string, string>; options_applied: Record<string, unknown> };

    const model = result.files['package/system/controllers/demo/model.php'];
    for (const method of [
      'getApiList',
      'getApiItem',
      'createApiItem',
      'updateApiItem',
      'deleteApiItem',
    ]) {
      expect(model).toContain(`function ${method}`);
    }

    expect(result.options_applied).toEqual({ with_api_model: true });
  });

  test('без with_api_model контракта в модели нет', () => {
    const result = scaffoldCrud({ addon_name: 'demo', fields }) as {
      files: Record<string, string>;
    };
    const model = result.files['package/system/controllers/demo/model.php'];

    expect(model).not.toContain('getApiList');
    expect(model).not.toContain('createApiItem');
  });

  test('контракт в модели не конфликтует с методами cmsModel', () => {
    const result = scaffoldCrud({
      addon_name: 'demo',
      fields,
      options: { with_api_model: true },
    }) as { files: Record<string, string> };
    const model = result.files['package/system/controllers/demo/model.php'];

    // getItem/getItemById принадлежат cmsModel — переопределять их нельзя.
    expect(model).not.toMatch(/function\s+getItem\s*\(/);
    expect(model).not.toMatch(/function\s+getItemById\s*\(/);
    expect(model).toContain("getItemById('demo_items', $id)");
  });

  test('виджет отдаёт функцию регистрации с уникальным именем', () => {
    const result = scaffoldWidget({
      addon_name: 'demo',
      widget_name: 'recent',
      options_config: { with_template: false },
    }) as { files: Record<string, string> };

    const installer = result.files['[pkg] install_widget.php'];
    expect(installer).toContain('function install_widget_demo_recent(array $install_options = [])');
    expect(installer).toContain("cmsCore::getModel('admin')");
    expect(installer).toContain("filterEqual('controller', 'demo')");
    expect(installer).toContain("insert('widgets'");
    // Идемпотентность: повторный вызов не создаёт вторую запись.
    expect(installer).toContain('if ($exists) {');
  });

  test('регистрация виджета не переопределяет install_package пакета', () => {
    const result = scaffoldWidget({
      addon_name: 'demo',
      widget_name: 'sidebar',
      options_config: { with_template: false },
    }) as { files: Record<string, string> };

    expect(Object.keys(result.files)).toContain('[pkg] install_widget.php');
    expect(Object.keys(result.files)).not.toContain('[pkg] install.php');
  });
});
