/**
 * @fileoverview Caching system scaffolding tool for InstantCMS
 * Generates cache classes, tag-based cache invalidation, and hook handlers
 */

import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { hookClassName } from '../utils/hook-class.js';
import { rejectUnsupportedOptions } from '../utils/generator-options.js';

/**
 * Пофайловые хуки кэша: ядро грузит system/controllers/<name>/hooks/<event>.php
 * и вызывает run($data). События совпадают с теми, что эмитит scaffold_crud.
 */
const CACHE_HOOK_EVENTS: Array<{ event: string; comment: string }> = [
  { event: 'after_add', comment: 'добавление материала' },
  { event: 'after_update', comment: 'сохранение материала' },
  { event: 'after_delete', comment: 'удаление материала' },
];

/**
 * Options for cache generation
 */
interface ScaffoldCacheOptions {
  /** System name of the addon */
  addon_name: string;
  /** Additional configuration */
  options?: {
    /** Use Memcached as cache backend */
    use_memcached?: boolean;
    /** Use Redis as cache backend */
    use_redis?: boolean;
    /** Default TTL in seconds */
    default_ttl?: number;
    /** Enable tag-based cache invalidation */
    use_tags?: boolean;
  };
}

/**
 * Generates cache class
 */
function generateCacheClass(name: string, Name: string, options: Record<string, unknown>): string {
  // Драйвер кэша задаётся в конфиге сайта (cache_method), cmsCache::getInstance()
  // аргументов не принимает (проверено по 2.18.2: system/core/cache.php).
  const tagsRequire = options.use_tags ? `require_once __DIR__ . '/cache.tags.php';\n` : '';

  return `<?php
// InstantCMS 2. system/controllers/${name}/cache.php
${tagsRequire}
class ${Name}Cache {
    private static $instance = null;
    private $cache = null;
    private $prefix = '${name}_';
    private $default_ttl = ${options.default_ttl};

    private function __construct() {
        $this->initCache();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function initCache() {
        $this->cache = cmsCache::getInstance();
    }

    public function get($key, $callback = null, $ttl = null) {
        $cache_key = $this->prefix . $key;
        $data = $this->cache->get($cache_key);

        if ($data !== false) {
            return $data;
        }

        if ($callback !== null) {
            $data = call_user_func($callback);
            $this->set($key, $data, $ttl);
            return $data;
        }

        return null;
    }

    public function set($key, $value, $ttl = null) {
        $cache_key = $this->prefix . $key;
        $ttl = $ttl ?? $this->default_ttl;

        return $this->cache->set($cache_key, $value, $ttl);
    }

    public function delete($key) {
        $cache_key = $this->prefix . $key;
        return $this->cache->delete($cache_key);
    }

    public function clear() {
        return $this->cache->clean();
    }

    public function exists($key) {
        $cache_key = $this->prefix . $key;
        return $this->cache->get($cache_key) !== false;
    }

    public function increment($key, $offset = 1) {
        $cache_key = $this->prefix . $key;
        return $this->cache->increment($cache_key, $offset);
    }

    public function decrement($key, $offset = 1) {
        $cache_key = $this->prefix . $key;
        return $this->cache->decrement($cache_key, $offset);
    }

    public function remember($key, $callback, $ttl = null) {
        return $this->get($key, $callback, $ttl);
    }

    public function forget($key) {
        return $this->delete($key);
    }

    public function flush() {
        return $this->clear();
    }

    public function invalidateItem($item_id) {
        $this->delete('item_' . $item_id);
        $this->delete('list_page_1');

        if (${options.use_tags}) {
            ${Name}CacheTags::getInstance()->invalidateTag('item:' . $item_id);
        }
    }

    public function invalidateList() {
        $this->delete('list_page_1');
        $this->delete('list_all');

        if (${options.use_tags}) {
            ${Name}CacheTags::getInstance()->invalidateTag('list');
        }
    }

    public function warmUp($callback) {
        $data = call_user_func($callback);
        $this->set('list_all', $data);
        return $data;
    }
}`;
}

/**
 * Generates cache tags class for tag-based invalidation
 */
function generateCacheTags(name: string, Name: string, _options: Record<string, unknown>): string {
  return `<?php
// InstantCMS 2. ${name}/cache.tags.php

class ${Name}CacheTags {
    private static $instance = null;
    private $cache = null;
    private $prefix = '${name}_tags_';
    private $tag_index_key = '${name}_tag_index';

    private function __construct() {
        $this->cache = cmsCache::getInstance();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get($key, $tags, $callback = null, $ttl = null) {
        $cache_key = $this->prefix . $key;
        $data = $this->cache->get($cache_key);

        if ($data !== false) {
            $this->registerTags($key, $tags);
            return $data;
        }

        if ($callback !== null) {
            $data = call_user_func($callback);
            $this->set($key, $data, $tags, $ttl);
            return $data;
        }

        return null;
    }

    public function set($key, $value, $tags, $ttl = null) {
        $cache_key = $this->prefix . $key;
        $this->cache->set($cache_key, $value, $ttl);
        $this->registerTags($key, $tags);

        return true;
    }

    public function invalidateTag($tag) {
        $tag_index = $this->cache->get($this->tag_index_key) ?: [];

        if (empty($tag_index[$tag])) {
            return;
        }

        foreach ($tag_index[$tag] as $key) {
            $this->cache->delete($this->prefix . $key);
        }

        unset($tag_index[$tag]);
        $this->cache->set($this->tag_index_key, $tag_index);
    }

    public function deleteTag($tag) {
        return $this->invalidateTag($tag);
    }

    public function flushByTag($tag) {
        return $this->invalidateTag($tag);
    }

    public function flushAll() {
        $tag_index = $this->cache->get($this->tag_index_key) ?: [];

        foreach ($tag_index as $tag => $keys) {
            foreach ($keys as $key) {
                $this->cache->delete($this->prefix . $key);
            }
        }

        $this->cache->delete($this->tag_index_key);
    }

    private function registerTags($key, $tags) {
        if (empty($tags)) {
            return;
        }

        $tag_index = $this->cache->get($this->tag_index_key) ?: [];

        if (!is_array($tags)) {
            $tags = [$tags];
        }

        foreach ($tags as $tag) {
            if (empty($tag_index[$tag])) {
                $tag_index[$tag] = [];
            }

            if (!in_array($key, $tag_index[$tag])) {
                $tag_index[$tag][] = $key;
            }
        }

        $this->cache->set($this->tag_index_key, $tag_index);
    }

    public function getTagStats() {
        $tag_index = $this->cache->get($this->tag_index_key) ?: [];
        return [
            'total_tags' => count($tag_index),
            'tags' => array_keys($tag_index),
        ];
    }
}`;
}

/**
 * Generates cache hook handlers
 */
/**
 * Пофайловые хуки кэша.
 *
 * ICMS2 не знает каталога `system/hooks/` и грузит хуки только из
 * `system/controllers/<listener>/hooks/<event>.php`, по одному событию на файл,
 * с классом `on<Listener><Event>` и методом `run($data)`
 * (system/core/controller.php, runExternalHook).
 */
function generateCacheHookFiles(
  name: string,
  Name: string,
  options: Record<string, unknown>
): Record<string, string> {
  const files: Record<string, string> = {};

  for (const { event, comment } of CACHE_HOOK_EVENTS) {
    const fullEvent = `${name}_${event}`;
    const className = hookClassName(name, fullEvent);
    const tagsBlock = options.use_tags
      ? `
        ${Name}CacheTags::getInstance()->invalidateTag('item:' . $item['id']);
        ${Name}CacheTags::getInstance()->invalidateTag('list');
`
      : '';

    files[`package/system/controllers/${name}/hooks/${fullEvent}.php`] = `<?php

/**
 * Инвалидация кэша при событии ${fullEvent} (${comment}).
 * Хук вызывается ядром: cmsEventsManager::hook('${fullEvent}', $item).
 */
require_once __DIR__ . '/../cache.php';

class ${className} extends cmsAction {

    public function run($item) {

        ${Name}Cache::getInstance()->invalidateItem($item['id']);
        ${Name}Cache::getInstance()->invalidateList();
${tagsBlock}
        return $item;
    }

}`;
  }

  return files;
}

/**
 * Generates a complete caching system for an InstantCMS addon
 *
 * @param opts - Configuration options for the cache system
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldCache({
 *   addon_name: 'blog',
 *   options: { use_redis: true, default_ttl: 3600, use_tags: true }
 * });
 * ```
 */
export function scaffoldCache(opts: ScaffoldCacheOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_cache', opts.options, {
    use_memcached:
      'драйвер кэша задаётся в настройках сайта (cache_method); cmsCache::getInstance() аргументов не принимает',
    use_redis:
      'драйвер кэша задаётся в настройках сайта (cache_method); cmsCache::getInstance() аргументов не принимает',
  });

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const ctrl = `package/system/controllers/${lowercase}`;
  const files: Record<string, string> = {};

  const options = {
    default_ttl: opts.options?.default_ttl ?? 3600,
    use_tags: opts.options?.use_tags ?? true,
  };

  files[`${ctrl}/cache.php`] = generateCacheClass(lowercase, UpperCamelCase, options);

  if (options.use_tags) {
    files[`${ctrl}/cache.tags.php`] = generateCacheTags(lowercase, UpperCamelCase, options);
  }

  Object.assign(files, generateCacheHookFiles(lowercase, UpperCamelCase, options));

  const hookEvents = CACHE_HOOK_EVENTS.map(({ event }) => `${lowercase}_${event}`);

  return {
    addon_name: lowercase,
    files,
    options,
    hook_events: hookEvents,
    manifest_xml: `<hooks>
${hookEvents.map(event => `    <hook controller="${lowercase}" name="${event}" />`).join('\n')}
</hooks>`,
    supported_options: ['default_ttl', 'use_tags'],
    options_applied: { default_ttl: options.default_ttl, use_tags: options.use_tags },
    structure_notes: [
      `Класс кэша: ${UpperCamelCase}Cache в system/controllers/${lowercase}/cache.php`,
      `Хуки кэша: system/controllers/${lowercase}/hooks/${lowercase}_after_{add,update,delete}.php`,
      'Драйвер кэша берётся из настроек сайта (cache_method), а не из опций генератора',
    ],
    limitations: [
      'События хуков совпадают с scaffold_crud (<controller>_after_add/_update/_delete); для другого контроллера переименуйте хуки и зарегистрируйте их в cms_events.',
      'Хуки начинают работать после регистрации в cms_events (manifest.xml дополнения) — иначе ядро их не вызовет.',
      options.use_tags
        ? 'Тег-инвалидация работает через отдельный индекс в кэше: при большом числе ключей проверяйте стоимость flushByTag.'
        : 'Тег-инвалидация отключена (use_tags: false).',
    ],
  };
}

export const cacheToolSchema = {
  name: 'scaffold_cache',
  description: 'Генерация системы кэширования для InstantCMS',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя дополнения' },
      options: {
        type: 'object',
        properties: {
          use_memcached: { type: 'boolean', description: 'Использовать Memcached' },
          use_redis: { type: 'boolean', description: 'Использовать Redis' },
          default_ttl: { type: 'number', description: 'TTL по умолчанию (секунды)' },
          use_tags: { type: 'boolean', description: 'Использовать теги кэша' },
        },
      },
    },
    required: ['addon_name'],
  },
  inputExamples: [
    {
      addon_name: 'blog',
      options: { use_redis: true, default_ttl: 3600, use_tags: true },
    },
  ],
};
