/**
 * @fileoverview SEO scaffolding tool for InstantCMS
 * Generates SEO meta tags, sitemap, Open Graph, and Schema.org markup
 */

import { z } from 'zod';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * Available SEO field types
 */
export const SeoFieldTypeEnum = z.enum([
  'title',
  'description',
  'keywords',
  'og_image',
  'canonical',
  'robots',
]);

type SeoFieldType = z.infer<typeof SeoFieldTypeEnum>;

/**
 * Single SEO field definition
 */
interface SeoField {
  /** Field name */
  field: string;
  /** SEO field type */
  type: SeoFieldType;
  /** Template value with variables like {item.title}, {site.name} */
  value?: string;
}

/**
 * Options for SEO generation
 */
interface ScaffoldSeoOptions {
  /** System name of the addon */
  addon_name: string;
  /** List of SEO fields */
  fields?: SeoField[];
  /** Additional configuration */
  options?: {
    /** Enable automatic meta tag generation */
    auto_generation?: boolean;
    /** Generate sitemap.xml support */
    use_sitemap?: boolean;
    /** Generate Open Graph meta tags */
    use_og_tags?: boolean;
    /** Generate Schema.org JSON-LD markup */
    use_schema_org?: boolean;
  };
}

import { rejectUnsupportedOptions } from '../utils/generator-options.js';
import { quotePhp } from '../utils/serialization.js';

/**
 * SEO для контроллера InstantCMS.
 *
 * Механизм проверен по 2.18.2:
 *  - финальный HTML проходит через фильтр `render_page`
 *    (system/core/template.php: cmsEventsManager::hook('render_page', $html));
 *  - карта сайта для контроллера собирается хуком `sitemap_urls_list_<controller>`
 *    (system/controllers/sitemap/hooks/cron_generate.php);
 *  - метатеги страницы выставляет cmsTemplate::setMeta(), но в хуке доступен
 *    только HTML, поэтому разметка внедряется в `<head>`.
 *
 * Генератор создаёт помощник построения разметки и настоящие хуки контроллера.
 * Вымышленных методов вроде setPageDescription() в ICMS2 нет.
 */

const SEO_OPTIONS = ['use_schema_org', 'use_og_tags', 'use_sitemap'];

function generateSeoHelper(controller: string, Name: string): string {
  return `<?php

/**
 * Построение SEO-разметки для материалов контроллера ${controller}.
 * Чистые функции: их удобно вызывать из хука render_page и из тестов.
 */
class ${Name}Seo {

    /**
     * Метатеги: заголовок, описание, ключевые слова.
     *
     * @param array $item Материал контроллера
     * @return array
     */
    public static function getMeta(array $item): array {

        $title = trim((string) ($item['title'] ?? ''));

        $description = trim((string) ($item['description'] ?? ''));
        if ($description === '') {
            $source = trim(strip_tags((string) ($item['text'] ?? '')));
            $description = $source === '' ? '' : mb_substr($source, 0, 160);
        }

        return [
            'title'       => $title,
            'description' => $description,
            'keywords'    => trim((string) ($item['keywords'] ?? '')),
        ];
    }

    /**
     * Разметка Schema.org для материала.
     *
     * @param array $item
     * @param string $url Абсолютный адрес материала
     * @return array
     */
    public static function getSchema(array $item, string $url): array {

        $name = trim((string) ($item['title'] ?? ''));
        if ($name === '') {
            return [];
        }

        $schema = [
            '@context' => 'https://schema.org',
            '@type'    => 'Article',
            'headline' => $name,
            'url'      => $url,
        ];

        $description = self::getMeta($item)['description'];
        if ($description !== '') {
            $schema['description'] = $description;
        }

        if (!empty($item['date_pub'])) {
            $schema['datePublished'] = date('c', strtotime($item['date_pub']));
        }

        return $schema;
    }

    /** Экранирование значения для атрибута HTML */
    public static function attr($value): string {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }
}
`;
}

function generateRenderPageHook(
  controller: string,
  Name: string,
  useSchemaOrg: boolean,
  useOgTags: boolean
): string {
  const schemaBlock = useSchemaOrg
    ? `
        if ($item) {
            $schema = ${Name}Seo::getSchema($item, $item_url);
            if ($schema) {
                $inject .= '<script type="application/ld+json">'
                    . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                    . '</script>' . "\\n";
            }
        }
`
    : '';

  const ogBlock = useOgTags
    ? `
        if ($item) {
            $og = [
                'og:type'        => 'article',
                'og:title'       => $meta['title'],
                'og:description' => $meta['description'],
                'og:url'         => $item_url,
            ];
            foreach ($og as $property => $content) {
                if ($content !== '') {
                    $inject .= '<meta property="' . ${Name}Seo::attr($property) . '" content="' . ${Name}Seo::attr($content) . '">' . "\\n";
                }
            }
        }
`
    : '';

  return `<?php

/**
 * Внедряет SEO-разметку в итоговый HTML страниц контроллера ${controller}.
 * Хук render_page получает готовый HTML (см. system/core/template.php).
 */
require_once __DIR__ . '/../seo.php';

class on${Name}RenderPage extends cmsAction {

    public function run($html) {

        if ($this->cms_core->uri_controller !== ${quotePhp(controller)}) {
            return $html;
        }

        // uri_params — массив параметров после действия: /<controller>/view/<id>
        $item_id = (int) ($this->cms_core->uri_params[0] ?? 0);
        if (!$item_id) {
            return $html;
        }

        $item = cmsCore::getModel(${quotePhp(controller)})->getItemById(${quotePhp(`${controller}_items`)}, $item_id);
        if (!$item) {
            return $html;
        }

        $item_url = href_to_abs($this->cms_core->uri_controller, 'view', $item_id);
        // Хук получает уже готовый HTML, поэтому setMeta() здесь не сработает —
        // разметка внедряется в <head> напрямую.
        $meta   = ${Name}Seo::getMeta($item);
        $inject = '';
${ogBlock}${schemaBlock}
        if ($inject === '') {
            return $html;
        }

        $close_head = stripos($html, '</head>');
        if ($close_head === false) {
            return $html;
        }

        return substr($html, 0, $close_head) . $inject . substr($html, $close_head);
    }
}
`;
}

function generateSitemapHook(controller: string, Name: string): string {
  return `<?php

/**
 * Добавляет материалы контроллера ${controller} в карту сайта.
 * Хук вызывается из system/controllers/sitemap/hooks/cron_generate.php
 * как cmsEventsManager::hook('sitemap_urls_list_${controller}', [$item, $urls]).
 */
class on${Name}SitemapUrlsList${Name} extends cmsAction {

    public function run($data) {

        list($item, $urls) = $data;

        $model = cmsCore::getModel(${quotePhp(controller)});

        $items = $model->filterEqual('is_pub', 1)->limit(1000)->get(${quotePhp(`${controller}_items`)});
        if ($items) {
            $urls = [];
            foreach ($items as $entry) {
                $urls[] = [
                    'title'      => $entry['title'],
                    'url'        => href_to(${quotePhp(controller)}, 'view', $entry['id']),
                    'lastmod'    => !empty($entry['date_pub']) ? $entry['date_pub'] : null,
                    'changefreq' => 'weekly',
                    'priority'   => 0.6,
                ];
            }
        }

        return [$item, $urls];
    }
}
`;
}

export function scaffoldSeo(opts: ScaffoldSeoOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_seo', opts.options, {
    auto_generation: 'автогенерация метатегов не поддержана — задайте правила вручную',
    fields: 'сопоставление SEO-полей не поддержано — используйте поля title/description/keywords',
  });

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const useSchemaOrg = opts.options?.use_schema_org ?? true;
  const useOgTags = opts.options?.use_og_tags ?? true;
  const useSitemap = opts.options?.use_sitemap ?? false;

  const ctrl = `package/system/controllers/${lowercase}`;

  const files: Record<string, string> = {
    [`${ctrl}/seo.php`]: generateSeoHelper(lowercase, UpperCamelCase),
    [`${ctrl}/hooks/render_page.php`]: generateRenderPageHook(
      lowercase,
      UpperCamelCase,
      useSchemaOrg,
      useOgTags
    ),
  };

  if (useSitemap) {
    files[`${ctrl}/hooks/sitemap_urls_list_${lowercase}.php`] = generateSitemapHook(
      lowercase,
      UpperCamelCase
    );
  }

  return {
    addon_name: lowercase,
    files,
    options_applied: {
      use_schema_org: useSchemaOrg,
      use_og_tags: useOgTags,
      use_sitemap: useSitemap,
    },
    supported_options: SEO_OPTIONS,
    scaffold_status: 'partial',
    structure_notes: [
      `Разметка строится классом ${UpperCamelCase}Seo (seo.php)`,
      `Хук render_page внедряет метатеги в <head> страниц контроллера ${lowercase}`,
      useSitemap
        ? `Хук sitemap_urls_list_${lowercase} добавляет материалы в карту сайта`
        : 'Интеграция с картой сайта не запрошена (use_sitemap)',
    ],
    limitations: [
      'Хук определяет материал по id из URI; для ЧПУ-адресов без id нужна своя логика.',
      'Описание формируется из поля description или первых 160 символов text.',
      'Правила обхода и последняя модификация карты сайта настраиваются в контроллере sitemap.',
    ],
  };
}

export const seoToolSchema = {
  name: 'scaffold_seo',
  description: 'Генерация SEO-разметки InstantCMS: хук render_page и карта сайта',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя компонента' },
      fields: {
        type: 'array',
        items: { type: 'object' },
        description: 'Сопоставление SEO-полей (не поддержано)',
      },
      options: {
        type: 'object',
        properties: {
          auto_generation: {
            type: 'boolean',
            description: 'Автогенерация метатегов (не поддержана)',
          },
          use_sitemap: { type: 'boolean', description: 'Добавлять материалы в карту сайта' },
          use_og_tags: { type: 'boolean', description: 'Добавлять Open Graph теги' },
          use_schema_org: { type: 'boolean', description: 'Добавлять разметку Schema.org' },
        },
      },
    },
    required: ['addon_name'],
  },
  inputExamples: [
    { addon_name: 'blog', options: { use_schema_org: true, use_og_tags: true, use_sitemap: true } },
  ],
};
