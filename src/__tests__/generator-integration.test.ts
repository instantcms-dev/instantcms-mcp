import { scaffoldAddon } from '../tools/scaffold-tool.js';
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

/**
 * ЧПУ дополнения: ядро вызывает route() только если экшен по имени не найден,
 * поэтому одного routes.php недостаточно — нужен и метод, и чтение параметров
 * маршрута из request (parseRoute кладёт их туда, а не в аргументы экшена).
 */
describe('addon routes', () => {
  test('with_routes добавляет метод route() в контроллер', () => {
    const result = scaffoldAddon({
      name: 'rtdemo',
      title: 'RT',
      type: 'with_routes',
    }) as { files: Record<string, string> };

    const frontend = result.files['package/system/controllers/rtdemo/frontend.php'];
    expect(frontend).toContain('public function route($uri)');
    expect(frontend).toContain('$this->parseRoute($uri)');
    expect(frontend).toContain('cmsCore::error404()');

    const withoutRoutes = scaffoldAddon({ name: 'rtdemo', title: 'RT', type: 'basic' }) as {
      files: Record<string, string>;
    };
    expect(withoutRoutes.files['package/system/controllers/rtdemo/frontend.php']).not.toContain(
      'function route('
    );
  });

  test('маршруты передают именованные параметры id и page', () => {
    const result = scaffoldAddon({
      name: 'rtdemo',
      title: 'RT',
      type: 'with_routes',
    }) as { files: Record<string, string> };

    const routes = result.files['package/system/controllers/rtdemo/routes.php'];
    expect(routes).toMatch(/pattern' => '\/\^\(\\d\+\)\\\.html\$\/i'/);
    expect(routes).toContain("1         => 'id'");
    expect(routes).toContain("1         => 'page'");
  });

  test('экшены читают параметры маршрута из запроса', () => {
    const result = scaffoldAddon({
      name: 'rtdemo',
      title: 'RT',
      type: 'with_routes',
    }) as { files: Record<string, string> };

    expect(result.files['package/system/controllers/rtdemo/actions/index.php']).toContain(
      "request->get('page', $page)"
    );
    expect(result.files['package/system/controllers/rtdemo/actions/view.php']).toContain(
      "request->get('id', $id)"
    );
  });
});
