import { lazyModule } from '../utils/lazy-module.js';

const loadSchemas = lazyModule<typeof import('../data/schemas.js')>('../data/schemas.js');

export interface RequirementAnalysis {
  addon_type: 'basic' | 'with_admin' | 'with_hooks' | 'with_routes' | 'with_widget';
  suggested_name: string;
  suggested_title: string;
  description: string;
  features: string[];
  required_hooks: string[];
  suggested_tables: Array<{ name: string; fields: string[] }>;
  suggested_controllers: string[];
  estimated_complexity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export function analyzeRequirement(requirement: string): RequirementAnalysis {
  const lower = requirement.toLowerCase();

  const features: string[] = [];
  const requiredHooks: string[] = [];
  const suggestedTables: Array<{ name: string; fields: string[] }> = [];
  const recommendations: string[] = [];
  const suggestedControllers: string[] = [];

  let addonType: RequirementAnalysis['addon_type'] = 'basic';
  let complexity: RequirementAnalysis['estimated_complexity'] = 'low';

  const nameSuggestion = generateName(requirement);
  const titleSuggestion = generateTitle(requirement);

  if (
    lower.includes('админ') ||
    lower.includes('панель') ||
    lower.includes('backend') ||
    lower.includes('admin')
  ) {
    addonType = 'with_admin';
    complexity = 'medium';
    features.push('Админ-панель с CRUD');
    suggestedControllers.push('backend');
  }

  if (
    lower.includes('событи') ||
    lower.includes('хуки') ||
    lower.includes('hook') ||
    lower.includes('интеграц')
  ) {
    addonType = 'with_hooks';
    if (complexity === 'low') complexity = 'medium';
    features.push('Интеграция через хуки');
  }

  if (lower.includes('rss') || lower.includes('лента') || lower.includes('feed')) {
    requiredHooks.push('rss_feed_item');
    features.push('RSS лента');
  }

  if (lower.includes('sitemap') || lower.includes('поисковик')) {
    requiredHooks.push('sitemap_sources', 'sitemap_urls');
    features.push('Интеграция с sitemap');
  }

  if (lower.includes('поиск') || lower.includes('search')) {
    requiredHooks.push('search_sources', 'search_item');
    features.push('Полнотекстовый поиск');
    recommendations.push('Добавьте индексы для часто искомых полей');
  }

  if (lower.includes('тег') || lower.includes('tag')) {
    requiredHooks.push('tagsdelete');
    features.push('Система тегов');
  }

  if (lower.includes('рейтинг') || lower.includes('rating') || lower.includes('голос')) {
    requiredHooks.push('rating_vote');
    features.push('Рейтинг/голосование');
  }

  if (lower.includes('комментар') || lower.includes('comment')) {
    requiredHooks.push('comments_after_add');
    features.push('Комментарии');
  }

  if (lower.includes('уведомлен') || lower.includes('email') || lower.includes('notice')) {
    features.push('Уведомления (email, in-site)');
    recommendations.push(
      "Используйте cmsCore::sendEmail() и cmsCore::getController('messages')->addNotice()"
    );
  }

  if (lower.includes('категори') || lower.includes('иерархи')) {
    suggestedTables.push({
      name: 'categories',
      fields: ['id', 'parent_id', 'title', 'slug', 'ordering'],
    });
    features.push('Иерархия категорий');
  }

  if (lower.includes('пользовател') || lower.includes('user') || lower.includes('профил')) {
    suggestedControllers.push('users');
    features.push('Профили пользователей');
  }

  if (lower.includes('регистрац') || lower.includes('auth')) {
    requiredHooks.push('user_registered');
    suggestedControllers.push('auth');
    features.push('Авторизация/регистрация');
  }

  if (
    lower.includes('загруз') ||
    lower.includes('upload') ||
    lower.includes('файл') ||
    lower.includes('image')
  ) {
    features.push('Загрузка файлов/изображений');
    recommendations.push('Используйте fieldImage или fieldFile в формах');
  }

  if (lower.includes('кэш') || lower.includes('cache')) {
    features.push('Кэширование данных');
    recommendations.push('Используйте cmsCache::getInstance()->get()/set()');
  }

  if (lower.includes('cron') || lower.includes('планировщ') || lower.includes('schedul')) {
    requiredHooks.push('cron_run');
    features.push('Задачи по расписанию');
    recommendations.push('Добавьте запись в cms_scheduler_tasks');
  }

  if (
    lower.includes('REST') ||
    lower.includes('api') ||
    lower.includes('ajax') ||
    lower.includes('json')
  ) {
    features.push('API (AJAX/JSON endpoints)');
    recommendations.push('Используйте $this->renderJSON() для AJAX ответов');
    addonType = 'with_routes';
  }

  if (lower.includes('виджет') || lower.includes('widget')) {
    addonType = 'with_widget';
    features.push('Виджет для размещения на страницах');
  }

  if (
    lower.includes('каталог') ||
    lower.includes('товар') ||
    lower.includes('product') ||
    lower.includes('catalog')
  ) {
    suggestedTables.push({
      name: 'products',
      fields: [
        'id',
        'title',
        'description',
        'price',
        'category_id',
        'user_id',
        'date_pub',
        'is_pub',
      ],
    });
    suggestedTables.push({
      name: 'categories',
      fields: ['id', 'parent_id', 'title', 'slug', 'ordering'],
    });
    features.push('Каталог товаров');
    complexity = 'high';
  }

  if (lower.includes('блог') || lower.includes('статья') || lower.includes('post')) {
    suggestedTables.push({
      name: 'posts',
      fields: [
        'id',
        'title',
        'slug',
        'content',
        'user_id',
        'date_pub',
        'is_pub',
        'views',
        'rating',
      ],
    });
    features.push('Блог/статьи');
    requiredHooks.push('content_after_add_approve', 'content_after_update_approve');
  }

  if (lower.includes('сообщен') || lower.includes('message') || lower.includes('chat')) {
    suggestedTables.push({
      name: 'messages',
      fields: ['id', 'from_id', 'to_id', 'content', 'date_pub', 'is_read'],
    });
    suggestedControllers.push('messages');
    features.push('Личные сообщения');
    complexity = 'high';
  }

  const description = `Дополнение "${titleSuggestion}" ${features.length > 0 ? 'с функциями: ' + features.join(', ') : ''}`;

  return {
    addon_type: addonType,
    suggested_name: nameSuggestion,
    suggested_title: titleSuggestion,
    description,
    features,
    required_hooks: [...new Set(requiredHooks)],
    suggested_tables: suggestedTables,
    suggested_controllers: [...new Set(suggestedControllers)],
    estimated_complexity: complexity,
    recommendations,
  };
}

function generateName(requirement: string): string {
  const words = requirement
    .toLowerCase()
    .replace(/[^а-яёa-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 3);

  let name = words.join('_').replace(/[aeiouyаеёиоуыэюя]/gi, '');

  if (name.length < 4) {
    name = words.join('').substring(0, 8);
  }

  return name || 'my_addon';
}

function generateTitle(requirement: string): string {
  const words = requirement
    .toLowerCase()
    .replace(/[^а-яёa-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 4);

  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Мое дополнение';
}

export function suggestAddonStructure(type: string): object {
  const structure = loadSchemas().addonStructures[type];

  if (!structure) {
    return {
      error: `Тип "${type}" не найден`,
      available: Object.keys(loadSchemas().addonStructures),
    };
  }

  return {
    type: structure.type,
    description: structure.description,
    files: structure.files.map(f => ({
      path: f.path,
      required: f.required,
      description: f.description,
    })),
  };
}
