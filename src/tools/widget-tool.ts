/**
 * @fileoverview Widget scaffolding tool for InstantCMS
 * Generates widgets with options, templates, and configuration
 */

import { z } from 'zod';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * Widget option field types
 */
export const WidgetFieldTypeEnum = z.enum([
  'text',
  'number',
  'select',
  'checkbox',
  'textarea',
  'image',
]);

type WidgetFieldType = z.infer<typeof WidgetFieldTypeEnum>;

/**
 * Single widget option definition
 */
interface WidgetOption {
  /** Option name */
  name: string;
  /** Field type */
  type: WidgetFieldType;
  /** Display label */
  label: string;
  /** Options for select type */
  options?: { value: string; label: string }[];
  /** Default value */
  default?: string | boolean | number;
}

/**
 * Options for widget generation
 */
interface ScaffoldWidgetOptions {
  /** System name of the addon */
  addon_name: string;
  /** Widget name */
  widget_name: string;
  /** Widget options */
  options?: WidgetOption[];
  /** Additional configuration */
  options_config?: {
    /** Generate template file */
    with_template?: boolean;
    /** Generate CSS styles */
    with_styles?: boolean;
    /** Enable widget caching */
    with_cache?: boolean;
  };
}

/**
 * Generates widget class
 */
function generateWidgetClass(
  name: string,
  widget: string,
  Widget: string,
  options: WidgetOption[],
  options_config: Record<string, boolean>
): string {
  const optionDefaults = options
    .map(o => {
      const defaultVal = typeof o.default === 'string' ? `'${o.default}'` : (o.default ?? 'null');
      return `        '${o.name}' => ${defaultVal},`;
    })
    .join('\n');

  return `<?php
// InstantCMS 2. ${name}/widgets/${widget}.php

class ${Widget}Widget extends cmsWidget {

    public $is_cacheable = ${options_config.with_cache};

    public function run() {
        $options = $this->getOptions([
${optionDefaults}
        ]);

        $data = [
            'widget' => $this,
            'options' => $options,
            'title' => $options['title'],
        ];

        return $this->renderTemplate('${widget}', $data);
    }

    public function getCacheKey() {
        return [
            cmsConfig::get('cur_lang'),
            $this->getOption('widget_id'),
            $this->getOption('page'),
        ];
    }

    public function validateOptions($options) {
        return $options;
    }

    public function getSizeOptions() {
        return [
            'full' => 'Во всю ширину',
            'half' => 'Половина ширины',
            'third' => 'Треть ширины',
        ];
    }
}`;
}

/**
 * Generates widget options class
 */
function generateWidgetOptions(widget: string, Widget: string, options: WidgetOption[]): string {
  const fieldsCode = options
    .map(o => {
      switch (o.type) {
        case 'text':
          return `        $form->addField('${o.name}', new fieldString('${o.label}'));`;
        case 'number':
          return `        $form->addField('${o.name}', new fieldNumber('${o.label}'));`;
        case 'select': {
          const optsStr = (o.options || [])
            .map(opt => `'${opt.value}' => '${opt.label}'`)
            .join(', ');
          return `        $form->addField('${o.name}', new fieldList('${o.label}', ['options' => [${optsStr}]]));`;
        }
        case 'checkbox':
          return `        $form->addField('${o.name}', new fieldCheckbox('${o.label}'));`;
        case 'textarea':
          return `        $form->addField('${o.name}', new fieldText('${o.label}'));`;
        case 'image':
          return `        $form->addField('${o.name}', new fieldImage('${o.label}'));`;
        default:
          return `        $form->addField('${o.name}', new fieldString('${o.label}'));`;
      }
    })
    .join('\n');

  return `<?php
// InstantCMS 2. widgets/${widget}.options.php

class ${Widget}WidgetOptions {

    public static function getConfigForm($form) {
${fieldsCode}

        return $form;
    }

    public static function getDefaultOptions() {
        return [
${options
  .map(o => {
    const defaultVal = typeof o.default === 'string' ? `'${o.default}'` : (o.default ?? 'null');
    return `            '${o.name}' => ${defaultVal},`;
  })
  .join('\n')}
        ];
    }

    public static function getOptionLabels() {
        return [
${options.map(o => `            '${o.name}' => '${o.label}',`).join('\n')}
        ];
    }
}`;
}

/**
 * Generates widget template
 */
function generateWidgetTemplate(widget: string, _Widget: string, _options: WidgetOption[]): string {
  return `<?php
// InstantCMS 2. widgets/${widget}.html.php

\\$widget = \\$data['widget'];
\\$options = \\$data['options'];
\\$title = \\$options['title'] ?? '';
\\$limit = \\$options['limit'] ?? 5;
?>

<?php if (\\$title): ?>
<h3 class="widget-title"><?php echo \\$title; ?></h3>
<?php endif; ?>

<div class="${widget}-widget">
    <div class="widget-content">
        <!-- Widget content here -->
    </div>
</div>

<style>
.widget-${widget} {
    padding: 0;
}
.widget-${widget} .widget-title {
    margin: 0 0 15px 0;
    font-size: 18px;
}
.widget-${widget} .widget-content {
    padding: 10px 0;
}
</style>
`;
}

/**
 * Generates widget CSS styles
 */
function generateWidgetStyles(widget: string, _options: WidgetOption[]): string {
  return `/* InstantCMS 2. ${widget} widget styles */

.${widget}-widget {
    padding: 0;
}

.${widget}-widget .widget-title {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: 600;
}

.${widget}-widget .widget-content {
    padding: 10px 0;
}

.${widget}-widget .item {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.${widget}-widget .item:last-child {
    border-bottom: none;
}

.${widget}-widget .item-title {
    font-weight: 500;
}

.${widget}-widget .item-date {
    font-size: 12px;
    color: #999;
}
`;
}

/**
 * Generates widget configuration
 */
function generateWidgetConfig(
  name: string,
  widget: string,
  Widget: string,
  options: WidgetOption[]
): string {
  return `<?php
// InstantCMS 2. system/config/widgets/${widget}.php

return [
    'widget' => '${widget}',
    'component' => '${name}',
    'class' => '${Widget}Widget',
    'options_class' => '${Widget}WidgetOptions',
    'title' => '${Widget}',
    'description' => '',
    'version' => '1.0.0',
    'author' => '',
    'options' => [
${options.map(o => `        '${o.name}' => '${o.label}',`).join('\n')}
    ],
    'size_options' => [
        'full',
        'half',
        'third',
    ],
];`;
}

/**
 * Generates a complete widget for InstantCMS
 *
 * @param opts - Configuration options for the widget
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldWidget({
 *   addon_name: 'blog',
 *   widget_name: 'recent_posts',
 *   options: [
 *     { name: 'title', type: 'text', label: 'Заголовок', default: 'Последние записи' },
 *     { name: 'limit', type: 'number', label: 'Количество', default: 5 }
 *   ]
 * });
 * ```
 */
export function scaffoldWidget(opts: ScaffoldWidgetOptions): ScaffoldResult {
  const { lowercase } = normalizeAddonName(opts.addon_name);
  const widget = opts.widget_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const Widget = widget
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  const files: Record<string, string> = {};

  const options_config = {
    with_template: opts.options_config?.with_template ?? true,
    with_styles: opts.options_config?.with_styles ?? true,
    with_cache: opts.options_config?.with_cache ?? true,
  };

  const options = opts.options || [
    { name: 'title', type: 'text' as const, label: 'Заголовок', default: '' },
    { name: 'limit', type: 'number' as const, label: 'Количество', default: 5 },
  ];

  files[`${lowercase}/widgets/${widget}.php`] = generateWidgetClass(
    lowercase,
    widget,
    Widget,
    options,
    options_config
  );
  files[`${lowercase}/widgets/${widget}.options.php`] = generateWidgetOptions(
    widget,
    Widget,
    options
  );
  files[`${lowercase}/widgets/${widget}.html.php`] = generateWidgetTemplate(
    widget,
    Widget,
    options
  );

  if (options_config.with_styles) {
    files[`${lowercase}/widgets/${widget}.css`] = generateWidgetStyles(widget, options);
  }

  files[`system/config/widgets/${widget}.php`] = generateWidgetConfig(
    lowercase,
    widget,
    Widget,
    options
  );

  return {
    addon_name: lowercase,
    files,
    widget_name: widget,
    options_count: options.length,
    options_config,
  };
}

export const widgetToolSchema = {
  name: 'scaffold_widget',
  description: 'Генерация виджета InstantCMS с настройками и шаблонами',
  inputSchema: {
    type: 'object' as const,
    properties: {
      addon_name: { type: 'string', description: 'Имя компонента' },
      widget_name: { type: 'string', description: 'Имя виджета' },
      options: z
        .array(
          z.object({
            name: z.string().describe('Имя опции'),
            type: z
              .enum(['text', 'number', 'select', 'checkbox', 'textarea', 'image'])
              .describe('Тип поля'),
            label: z.string().describe('Название'),
            options: z
              .array(z.object({ value: z.string(), label: z.string() }))
              .optional()
              .describe('Опции для select'),
            default: z
              .union([z.string(), z.boolean(), z.number()])
              .optional()
              .describe('Значение по умолчанию'),
          })
        )
        .optional()
        .describe('Опции виджета'),
      options_config: z
        .object({
          with_template: z.boolean().optional().describe('С шаблоном'),
          with_styles: z.boolean().optional().describe('Со стилями'),
          with_cache: z.boolean().optional().describe('С кэшированием'),
        })
        .optional()
        .describe('Конфигурация'),
    },
    required: ['addon_name', 'widget_name'],
  },
  inputExamples: [
    {
      addon_name: 'blog',
      widget_name: 'recent_posts',
      options: [
        { name: 'title', type: 'text', label: 'Заголовок', default: 'Последние записи' },
        { name: 'limit', type: 'number', label: 'Количество', default: 5 },
        { name: 'show_date', type: 'checkbox', label: 'Показывать дату', default: true },
      ],
    },
  ],
};
