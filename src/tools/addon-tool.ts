import {
  addonStructures,
  fieldTypes,
  controllerDirectoryLayout,
  classNamingConventions,
} from '../data/schemas.js';
import { components } from '../data/components.js';
import { hooks } from '../data/hooks.js';

export function getAddonStructure(addonType: string = 'basic'): object {
  const structure = addonStructures[addonType];

  if (!structure) {
    return {
      error: `Тип дополнения "${addonType}" не найден`,
      available_types: Object.keys(addonStructures),
    };
  }

  return {
    type: structure.type,
    description: structure.description,
    notes: structure.notes || [],
    available_types: Object.keys(addonStructures).map(t => ({
      key: t,
      description: addonStructures[t].description,
    })),
    files: structure.files.map(f => ({
      path: f.path,
      required: f.required,
      description: f.description,
      template: f.template,
    })),
    directory_layout: controllerDirectoryLayout,
    naming_conventions: classNamingConventions,
    db_conventions: {
      table_naming: 'Таблицы: {addon_name}_{entity}. Пример: catalog_items, catalog_categories',
      prefix:
        'Префикс из конфига: в install.php используйте $this->db->prefix, в SQL-запросах — {prefix}',
      common_fields: {
        id: 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY',
        user_id: 'INT UNSIGNED — ID автора',
        date_pub: 'DATETIME — дата публикации',
        is_pub: 'TINYINT(1) — статус (1=опубликован, 0=скрыт)',
        title: 'VARCHAR(255) — заголовок',
        ordering: 'INT UNSIGNED — порядок сортировки (для drag&drop в гридах)',
      },
    },
    url_structure: {
      frontend: '/{addon_name}/{action}/{param}',
      backend: '/admin/{addon_name}/{action}/{param}',
      examples: [
        '/{name}/ → action index (actions/index.php)',
        "/{name}/view/123 → action view (actions/view.php), request->get('id')=123",
        '/admin/{name}/ → backend action index (backend/actions/index.php)',
        '/admin/{name}/items → backend action items (backend/actions/items.php)',
        "/admin/{name}/items/add → external_action_prefix='items_' → backend/actions/items_add.php",
        '/admin/{name}/items/edit/5 → backend/actions/items_add.php с params[0]=5',
      ],
    },
    language_files: {
      location: '/system/languages/{lang}/controllers/{name}/{name}.php',
      note: 'Языковые файлы расположены ВНЕ папки контроллера!',
      examples: [
        '/system/languages/ru/controllers/catalog/catalog.php',
        '/system/languages/en/controllers/catalog/catalog.php',
      ],
    },
    template_files: {
      frontend: '/templates/{theme}/controllers/{name}/{action}.tpl.php',
      backend: '/templates/admincoreui/controllers/{name}/{action}.tpl.php',
      widgets: '/templates/{theme}/controllers/{name}/{widget_name}.tpl.php',
    },
  };
}

export function getComponentApi(componentName: string): object {
  const lower = componentName.toLowerCase();
  const exact = components.filter(
    c => c.name.toLowerCase() === lower || c.class.toLowerCase() === lower
  );
  const partial = components.filter(
    c => c.name.toLowerCase().includes(lower) || c.class.toLowerCase().includes(lower)
  );
  const rawMatches = exact.length > 0 ? exact : partial;
  const matches = rawMatches.filter(
    (component, index, all) =>
      all.findIndex(item => item.name === component.name && item.class === component.class) ===
      index
  );

  if (matches.length === 0) {
    return {
      code: 'COMPONENT_NOT_FOUND',
      error: `Компонент "${componentName}" не найден`,
      available: components.map(c => ({
        name: c.name,
        class: c.class,
        description: c.description.slice(0, 80),
      })),
    };
  }

  if (matches.length > 1) {
    return {
      code: 'AMBIGUOUS_COMPONENT',
      error: `Запрос "${componentName}" соответствует нескольким компонентам`,
      candidates: matches.map(c => ({ name: c.name, class: c.class })),
    };
  }

  const [component] = matches;

  return {
    name: component.name,
    class: component.class,
    description: component.description,
    access: component.access,
    methods: component.methods,
  };
}

export function listComponents(): object {
  return {
    total: components.length,
    components: components.map(c => ({
      name: c.name,
      class: c.class,
      description: c.description,
      methods_count: c.methods.length,
      access: c.access,
    })),
  };
}

export function validateAddon(structure: Record<string, string>): object {
  const normalized: Record<string, string> = {};
  for (const [originalPath, content] of Object.entries(structure)) {
    const path = originalPath.replace(/\\/g, '/').replace(/^\.\//, '');
    normalized[path] = content;
    const controllerMatch = path.match(/(?:^|\/)controllers\/[^/]+\/(.+)$/);
    if (controllerMatch) normalized[controllerMatch[1]] ??= content;
    const languageMatch = path.match(/(?:^|\/)(languages\/.+)$/);
    if (languageMatch) normalized[languageMatch[1]] ??= content;
  }
  structure = normalized;
  const errors: string[] = [];
  const warnings: string[] = [];
  const tips: string[] = [];

  const files = Object.keys(structure);
  const addonName = extractAddonName(structure);

  // Обязательные файлы
  const required = ['manifest.xml', 'install.php', 'uninstall.php', 'frontend.php'];
  for (const req of required) {
    if (!files.includes(req)) {
      errors.push(`Отсутствует обязательный файл: ${req}`);
    }
  }

  // Проверки manifest.xml
  if (structure['manifest.xml']) {
    const manifest = structure['manifest.xml'];

    // Базовые теги
    if (!manifest.includes('<name>')) {
      errors.push('manifest.xml: отсутствует тег <name>');
    }
    if (!manifest.includes('<title>')) {
      errors.push('manifest.xml: отсутствует тег <title>');
    }
    if (!manifest.includes('<version>')) {
      warnings.push('manifest.xml: рекомендуется указать <version>');
    }
    if (!manifest.includes('<author>')) {
      warnings.push('manifest.xml: рекомендуется указать <author>');
    }
    if (!manifest.includes('<description>')) {
      warnings.push('manifest.xml: рекомендуется указать <description>');
    }

    // Проверка хуков в manifest
    const manifestHooks = extractHooksFromManifest(manifest);
    if (manifestHooks.length > 0) {
      const validHooks = hooks.map(h => h.name);
      for (const hookName of manifestHooks) {
        if (!validHooks.includes(hookName)) {
          warnings.push(`manifest.xml: хук "${hookName}" не найден в системе. Возможно опечатка?`);
        }
      }
    }

    // Проверка permissions
    const permissions = extractPermissionsFromManifest(manifest);
    if (permissions.length > 0) {
      tips.push(`permissions: найдено ${permissions.length} прав (${permissions.join(', ')})`);
    }

    // Проверка зависимостей
    if (manifest.includes('<dependencies>')) {
      tips.push('manifest.xml: есть зависимости от других компонентов');
    }
  }

  // Проверки frontend.php
  if (structure['frontend.php']) {
    const frontend = structure['frontend.php'];
    if (!frontend.includes('cmsFrontend') && !frontend.includes('cmsController')) {
      errors.push('frontend.php: класс должен наследовать cmsFrontend или cmsController');
    }
    if (!frontend.includes('actionIndex') && !frontend.includes('function action')) {
      warnings.push('frontend.php: нет ни одного action-метода (actionIndex и т.д.)');
    }
    // Проверка неймспейса
    if (!frontend.includes('namespace') && !frontend.includes('class ')) {
      warnings.push('frontend.php: рекомендуется использовать неймспейсы');
    }
  }

  // Проверки backend.php
  if (structure['backend.php']) {
    const backend = structure['backend.php'];
    if (!backend.includes('cmsBackend')) {
      errors.push('backend.php: класс должен наследовать cmsBackend');
    }
  }

  // Проверки install.php
  if (structure['install.php']) {
    const install = structure['install.php'];
    if (!install.includes('cmsInstaller')) {
      errors.push('install.php: класс должен наследовать cmsInstaller');
    }
    if (!install.includes('public function install()')) {
      errors.push('install.php: отсутствует метод install()');
    }
    // Проверка создания таблиц
    if (!install.includes('createTable') && !install.includes('query')) {
      warnings.push('install.php: не найдено создание таблиц (createTable или query)');
    }
  }

  // Проверки uninstall.php
  if (structure['uninstall.php']) {
    const uninstall = structure['uninstall.php'];
    if (!uninstall.includes('cmsInstaller')) {
      errors.push('uninstall.php: класс должен наследовать cmsInstaller');
    }
    if (!uninstall.includes('public function uninstall()')) {
      errors.push('uninstall.php: отсутствует метод uninstall()');
    }
    // Проверка удаления таблиц
    if (!uninstall.includes('dropTable')) {
      warnings.push('uninstall.php: не найдено удаление таблиц (dropTable)');
    }
  }

  // Проверки хуков
  const hookFiles = files.filter(f => f.startsWith('hooks/'));
  for (const hookFile of hookFiles) {
    const content = structure[hookFile];
    if (content && !content.includes('extends cmsAction')) {
      errors.push(`${hookFile}: класс хука должен наследовать cmsAction`);
    }
    if (content && !content.includes('public function run(')) {
      errors.push(`${hookFile}: отсутствует метод run($data)`);
    }
    if (content && !content.includes('return $data')) {
      warnings.push(`${hookFile}: метод run() должен возвращать $data`);
    }

    // Извлекаем имя хука из имени файла
    const hookFileName = hookFile.replace('hooks/', '').replace('.php', '');
    const hookMatch = hookFileName.match(/^on(\w+)(.+)$/i);
    if (hookMatch && addonName) {
      const expectedHook = hookMatch[2]
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
      const validHook = hooks.find(h => h.name === expectedHook);
      if (validHook) {
        tips.push(`${hookFile}: хук "${expectedHook}" найден в системе`);
      }
    }
  }

  // Проверки форм
  const formFiles = files.filter(f => f.startsWith('forms/'));
  for (const formFile of formFiles) {
    const content = structure[formFile];
    if (content && !content.includes('extends cmsForm')) {
      errors.push(`${formFile}: класс формы должен наследовать cmsForm`);
    }
    if (content && !content.includes('public function init(')) {
      errors.push(`${formFile}: отсутствует метод init() с полями формы`);
    }
  }

  // Проверки модели
  if (structure['model.php']) {
    const model = structure['model.php'];
    if (!model.includes('cmsModel')) {
      warnings.push('model.php: рекомендуется наследовать cmsModel');
    }
  }

  // Проверки языковых файлов
  if (!files.some(f => f.startsWith('languages/'))) {
    warnings.push('Нет языковых файлов в languages/. Рекомендуется добавить languages/ru/lang.php');
  }

  // Проверка версии PHP
  if (structure['manifest.xml'] && structure['manifest.xml'].includes('<php_version>')) {
    const phpMatch = structure['manifest.xml'].match(/<php_version>([^<]+)<\/php_version>/);
    if (phpMatch) {
      const minVersion = phpMatch[1];
      if (compareVersions(minVersion, '7.2.0') < 0) {
        errors.push(
          `manifest.xml: минимальная версия PHP ${minVersion} ниже поддерживаемой (7.2.0)`
        );
      }
    }
  }

  // Советы
  if (!files.some(f => f.startsWith('widgets/'))) {
    tips.push('Рассмотрите добавление виджета в widgets/ для размещения на страницах');
  }
  if (!structure['routes.php']) {
    tips.push('Если нужны кастомные URL — добавьте routes.php');
  }
  if (!structure['model.php']) {
    tips.push('Рекомендуется создать model.php для работы с базой данных');
  }
  if (files.some(f => f.endsWith('.php') && !f.includes('/'))) {
    warnings.push(
      'PHP файлы в корневой директории. Все файлы должны быть внутри system/controllers/{addon}/'
    );
  }

  return {
    is_valid: errors.length === 0,
    files_checked: files.length,
    addon_name: addonName || 'не определено',
    errors,
    warnings,
    tips,
    diagnostics: [
      ...errors.map(message => ({ code: diagnosticCode(message), severity: 'error', message })),
      ...warnings.map(message => ({ code: diagnosticCode(message), severity: 'warning', message })),
      ...tips.map(message => ({ code: 'SUGGESTION', severity: 'tip', message })),
    ],
    summary:
      errors.length === 0
        ? `✓ Дополнение прошло валидацию (${warnings.length} предупреждений, ${tips.length} советов)`
        : `✗ Найдено ${errors.length} ошибок, ${warnings.length} предупреждений, ${tips.length} советов`,
    checked_categories: {
      required_files: required.every(f => files.includes(f)),
      manifest_valid: structure['manifest.xml']
        ? structure['manifest.xml'].includes('<name>') &&
          structure['manifest.xml'].includes('<title>')
        : false,
      hooks_valid:
        hookFiles.length === 0 ||
        hookFiles.every(
          f =>
            structure[f]?.includes('extends cmsAction') &&
            structure[f]?.includes('public function run')
        ),
      forms_valid:
        formFiles.length === 0 ||
        formFiles.every(
          f =>
            structure[f]?.includes('extends cmsForm') &&
            structure[f]?.includes('public function init')
        ),
    },
  };
}

function diagnosticCode(message: string): string {
  if (message.startsWith('Отсутствует обязательный файл:')) return 'MISSING_REQUIRED_FILE';
  if (message.includes('должен наследовать')) return 'INVALID_BASE_CLASS';
  if (message.includes('отсутствует метод')) return 'MISSING_REQUIRED_METHOD';
  if (message.startsWith('manifest.xml: отсутствует')) return 'MANIFEST_MISSING_ELEMENT';
  return 'VALIDATION_NOTICE';
}

function extractAddonName(structure: Record<string, string>): string | null {
  if (structure['manifest.xml']) {
    const match = structure['manifest.xml'].match(/<name>([^<]+)<\/name>/);
    if (match) return match[1];
  }
  if (structure['frontend.php']) {
    const match = structure['frontend.php'].match(/class\s+(\w+)\s+extends/);
    if (match) return match[1].replace('Controller', '').toLowerCase();
  }
  return null;
}

function extractHooksFromManifest(manifest: string): string[] {
  const hooks: string[] = [];
  const hookRegex = /<hook[^>]*name=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = hookRegex.exec(manifest)) !== null) {
    hooks.push(match[1]);
  }
  // Также ищем <hook event="...">
  const eventRegex = /<hook[^>]*event=["']([^"']+)["'][^>]*>/gi;
  while ((match = eventRegex.exec(manifest)) !== null) {
    hooks.push(match[1]);
  }
  return hooks;
}

function extractPermissionsFromManifest(manifest: string): string[] {
  const perms: string[] = [];
  const permRegex = /<item[^>]*name=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = permRegex.exec(manifest)) !== null) {
    perms.push(match[1]);
  }
  return perms;
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;
    if (partA > partB) return 1;
    if (partA < partB) return -1;
  }
  return 0;
}

export function getFieldTypes(fieldType?: string): object {
  if (fieldType) {
    const ft = fieldTypes[fieldType] || fieldTypes[`field${fieldType}`];
    if (!ft) {
      return {
        error: `Тип поля "${fieldType}" не найден`,
        available: Object.keys(fieldTypes),
      };
    }
    return { name: fieldType, ...ft };
  }

  return {
    total: Object.keys(fieldTypes).length,
    field_types: Object.entries(fieldTypes).map(([name, info]) => ({
      name,
      description: info.description,
      example: info.example,
    })),
    usage_note: 'Поля используются в классах форм (cmsForm). Экземпляры передаются в массив init()',
  };
}

export function getCodeExample(task: string): object {
  const lower = task.toLowerCase();

  const examples: Array<{
    keywords: string[];
    title: string;
    code: string;
    explanation: string;
    category: string;
  }> = [
    // СПИСКИ И ПАГИНАЦИЯ
    {
      keywords: ['список', 'items', 'list', 'страниц', 'paginat', 'index'],
      title: 'Список элементов с пагинацией',
      category: 'pagination',
      explanation: 'Паттерн получения постраничного списка из БД',
      code: `public function actionIndex() {
    $page    = $this->request->get('page', 1);
    $perpage = $this->options['perpage'] ?? 10;

    $this->model->filterEqual('is_pub', 1)->orderBy('date_pub', 'desc');

    $total = $this->model->getCount('myaddon_items');
    $items = $this->model->limitPage($page, $perpage)->get('myaddon_items');

    if (!$items && $page > 1) { return cmsCore::error404(); }

    return $this->cms_template->render('index', [
        'items'   => $items,
        'total'   => $total,
        'page'    => $page,
        'perpage' => $perpage,
    ]);
}`,
    },
    {
      keywords: ['один', 'item', 'detail', 'просмотр', 'view'],
      title: 'Просмотр одного элемента',
      category: 'item',
      explanation: 'Паттерн для страницы просмотра элемента',
      code: `public function actionView($id) {

    $item = $this->model
        ->filterEqual('id', $id)
        ->filterEqual('is_pub', 1)
        ->getItem('myaddon_items');

    if (!$item) { return cmsCore::error404(); }

    // Инкримент просмотров
    $this->model->increment('myaddon_items', $id, 'views');

    return $this->cms_template->render('view', [
        'item' => $item
    ]);
}`,
    },
    {
      keywords: ['join', 'связь', 'related', 'users', 'user_id'],
      title: 'Получение элементов с данными пользователя',
      category: 'joins',
      explanation: 'JOIN с таблицей пользователей для получения nickname',
      code: `$items = $this->model
    ->select('i.*')
    ->select('u.nickname as user_nickname', 'u.avatar as user_avatar')
    ->join('users u', 'u.id = i.user_id')
    ->filterEqual('i.is_pub', 1)
    ->orderBy('i.date_pub', 'desc')
    ->limit(20)
    ->get('myaddon_items i');

// В шаблоне: $item['user_nickname'], $item['user_avatar']`,
    },
    {
      keywords: ['группировка', 'group', 'count', 'groupBy', 'статистика'],
      title: 'Группировка и подсчёт',
      category: 'aggregation',
      explanation: 'GROUP BY для статистики',
      code: `$stats = $this->model
    ->select('category_id')
    ->select('COUNT(*) as cnt')
    ->groupBy('category_id')
    ->orderBy('cnt', 'desc')
    ->get('myaddon_items');

// Результат: [['category_id' => 1, 'cnt' => 15], ...]`,
    },
    // AJAX И JSON
    {
      keywords: ['ajax', 'json', 'fetch', 'запрос', 'api'],
      title: 'Обработка AJAX запроса',
      category: 'ajax',
      explanation: 'Паттерн для AJAX action, возвращающего JSON',
      code: `public function actionSave() {

    if (!$this->request->isPost() || !$this->request->isAjax()) {
        return $this->renderJSON(['error' => 'Bad request']);
    }

    $title = $this->request->post('title', '');

    if (empty($title)) {
        return $this->renderJSON(['error' => 'Заголовок обязателен']);
    }

    $id = $this->model->insert('myaddon_items', [
        'title'    => $title,
        'user_id'  => $this->cms_user->id,
        'date_pub' => date('Y-m-d H:i:s'),
        'is_pub'   => 1
    ]);

    return $this->renderJSON([
        'success' => true,
        'id'      => $id
    ]);
}`,
    },
    {
      keywords: ['удалить', 'delete', 'del'],
      title: 'AJAX удаление элемента',
      category: 'ajax',
      explanation: 'Удаление с проверкой прав и AJAX ответом',
      code: `public function actionDelete() {

    if (!$this->request->isAjax()) {
        return $this->renderJSON(['error' => 'Bad request']);
    }

    $id = $this->request->get('id', 0);

    $item = $this->model->getItemByField('myaddon_items', 'id', $id);
    if (!$item) {
        return $this->renderJSON(['error' => 'Элемент не найден']);
    }

    // Проверка прав
    if ($item['user_id'] !== $this->cms_user->id && !$this->cms_user->is_admin) {
        return $this->renderJSON(['error' => 'Нет прав']);
    }

    $this->model->delete('myaddon_items', $id);

    return $this->renderJSON(['success' => true]);
}`,
    },
    // ФОРМЫ
    {
      keywords: ['форм', 'form', 'валидац', 'add', 'create'],
      title: 'Обработка формы добавления',
      category: 'forms',
      explanation: 'Паттерн для страницы с формой добавления',
      code: `public function actionAdd() {

    $form = $this->makeForm('form_item');

    if ($this->request->isPost()) {

        $item_data = $form->parse($this->request->data('post'));

        if ($form->validate($item_data)) {

            $item_data['user_id']  = $this->cms_user->id;
            $item_data['date_pub'] = date('Y-m-d H:i:s');

            $id = $this->model->insert('myaddon_items', $item_data);

            return $this->redirect($this->href_to('view', $id));
        }
    }

    $this->cms_template->setTitle('Добавить элемент');

    return $this->cms_template->render('add', [
        'form' => $form->render()
    ]);
}`,
    },
    {
      keywords: ['edit', 'редактир', 'update', 'изменить'],
      title: 'Форма редактирования',
      category: 'forms',
      explanation: 'Паттерн для редактирования существующего элемента',
      code: `public function actionEdit($id) {

    $item = $this->model->getItemByField('myaddon_items', 'id', $id);
    if (!$item) { return cmsCore::error404(); }

    // Проверка прав
    if ($item['user_id'] !== $this->cms_user->id && !$this->cms_user->is_admin) {
        return cmsCore::error403();
    }

    $form = $this->makeForm('form_item');

    if ($this->request->isPost()) {

        $item_data = $form->parse($this->request->data('post'));

        if ($form->validate($item_data)) {
            $this->model->update('myaddon_items', $id, $item_data);
            return $this->redirect($this->href_to('view', $id));
        }
    }

    return $this->cms_template->render('edit', [
        'form' => $form->render($item),
        'item'  => $item
    ]);
}`,
    },
    // КЭШИРОВАНИЕ
    {
      keywords: ['кэш', 'cache', 'кэшировани'],
      title: 'Кэширование данных',
      category: 'cache',
      explanation: 'Паттерн get-or-set кэширования',
      code: `public function getPopularItems(): array {

    $cache = cmsCache::getInstance();
    $key   = 'myaddon.popular.list';

    $items = $cache->get($key);

    if ($items === false) {
        $items = $this->model
            ->filterEqual('is_pub', 1)
            ->orderBy('views', 'desc')
            ->limit(10)
            ->get('myaddon_items');

        $cache->set($key, $items, 3600);
    }

    return $items ?: [];
}`,
    },
    {
      keywords: ['cache set', 'cache get', 'cache clean', 'cmscache'],
      title: 'cmsCache API — set, get, clean',
      category: 'cache',
      explanation: 'Базовые операции с кэшем',
      code: `$cache = cmsCache::getInstance();

// SET — записать в кэш (TTL в секундах)
$cache->set('my_key', $data, 3600);  // 1 час
$cache->set('my_key', $data, 86400); // 1 день

// GET — получить из кэша (false если нет)
$data = $cache->get('my_key');
if ($data === false) {
    // Ключ не найден или истёк
    $data = $this->loadFromDb();
    $cache->set('my_key', $data, 3600);
}

// CLEAN — очистить кэш по ключу
$cache->clean('my_key');              // один ключ
$cache->clean('myaddon.items');       // все ключи начинающиеся с 'myaddon.items'
$cache->clean();                      // ОЧИСТИТЬ ВЕСЬ КЭШ (осторожно!)`,
    },
    {
      keywords: ['cache pause', 'cache resume', 'отключить кэш'],
      title: 'Временное отключение кэша',
      category: 'cache',
      explanation: 'pause/resume для массовых операций',
      code: `// Отключить кэширование во время массовой операции
$cache = cmsCache::getInstance();
$cache->pause();  // Кэширование отключено

// ... массовая вставка/обновление ...
foreach ($items as $item) {
    $this->model->insert('myaddon_items', $item);
}

$cache->resume(); // Восстановить кэширование

// После resume старые ключи остаются, но будут обновлены при следующем get/set`,
    },
    {
      keywords: ['cache options', 'cache_path', 'cache_ttl'],
      title: 'Настройки кэширования',
      category: 'cache',
      explanation: 'Конфигурация cache_method, cache_ttl',
      code: `// system/config/autoload.php или в cmsConfig:
$cfg = [
    'cache_enabled' => true,
    'cache_method'  => 'files',    // files, redis, memcache, memcached
    'cache_ttl'     => 3600,      // TTL по умолчанию (1 час)
    'cache_path'    => '/tmp/icms_cache/'
];

// Проверка в коде:
if (cmsConfig::get('cache_enabled')) {
    $cache = cmsCache::getInstance();
    // ...
}`,
    },
    {
      keywords: ['cache redis', 'memcache', 'memcached'],
      title: 'Redis/Memcached кэш',
      category: 'cache',
      explanation: 'Использование Redis или Memcached',
      code: `// В config/autoload.php:
$cfg = [
    'cache_enabled' => true,
    'cache_method'  => 'redis',      // redis, memcache, memcached
    'cache_ttl'     => 7200,
    'cache_host'    => '127.0.0.1',
    'cache_port'    => 6379
];

// API одинаковый для всех методов:
$cache = cmsCache::getInstance();
$cache->set('key', $data, 3600);
$data = $cache->get('key');
$cache->clean('key');`,
    },
    {
      keywords: ['cache page', 'page cache', 'старт стоп'],
      title: 'Кэширование страниц',
      category: 'cache',
      explanation: 'start/stop для полного кэширования страницы',
      code: `// В bootstrap.php или начале action:
cmsCache::getInstance()->start();

// ... вся логика страницы ...

cmsCache::getInstance()->stop();

// Внимание: start/stop работают только если cache_method поддерживает это
// (не все cacher-ы имеют start/stop: Files — имеет, Redis — нет)`,
    },
    {
      keywords: ['cache dependency', 'depends', 'зависимос'],
      title: 'Инвалидация кэша при изменениях',
      category: 'cache',
      explanation: 'Чистка кэша при добавлении/редактировании/удалении',
      code: `// При добавлении элемента:
public function actionAdd() {
    // ... сохранение ...
    $id = $this->model->insert('myaddon_items', $data);
    
    // Чистим кэш списков
    cmsCache::getInstance()->clean('myaddon.list');
    cmsCache::getInstance()->clean('myaddon.popular');
    
    return $this->redirect(...);
}

// При редактировании:
public function actionEdit($id) {
    // ... обновление ...
    $this->model->update('myaddon_items', $id, $data);
    
    // Чистим кэш конкретного элемента и списков
    cmsCache::getInstance()->clean('myaddon.item.' . $id);
    cmsCache::getInstance()->clean('myaddon.list');
    
    return $this->redirect(...);
}

// При удалении:
public function actionDelete($id) {
    $this->model->delete('myaddon_items', $id);
    
    cmsCache::getInstance()->clean('myaddon.item.' . $id);
    cmsCache::getInstance()->clean('myaddon.list');
    cmsCache::getInstance()->clean('myaddon.popular');
}`,
    },
    {
      keywords: ['cache tag', 'key pattern', 'group'],
      title: 'Именование ключей кэша',
      category: 'cache',
      explanation: 'Соглашение об именовании для групповой инвалидации',
      code: `// Соглашение: используйте точки для группировки
// Формат: {addon}.{entity}.{specific}

// Группы:
myaddon.list              — список всех элементов
myaddon.item.{id}         — конкретный элемент
myaddon.popular           — популярные элементы  
myaddon.categories        — категории
myaddon.user.{id}         — данные пользователя

// Примеры использования:
$cache->set('myaddon.list', $items, 3600);
$cache->set('myaddon.item.' . $id, $item, 7200);
$cache->set('myaddon.popular', $popular, 1800);

// Чистка группы:
$cache->clean('myaddon'); // Чистит ВСЕ ключи myaddon.*`,
    },
    // ХУКИ И СОБЫТИЯ
    {
      keywords: ['хук', 'hook', 'событи', 'event'],
      title: 'Создание и вызов хука',
      category: 'hooks',
      explanation: 'Как добавить свои хуки для расширяемости',
      code: `// 1. Запуск хука:
$item = cmsEventsManager::hook('myaddon_before_item', $item);

// 2. В manifest.xml:
<hooks>
    <hook event="myaddon_before_item" />
</hooks>

// 3. Реализация хука:
class onMyaddonBeforeItem extends cmsAction {
    public function run($data) {
        $item = $data['item'];
        $item['custom_field'] = 'processed';
        return $data;
    }
}`,
    },
    // ПРАВА ДОСТУПА
    {
      keywords: ['прав', 'перм', 'permission', 'acl', 'доступ', 'is_admin'],
      title: 'Проверка прав доступа',
      category: 'permissions',
      explanation: 'Работа с системой прав пользователей',
      code: `public function actionSecure() {

    if (!$this->cms_user->is_logged) {
        return $this->redirect(href_to('auth', 'login'));
    }

    if (!$this->cms_user->checkAccess('myaddon', 'can_post')) {
        return $this->cms_template->render('no_access');
    }

    if (!$this->cms_user->isInGroup('admins')) {
        return cmsCore::error404();
    }

    return $this->cms_template->render('secure_page');
}`,
    },
    // ФАЙЛЫ И ИЗОБРАЖЕНИЯ
    {
      keywords: ['файл', 'upload', 'загруз', 'изображ', 'image', 'file'],
      title: 'Загрузка файлов/изображений',
      category: 'files',
      explanation: 'Работа с загрузкой файлов через поле fieldImage',
      code: `// В форме:
new fieldImage('photo', [
    'title'     => 'Фото',
    'max_width' => 800,
    'max_height'=> 600,
    'max_size'  => 2048
]),

// В контроллере:
public function actionAdd() {
    $form = $this->makeForm('form_item');
    if ($this->request->isPost()) {
        $item_data = $form->parse($this->request->data('post'));
        // $item_data['photo'] содержит путь к файлу
    }
}`,
    },
    // RSS
    {
      keywords: ['rss', 'feed', 'лент'],
      title: 'RSS лента',
      category: 'rss',
      explanation: 'Генерация RSS ленты для контента',
      code: `public function actionRss() {

    $items = $this->model
        ->filterEqual('is_pub', 1)
        ->orderBy('date_pub', 'desc')
        ->limit(20)
        ->get('myaddon_items');

    $feed = [
        'title'       => cmsConfig::get('sitename') . ' - ' . $this->options['title'],
        'description' => $this->options['description'],
        'link'        => cmsConfig::get('root_domain'),
        'language'    => 'ru',
        'items'       => []
    ];

    foreach ($items as $item) {
        $feed['items'][] = [
            'title'       => $item['title'],
            'link'        => href_to($this->name, 'view', $item['id']),
            'description' => $item['description'],
            'pubDate'    => $item['date_pub']
        ];
    }

    return $this->cms_template->renderRSS($feed);
}`,
    },
    // SITEMAP
    {
      keywords: ['sitemap', 'site', 'map', 'поисковик', 'seo'],
      title: 'Генерация sitemap',
      category: 'sitemap',
      explanation: 'Интеграция с модулем sitemap',
      code: `// 1. В manifest.xml:
<hooks>
    <hook event="sitemap_sources" />
    <hook event="sitemap_urls" />
</hooks>

// 2. hooks/sitemap_sources.php:
class onMyaddonSitemapSources extends cmsAction {
    public function run($data) {
        $data['sources'][] = [
            'name'   => $this->name,
            'title'  => $this->options['title'],
            'urls'   => href_to($this->name)
        ];
        return $data;
    }
}

// 3. hooks/sitemap_urls.php:
class onMyaddonSitemapUrls extends cmsAction {
    public function run($data) {
        $items = $this->model
            ->filterEqual('is_pub', 1)
            ->orderBy('date_pub', 'desc')
            ->limit(1000)
            ->get('myaddon_items');

        foreach ($items as $item) {
            $data['urls'][] = [
                'loc'        => href_to($this->name, 'view', $item['id']),
                'lastmod'    => $item['date_pub'],
                'priority'   => 0.7,
                'changefreq' => 'weekly'
            ];
        }
        return $data;
    }
}`,
    },
    // ПОИСК
    {
      keywords: ['search', 'поиск', 'fulltext', 'найти'],
      title: 'Интеграция с поиском',
      category: 'search',
      explanation: 'Добавление контента в поисковый индекс',
      code: `// 1. manifest.xml:
<hooks>
    <hook event="search_sources" />
    <hook event="search_item" />
    <hook event="delete_item" />
</hooks>

// 2. hooks/search_sources.php:
class onMyaddonSearchSources extends cmsAction {
    public function run($data) {
        $data['sources'][] = [
            'name'  => $this->name,
            'url'   => href_to($this->name),
            'item_url' => href_to($this->name, 'view', '%id%')
        ];
        return $data;
    }
}

// 3. hooks/search_item.php:
class onMyaddonSearchItem extends cmsAction {
    public function run($data) {
        if ($data['ctype_name'] !== $this->name) { return $data; }
        
        $item = $this->model->getItemByField('myaddon_items', 'id', $data['item_id']);
        if ($item) {
            $data['title'] = $item['title'];
            $data['content'] = $item['description'] . ' ' . $item['content'];
        }
        return $data;
    }
}`,
    },
    // ТЕГИ
    {
      keywords: ['tag', 'тег', 'tags'],
      title: 'Работа с тегами',
      category: 'tags',
      explanation: 'Интеграция с системой тегов',
      code: `// 1. manifest.xml:
<hooks>
    <hook event="tagsdelete" />
</hooks>

// 2. При сохранении элемента - привязка тегов:
$tags = $this->request->post('tags', []);
cmsCore::getModel('tags')->bindTags($tags, $item_id, $this->name);

// 3. При удалении - очистка тегов:
$this->model->deleteFiltered('tags_items', ['target_id' => $item_id]);`,
    },
    // КАТЕГОРИИ
    {
      keywords: ['categor', 'категор', 'parent'],
      title: 'Иерархия категорий',
      category: 'categories',
      explanation: 'Работа с вложенными категориями',
      code: `// Получить дерево категорий:
$cats = $this->model->getCategoriesTree($ctype['name']);

// Формат результата:
[
    ['id' => 1, 'title' => 'Parent', 'level' => 0, 'children' => [
        ['id' => 2, 'title' => 'Child', 'level' => 1, 'children' => []]
    ]]
]

// Получить категорию с родителями:
$path = $this->model->getCategoryPath($category_id);

// ID всех потомков категории:
$child_ids = $this->model->getCategoryChildren($category_id);`,
    },
    // РЕЙТИНГ
    {
      keywords: ['rating', 'рейтинг', 'голос'],
      title: 'Интеграция с рейтингом',
      category: 'rating',
      explanation: 'Добавление голосования к элементам',
      code: `// 1. manifest.xml:
<hooks>
    <hook event="rating_vote" />
</hooks>

// 2. hooks/rating_vote.php:
class onMyaddonRatingVote extends cmsAction {
    public function run($data) {
        if ($data['target'] !== $this->name) { return $data; }
        
        $this->model->increment('myaddon_items', $data['target_id'], 'rating_sum', $data['vote']);
        $this->model->increment('myaddon_items', $data['target_id'], 'rating_count', 1);
        
        return $data;
    }
}`,
    },
    // КОММЕНТАРИИ
    {
      keywords: ['comment', 'коммент'],
      title: 'Интеграция с комментариями',
      category: 'comments',
      explanation: 'Включение комментариев к элементам',
      code: `// 1. manifest.xml:
<hooks>
    <hook event="comments_count" />
</hooks>

// 2. В типе контента включить комментарии в админке

// 3. hooks/comments_count.php:
class onMyaddonCommentsCount extends cmsAction {
    public function run($data) {
        if ($data['ctype_name'] !== $this->name) { return $data; }
        
        $count = $this->model->getCommentsCount($data['item_id']);
        $data['comments_count'] = $count;
        return $data;
    }
}`,
    },
    // УВЕДОМЛЕНИЯ
    {
      keywords: ['notice', 'уведомл', 'email', 'notification'],
      title: 'Отправка уведомлений',
      category: 'notifications',
      explanation: 'Отправка email и in-site уведомлений',
      code: `// Email уведомление:
cmsCore::sendEmail([
    'to'      => $user_email,
    'subject' => 'Новое уведомление',
    'body'    => "Привет, {$user_name}!\\n\\n{$message}"
], $this->cms_config);

// In-site уведомление:
cmsCore::getController('messages')->addNotice($user_id, 'myaddon_notification', [
    'content' => $message,
    'options' => ['link' => href_to($this->name, 'view', $item_id)]
]);`,
    },
    // SEO
    {
      keywords: ['seo', 'meta', 'title', 'description', 'og'],
      title: 'SEO метатеги',
      category: 'seo',
      explanation: 'Настройка метатегов для страниц',
      code: `// В action:
public function actionView($id) {
    $item = $this->model->getItemByField('myaddon_items', 'id', $id);
    if (!$item) { return cmsCore::error404(); }

    $this->cms_template->setPageTitle($item['title']);
    $this->cms_template->setPageDescription($item['description']);
    $this->cms_template->addHeadOpenGraph([
        'og:title'       => $item['title'],
        'og:description' => $item['description'],
        'og:image'        => $item['photo'] ? cmsConfig::get('uploads_url') . '/' . $item['photo'] : '',
        'og:url'          => href_to($this->name, 'view', $item['id'])
    ]);

    return $this->cms_template->render('view', ['item' => $item]);
}`,
    },
    // CRUD COMPLETE
    {
      keywords: ['crud', 'create', 'read', 'update', 'delete', 'полный'],
      title: 'Полный CRUD контроллер',
      category: 'crud',
      explanation: 'Шаблон минимального CRUD контроллера',
      code: `class myaddon extends cmsFrontend {

    // Список
    public function actionIndex() {
        $page = $this->request->get('page', 1);
        $total = $this->model->getCount('myaddon_items');
        $items = $this->model->limitPage($page, 10)->get('myaddon_items');
        return $this->cms_template->render('index', ['items' => $items, 'total' => $total]);
    }

    // Просмотр
    public function actionView($id) {
        $item = $this->model->getItemByField('myaddon_items', 'id', $id);
        if (!$item) { return cmsCore::error404(); }
        return $this->cms_template->render('view', ['item' => $item]);
    }

    // Добавление
    public function actionAdd() {
        if ($this->request->isPost()) {
            $id = $this->model->insert('myaddon_items', $this->request->data('post'));
            return $this->redirect(href_to($this->name, 'view', $id));
        }
        return $this->cms_template->render('add');
    }

    // Удаление
    public function actionDelete($id) {
        $this->model->delete('myaddon_items', $id);
        return $this->redirect(href_to($this->name));
    }
}`,
    },
    // МИГРАЦИЯ БД
    {
      keywords: ['migration', 'install', 'uninstall', 'sql', 'таблиц'],
      title: 'Создание таблиц при установке',
      category: 'migration',
      explanation: 'Пример install.php с созданием таблицы',
      code: `class installerMyaddon extends cmsInstaller {

    public function install() {

        // Создание таблицы
        $this->createTable('myaddon_items', [
            'id'          => 'INT UNSIGNED AUTO_INCREMENT PRIMARY KEY',
            'title'       => 'VARCHAR(255) NOT NULL',
            'description' => 'TEXT',
            'user_id'     => 'INT UNSIGNED DEFAULT NULL',
            'date_pub'    => 'DATETIME DEFAULT NULL',
            'is_pub'      => 'TINYINT(1) UNSIGNED DEFAULT 1',
            'ordering'    => 'INT UNSIGNED DEFAULT 0'
        ], 'Документы');

        // Добавление индекса
        $this->db->query("CREATE INDEX idx_user ON {myaddon_items} (user_id)");

        return true;
    }

    public function uninstall() {
        $this->dropTable('myaddon_items');
        return true;
    }
}`,
    },
    // SECURITY - XSS
    {
      keywords: ['xss', 'html', 'escape', 'безопасност', 'sanitize'],
      title: 'Защита от XSS',
      category: 'security',
      explanation: 'Фильтрация HTML и экранирование вывода',
      code: `// 1. В модели - валидация HTML:
public function validateHtml($content) {
    // Разрешённые теги
    $allowed = '<p><a><strong><em><ul><ol><li><br>';
    return strip_tags($content, $allowed);
}

// 2. В шаблоне - экранирование:
<?php html($item['content']); ?>
<?php htmlspecialchars($item['title'], ENT_QUOTES, 'UTF-8'); ?>

// 3. Не доверяйте пользовательскому вводу:
$title = strip_tags($this->request->get('title', ''));
$title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');`,
    },
    // SECURITY - CSRF
    {
      keywords: ['csrf', 'token', 'form', 'csrf_token'],
      title: 'Защита от CSRF',
      category: 'security',
      explanation: 'CSRF токен для форм и AJAX запросов',
      code: `// 1. В форме - добавление токена:
<form method="post">
    <?php csrf_field(); ?>
    <input type="text" name="title">
</form>

// 2. В AJAX - отправка токена:
$.ajax({
    url: '/myaddon/save',
    type: 'POST',
    data: {
        title: 'Test',
        csrf_token: '<?php cmsUser::csrfToken(); ?>'
    }
});

// 3. В контроллере - проверка:
if ($this->request->isPost()) {
    if (!cmsForm::validateCSRFToken($this->request->get('csrf_token'))) {
        return $this->renderJSON(['error' => 'Invalid token']);
    }
}`,
    },
    // SECURITY - SQL INJECTION
    {
      keywords: ['sql', 'injection', 'query', 'базы'],
      title: 'Защита от SQL Injection',
      category: 'security',
      explanation: 'Использование query builder вместо сырых запросов',
      code: `// ✅ ПРАВИЛЬНО - используйте model:
$items = $this->model
    ->filterEqual('user_id', $user_id)  // параметризованный запрос
    ->get('myaddon_items');

// ✅ JSON запросы через модель:
$id = $this->request->get('id', 0);
$item = $this->model->getItemByField('myaddon_items', 'id', (int)$id);

// ❌ НЕПРАВИЛЬНО - сырой запрос:
$query = "SELECT * FROM cms_myaddon WHERE id = " . $_GET['id']; // УЯЗВИМОСТЬ!

// ✅ Если нужен сырой запрос - используйте параметры:
$this->db->query("SELECT * FROM {myaddon_items} WHERE id = %d", $id);`,
    },
    // SECURITY - ACCESS CONTROL
    {
      keywords: ['access', 'rbac', 'роль', 'admin', 'moderator'],
      title: 'RBAC - Контроль доступа',
      category: 'security',
      explanation: 'Проверка прав по ролям и группам',
      code: `// 1. Проверка группы:
if (!$this->cms_user->isInGroup('admins')) {
    return cmsCore::error403();
}

// 2. Проверка прав компонента:
if (!$this->cms_user->checkAccess('myaddon', 'view')) {
    return cmsCore::error403();
}

// 3. Проверка владельца:
if ($item['user_id'] !== $this->cms_user->id && !$this->cms_user->is_admin) {
    return cmsCore::error403();
}

// 4. В manifest.xml - регистрация прав:
<permissions>
    <item name="view" title="Просмотр" />
    <item name="add" title="Добавление" />
    <item name="edit" title="Редактирование" />
    <item name="delete" title="Удаление" />
</permissions>`,
    },
    // SECURITY - FILE UPLOAD
    {
      keywords: ['upload', 'file', 'безопасн', 'extension'],
      title: 'Безопасная загрузка файлов',
      category: 'security',
      explanation: 'Проверка типа и размера файла',
      code: `// 1. Проверка расширения:
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
if (!in_array($ext, $allowed)) {
    return ['error' => 'Недопустимый тип файла'];
}

// 2. Проверка MIME типа:
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $tmp_name);
finfo_close($finfo);
$allowed_mime = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
if (!in_array($mime, $allowed_mime)) {
    return ['error' => 'Недопустимый тип файла'];
}

// 3. Проверка размера:
$max_size = 5 * 1024 * 1024; // 5MB
if ($file_size > $max_size) {
    return ['error' => 'Файл слишком большой'];
}

// 4. Генерация случайного имени:
$new_name = md5(uniqid()) . '.' . $ext;`,
    },
  ];

  const matched = examples.filter(ex => ex.keywords.some(kw => lower.includes(kw)));

  if (matched.length === 0) {
    return {
      message: 'Точный пример не найден. Доступные темы:',
      available_topics: examples.map(ex => ex.title),
      categories: [...new Set(examples.map(ex => ex.category))],
      tip: "Попробуйте: 'список', 'ajax', 'форма', 'кэш', 'права', 'rss', 'sitemap', 'поиск', 'теги', 'рейтинг', 'уведомления', 'crud', 'миграция'",
    };
  }

  return {
    query: task,
    found: matched.length,
    examples: matched.map(ex => ({
      title: ex.title,
      category: ex.category,
      explanation: ex.explanation,
      code: ex.code,
    })),
  };
}

export function scaffoldHook(params: {
  addon_name: string;
  hook_name: string;
  type?: 'action' | 'filter';
}): object {
  const { addon_name, hook_name, type = 'action' } = params;

  // Поиск хука в системе
  const systemHook = hooks.find(h => h.name === hook_name);

  // Генерация имени класса
  const className = buildHookClassName(addon_name, hook_name);

  // Путь к файлу
  const filePath = `hooks/${hook_name}.php`;

  // Генерация параметров для run метода
  let paramsCode = '';
  let paramsDoc = '';
  const returnCode = 'return $data;';

  if (systemHook) {
    const hookParams = systemHook.parameters;
    if (hookParams.length > 0 && hookParams[0].name !== '$data') {
      paramsDoc = hookParams.map(p => ` * @param ${p.type} ${p.name} ${p.description}`).join('\n');
      paramsCode = hookParams
        .map(p => {
          const paramName = p.name.startsWith('$') ? p.name.slice(1) : p.name;
          return `        ${paramName} = $data['${paramName}'] ?? null`;
        })
        .join(',\n');
    }
  }

  // Определение типа возврата
  const isFilter = systemHook?.type === 'filter' || type === 'filter';

  // Шаблон кода
  const code = `<?php

/**
 * ${systemHook?.description || `Хук: ${hook_name}`}
 * 
${paramsDoc}
 * @return ${isFilter ? 'mixed (для filter)' : 'void (для action)'}
 */
class ${className} extends cmsAction {

    public function run(${paramsCode ? '\n' + paramsCode + '\n    ' : ''}) {

${
  isFilter
    ? `        // Фильтр: модифицируйте $data и верните
        // Пример:
        // $data['key'] = 'new_value';
        ${returnCode}`
    : `        // Action: выполните действия
        // Не забудьте вернуть $data для цепочки хуков
        ${returnCode}`
}
    }

}`.trim();

  // manifest.xml запись
  const manifestEntry = `<hook controller="${addon_name}" name="${hook_name}" />`;

  // Языковой ключ
  const langKey = `${addon_name.toUpperCase()}_HOOK_${hook_name.toUpperCase().replace(/_/g, '_')}`;

  return {
    hook_name,
    hook_type: isFilter ? 'filter' : 'action',
    system_hook: systemHook
      ? {
          name: systemHook.name,
          category: systemHook.category,
          description: systemHook.description,
          parameters: systemHook.parameters,
          return_type: systemHook.return_type,
        }
      : null,
    addon_name,
    class_name: className,
    file_path: filePath,
    code,
    manifest_xml: manifestEntry,
    lang_key: langKey,
    usage: {
      step1: `Добавьте в manifest.xml:\n${manifestEntry}`,
      step2: `Создайте файл: ${filePath}`,
      step3: `Добавьте языковую константу в languages/ru/lang.php:\nLANG_${langKey} = 'Описание хука';`,
      step4: 'Перейдите в Панель управления → Дополнения и включите хук',
    },
  };
}

function buildHookClassName(addonName: string, hookName: string): string {
  // Преобразуем snake_case в CamelCase для hookName
  const hookParts = hookName.split('_');
  const camelHook = hookParts
    .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');

  return `on${addonName.charAt(0).toUpperCase() + addonName.slice(1)}${camelHook.charAt(0).toUpperCase() + camelHook.slice(1)}`;
}
