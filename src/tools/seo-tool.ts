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

/**
 * Generates SEO configuration class
 */
function generateSeoConfig(
  name: string,
  Name: string,
  fields: SeoField[],
  options: Record<string, boolean>
): string {
  const titleField = fields.find(f => f.type === 'title')?.field || 'title';
  const descField = fields.find(f => f.type === 'description')?.field || 'description';
  const keywordsField = fields.find(f => f.type === 'keywords')?.field || 'keywords';

  return `<?php
// InstantCMS 2. ${name}/seo.php

class ${Name}Seo {
    private static $instance = null;
    private $config = [];

    private function __construct() {
        $this->config = include __DIR__ . '/seo_config.php';
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConfig() {
        return $this->config;
    }

    public function getTitle($item = null) {
        $template = $this->config['${titleField}']['value'] ?? '{item.title}';
        return $this->replaceVariables($template, $item);
    }

    public function getDescription($item = null) {
        $template = $this->config['${descField}']['value'] ?? '';
        return $this->replaceVariables($template, $item);
    }

    public function getKeywords($item = null) {
        $template = $this->config['${keywordsField}']['value'] ?? '';
        return $this->replaceVariables($template, $item);
    }

    private function replaceVariables($template, $item) {
        if (!$item) {
            return $template;
        }

        $item = (array)$item;
        $result = str_replace('{site.name}', cmsConfig::get('sitename'), $template);
        $result = str_replace('{site.url}', cmsConfig::get('root_url'), $result);

        foreach ($item as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $result = str_replace('{item.' . $key . '}', $value, $result);
            }
        }

        return $result;
    }

    public function getMetaTags($item = null) {
        $tags = [];

        if (${options.auto_generation}) {
            $title = $this->getTitle($item);
            if ($title) {
                $tags['title'] = $title;
            }

            $description = $this->getDescription($item);
            if ($description) {
                $tags['description'] = $description;
            }

            $keywords = $this->getKeywords($item);
            if ($keywords) {
                $tags['keywords'] = $keywords;
            }
        }

        return $tags;
    }

    public function getOgTags($item = null) {
        if (!${options.use_og_tags}) {
            return [];
        }

        $tags = [
            'og:title' => $this->getTitle($item),
            'og:description' => $this->getDescription($item),
            'og:type' => 'article',
            'og:url' => cmsConfig::get('root_url') . '/' . ($item['slug'] ?? ''),
        ];

        if (!empty($item['og_image'])) {
            $tags['og:image'] = $item['og_image'];
        } elseif (!empty($item['image'])) {
            $tags['og:image'] = $item['image'];
        }

        return array_filter($tags);
    }

    public function getRobots($item = null) {
        if (!empty($this->config['robots']['value'])) {
            return $this->config['robots']['value'];
        }

        if (!empty($item['is_draft']) || !empty($item['is_private'])) {
            return 'noindex, nofollow';
        }

        return 'index, follow';
    }
}`;
}

/**
 * Generates SEO hook handlers
 */
function generateSeoHooks(
  name: string,
  Name: string,
  _fields: SeoField[],
  options: Record<string, boolean>
): string {
  return `<?php
// InstantCMS 2. system/hooks/${name}/seo.hooks.php

class on${Name}SeoHook {
    public function onBeforeRender($controller, $item = null) {
        if (!${options.auto_generation}) {
            return;
        }

        $seo = ${Name}Seo::getInstance();
        $meta = $seo->getMetaTags($item);

        if (!empty($meta['title'])) {
            $controller->setPageTitle($meta['title']);
        }

        if (!empty($meta['description'])) {
            $controller->setPageDescription($meta['description']);
        }

        if (!empty($meta['keywords'])) {
            $controller->setPageKeywords($meta['keywords']);
        }

        if (${options.use_og_tags}) {
            $og = $seo->getOgTags($item);
            foreach ($og as $property => $content) {
                $controller->addHeadJsVar('icms[og][' . $property . ']', $content);
            }
        }

        $robots = $seo->getRobots($item);
        $controller->setPageRobots($robots);
    }

    public function onAfterSave($item) {
        if (!empty($item['slug'])) {
            $this->updateSitemap($item);
        }
    }

    public function onAfterDelete($item) {
        $this->removeFromSitemap($item);
    }

    private function updateSitemap($item) {
        if (!${options.use_sitemap}) {
            return;
        }

        $model = cmsModel::getInstance();
        $model->delete('sitemap', ['entity' => '${name}', 'entity_id' => $item['id']], true);

        $model->insert('sitemap', [
            'entity' => '${name}',
            'entity_id' => $item['id'],
            'slug' => $item['slug'],
            'last_modified' => date('Y-m-d H:i:s'),
            'change_freq' => 'weekly',
            'priority' => '0.7',
        ]);
    }

    private function removeFromSitemap($item) {
        if (!${options.use_sitemap}) {
            return;
        }

        $model = cmsModel::getInstance();
        $model->delete('sitemap', ['entity' => '${name}', 'entity_id' => $item['id']], true);
    }
}`;
}

/**
 * Generates sitemap class
 */
function generateSitemap(name: string, Name: string, _fields: SeoField[]): string {
  return `<?php
// InstantCMS 2. ${name}/sitemap.php

class ${Name}Sitemap {
    public function getItems($page = 1, $per_page = 100) {
        $model = cmsModel::getInstance();

        return $model->get('${name}', function ($item) {
            return [
                'loc' => cmsConfig::get('root_url') . '/' . $item['slug'],
                'lastmod' => !empty($item['date_pub']) ? date('Y-m-d', strtotime($item['date_pub'])) : date('Y-m-d'),
                'changefreq' => !empty($item['changefreq']) ? $item['changefreq'] : 'weekly',
                'priority' => !empty($item['priority']) ? $item['priority'] : '0.7',
            ];
        }, [
            'is_deleted' => false,
        ], 'id DESC', $page, $per_page);
    }

    public function getTotal() {
        $model = cmsModel::getInstance();
        return $model->getCount('${name}', function ($model) {
            $model->filterIsNull('is_deleted');
        });
    }

    public function generateXml($items) {
        $xml = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($items as $item) {
            $xml .= '<url>';
            $xml .= '<loc>' . htmlspecialchars($item['loc']) . '</loc>';
            $xml .= '<lastmod>' . $item['lastmod'] . '</lastmod>';
            $xml .= '<changefreq>' . $item['changefreq'] . '</changefreq>';
            $xml .= '<priority>' . $item['priority'] . '</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return $xml;
    }
}`;
}

/**
 * Generates Schema.org JSON-LD class
 */
function generateSchemaOrg(name: string, Name: string, _fields: SeoField[]): string {
  return `<?php
// InstantCMS 2. ${name}/schema.php

class ${Name}SchemaOrg {
    public static function getArticleSchema($item) {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $item['title'] ?? '',
            'description' => $item['description'] ?? '',
            'image' => $item['image'] ?? '',
            'datePublished' => $item['date_pub'] ?? '',
            'dateModified' => $item['updated_at'] ?? $item['date_pub'] ?? '',
            'author' => [
                '@type' => 'Person',
                'name' => $item['user_nickname'] ?? $item['author_name'] ?? '',
            ],
        ];

        if (!empty($item['slug'])) {
            $schema['url'] = cmsConfig::get('root_url') . '/' . $item['slug'];
        }

        return $schema;
    }

    public static function toJsonLd($schema) {
        return '<script type="application/ld+json">' . json_encode($schema) . '</script>';
    }
}`;
}

/**
 * Generates SEO configuration file
 */
function generateSeoConfigFile(fields: SeoField[]): string {
  const fieldEntries = fields
    .map(f => {
      const value = f.value ? `'${f.value}'` : 'null';
      return `    '${f.field}' => ['type' => '${f.type}', 'value' => ${value}]`;
    })
    .join(',\n');

  return `<?php
// InstantCMS 2. SEO configuration

return [
${fieldEntries}
];`;
}

/**
 * Generates a complete SEO system for an InstantCMS addon
 *
 * @param opts - Configuration options for the SEO system
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldSeo({
 *   addon_name: 'blog',
 *   fields: [
 *     { field: 'title', type: 'title', value: '{item.title} | {site.name}' },
 *     { field: 'description', type: 'description', value: '{item.description}' }
 *   ],
 *   options: { use_sitemap: true, use_og_tags: true, use_schema_org: true }
 * });
 * ```
 */
export function scaffoldSeo(opts: ScaffoldSeoOptions): ScaffoldResult {
  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const fields = opts.fields || [
    { field: 'title', type: 'title', value: '{item.title} | {site.name}' },
    { field: 'description', type: 'description', value: '{item.description}' },
    { field: 'keywords', type: 'keywords' },
  ];

  const options = {
    auto_generation: opts.options?.auto_generation ?? true,
    use_sitemap: opts.options?.use_sitemap ?? true,
    use_og_tags: opts.options?.use_og_tags ?? true,
    use_schema_org: opts.options?.use_schema_org ?? false,
  };

  files[`${lowercase}/seo.php`] = generateSeoConfig(lowercase, UpperCamelCase, fields, options);
  files[`${lowercase}/seo_config.php`] = generateSeoConfigFile(fields);
  files[`system/hooks/${lowercase}/seo.hooks.php`] = generateSeoHooks(
    lowercase,
    UpperCamelCase,
    fields,
    options
  );

  if (options.use_sitemap) {
    files[`${lowercase}/sitemap.php`] = generateSitemap(lowercase, UpperCamelCase, fields);
  }

  if (options.use_schema_org) {
    files[`${lowercase}/schema.php`] = generateSchemaOrg(lowercase, UpperCamelCase, fields);
  }

  return {
    addon_name: lowercase,
    files,
    fields_count: fields.length,
    options,
    seo_fields: fields.map(f => ({
      field: f.field,
      type: f.type,
      value: f.value,
    })),
  };
}

export const seoToolSchema = {
  name: 'scaffold_seo',
  description: 'Генерация SEO мета-тегов, sitemap и Open Graph разметки для InstantCMS',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя дополнения' },
      fields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', description: 'Имя поля' },
            type: {
              type: 'string',
              enum: ['title', 'description', 'keywords', 'og_image', 'canonical', 'robots'],
              description: 'Тип поля',
            },
            value: { type: 'string', description: 'Шаблон значения' },
          },
        },
        description: 'Поля SEO',
      },
      options: {
        type: 'object',
        properties: {
          auto_generation: { type: 'boolean', description: 'Автогенерация мета-тегов' },
          use_sitemap: { type: 'boolean', description: 'Использовать sitemap' },
          use_og_tags: { type: 'boolean', description: 'Open Graph теги' },
          use_schema_org: { type: 'boolean', description: 'Schema.org разметка' },
        },
      },
    },
    required: ['addon_name'],
  },
  inputExamples: [
    {
      addon_name: 'blog',
      options: { auto_generation: true, use_sitemap: true, use_og_tags: true },
    },
  ],
};
