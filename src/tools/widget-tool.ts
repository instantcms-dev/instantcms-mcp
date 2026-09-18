/**
 * @fileoverview Widget scaffolding tool for InstantCMS
 * Generates widgets with options, templates, and configuration
 *
 * Конвенции проверены по InstantCMS 2.18.2:
 *  - путь:      system/controllers/{controller}/widgets/{widget}/
 *  - класс:     widget{Controller}{Widget} extends cmsWidget
 *  - форма:     formWidget{Controller}{Widget}Options extends cmsForm
 *  - шаблон:    templates/{theme}/controllers/{controller}/widgets/{widget}/{widget}.tpl.php
 *  - опции:     $this->getOption('name', $default); поля формы с префиксом options:
 */

import { z } from 'zod';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { phpValue, quotePhp } from '../utils/serialization.js';

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
    /** Inline styles inside the template */
    with_styles?: boolean;
    /** Enable widget caching */
    with_cache?: boolean;
  };
}

/** Имя контроллера в CamelCase: recent_posts → RecentPosts */
function camel(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function optionDefault(option: WidgetOption): string {
  if (option.default === undefined) {
    return 'null';
  }
  return phpValue(option.default);
}

/**
 * Генерирует класс виджета: widget{Controller}{Widget} extends cmsWidget
 */
function generateWidgetClass(
  controller: string,
  Widget: string,
  Controller: string,
  options: WidgetOption[],
  withCache: boolean
): string {
  const optionsCode = options
    .filter(option => option.name !== 'title')
    .map(option => {
      const cast = option.type === 'number' ? '(int) ' : '';
      const fallback = option.default !== undefined ? optionDefault(option) : 'false';
      return `        $${option.name} = ${cast}$this->getOption(${quotePhp(option.name)}, ${fallback});`;
    })
    .join('\n');

  const templateVars = options
    .filter(option => option.name !== 'title')
    .map(option => `            '${option.name}' => $${option.name},`)
    .join('\n');

  const limitOption = options.find(option => option.type === 'number');

  return `<?php

class widget${Controller}${Widget} extends cmsWidget {

    public $is_cacheable = ${withCache ? 'true' : 'false'};

    public function run() {

${optionsCode ? optionsCode + '\n\n' : ''}        $model = cmsCore::getModel(${quotePhp(controller)});

        // Таблица {controller}_items — замените на свою модель/запрос при необходимости.
        $items = $model->filterEqual('is_pub', 1)
                       ->orderBy('date_pub', 'desc')
                       ->limit(${limitOption ? `$${limitOption.name}` : '10'})
                       ->get(${quotePhp(`${controller}_items`)}) ?: [];

        if (!$items) {
            return false;
        }

        return [
            'items' => $items,
${templateVars}
        ];
    }

}`;
}

/**
 * Генерирует форму опций: formWidget{Controller}{Widget}Options extends cmsForm
 */
function generateWidgetOptions(
  Widget: string,
  Controller: string,
  options: WidgetOption[]
): string {
  const fieldsCode = options
    .map(option => {
      const fieldName = `options:${option.name}`;
      const base: Record<string, unknown> = {
        title: option.label,
      };
      if (!(option.type === 'checkbox' && option.default === undefined)) {
        base.default = option.default ?? (option.type === 'checkbox' ? false : null);
      }

      switch (option.type) {
        case 'number':
          return `                    new fieldNumber(${quotePhp(fieldName)}, ${phpValue({ ...base, default: option.default ?? 0 })}),`;
        case 'select': {
          const items: Record<string, string> = {};
          for (const item of option.options ?? []) {
            items[item.value] = item.label;
          }
          return `                    new fieldList(${quotePhp(fieldName)}, ${phpValue({ ...base, items })}),`;
        }
        case 'checkbox':
          return `                    new fieldCheckbox(${quotePhp(fieldName)}, ${phpValue({ ...base, default: option.default ?? false })}),`;
        case 'textarea':
          return `                    new fieldText(${quotePhp(fieldName)}, ${phpValue(base)}),`;
        case 'image':
          return `                    new fieldImage(${quotePhp(fieldName)}, ${phpValue(base)}),`;
        default:
          return `                    new fieldString(${quotePhp(fieldName)}, ${phpValue({ ...base, default: option.default ?? '' })}),`;
      }
    })
    .join('\n');

  return `<?php

class formWidget${Controller}${Widget}Options extends cmsForm {

    public function init() {

        return [
            [
                'type'   => 'fieldset',
                'title'  => LANG_OPTIONS,
                'childs' => [
${fieldsCode}
                ],
            ],
        ];
    }

}`;
}

/**
 * Генерирует шаблон виджета.
 */
function generateWidgetTemplate(controller: string, widget: string, withStyles: boolean): string {
  const styles = withStyles
    ? `
<style>
.widget_${controller}_${widget} .item + .item {
    border-top: 1px solid rgba(0, 0, 0, .075);
    margin-top: .5rem;
    padding-top: .5rem;
}
</style>
`
    : '';

  return `<?php
/**
 * @var array $items
 */
?>
<div class="widget_${controller}_${widget}">
    <?php if ($items) { ?>
        <div class="widget_${controller}_${widget}_list">
            <?php foreach ($items as $item) { ?>
                <div class="item">
                    <a href="<?php echo href_to(${quotePhp(controller)}, 'view', $item['id']); ?>">
                        <?php echo html($item['title']); ?>
                    </a>
                    <div class="text-muted small"><?php echo html_date($item['date_pub'], true); ?></div>
                </div>
            <?php } ?>
        </div>
    <?php } ?>
</div>
${styles}`;
}

/**
 * Регистрация виджета в cms_widgets.
 *
 * Виджеты контроллера не появляются в админке сами: установщик ICMS2
 * регистрирует их только для widget-пакетов. Поэтому генератор отдаёт
 * отдельный файл с функцией, которую вызывает install_package() пакета.
 * Имя функции уникально, поэтому файлы разных виджетов не конфликтуют.
 */
function generateWidgetInstall(
  controller: string,
  widget: string,
  Widget: string,
  Controller: string,
  title: string
): string {
  const functionName = `install_widget_${controller}_${widget}`;

  return `<?php

/**
 * Регистрирует виджет ${controller}/${widget} в cms_widgets (идемпотентно).
 * Вызовите из install_package() пакета: ${functionName}($install_options);
 *
 * @param array $install_options
 * @return bool
 */
function ${functionName}(array $install_options = []) {

    $model = cmsCore::getModel('admin');

    $exists = $model->filterEqual('controller', '${controller}')
                    ->filterEqual('name', '${widget}')
                    ->getItem('widgets');

    if ($exists) {
        return true;
    }

    $model->insert('widgets', [
        'controller' => '${controller}',
        'name'       => '${widget}',
        'title'      => '${title.replace(/'/g, "\\'")}',
        'author'     => '',
        'url'        => '',
        'version'    => '1.0.0',
    ]);

    return true;
}
`;
}

/**
 * Generates a complete widget for InstantCMS
 *
 * @example
 * ```typescript
 * const result = scaffoldWidget({
 *   addon_name: 'blog',
 *   widget_name: 'recent_posts',
 *   options: [{ name: 'limit', type: 'number', label: 'Количество', default: 5 }]
 * });
 * ```
 */
export function scaffoldWidget(opts: ScaffoldWidgetOptions): ScaffoldResult {
  const { lowercase } = normalizeAddonName(opts.addon_name);
  if (!/^[a-z][a-z0-9_]{1,63}$/.test(lowercase)) throw new Error('Invalid addon name');
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(opts.widget_name)) throw new Error('Invalid widget name');

  const widget = opts.widget_name;
  const Widget = camel(widget);
  const Controller = camel(lowercase);
  const theme = 'modern';

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

  const widgetDir = `package/system/controllers/${lowercase}/widgets/${widget}`;

  files[`${widgetDir}/widget.php`] = generateWidgetClass(
    lowercase,
    Widget,
    Controller,
    options,
    options_config.with_cache
  );
  files[`${widgetDir}/options.form.php`] = generateWidgetOptions(Widget, Controller, options);

  files['[pkg] install_widget.php'] = generateWidgetInstall(
    lowercase,
    widget,
    Widget,
    Controller,
    options.find(option => option.name === 'title')?.default?.toString() || `Виджет ${widget}`
  );

  if (options_config.with_template) {
    files[
      `package/templates/${theme}/controllers/${lowercase}/widgets/${widget}/${widget}.tpl.php`
    ] = generateWidgetTemplate(lowercase, widget, options_config.with_styles);
  }

  return {
    addon_name: lowercase,
    files,
    widget_name: widget,
    widget_class: `widget${Controller}${Widget}`,
    options_count: options.length,
    options_config,
    structure_notes: [
      `Класс виджета: widget${Controller}${Widget} (файл system/controllers/${lowercase}/widgets/${widget}/widget.php)`,
      `Форма опций: formWidget${Controller}${Widget}Options (файл options.form.php)`,
      `Шаблон: templates/${theme}/controllers/${lowercase}/widgets/${widget}/${widget}.tpl.php`,
      'Опции читаются через $this->getOption(), поля формы имеют префикс options:',
      `Регистрация виджета: [pkg] install_widget.php, функция install_widget_${lowercase}_${widget}()`,
    ],
    limitations: [
      'Виджет обращается к таблице {controller}_items — замените запрос на свою модель.',
      'Права доступа, кэш-инвалидация и позиции виджета настраиваются в админке.',
      `Вызовите install_widget_${lowercase}_${widget}($install_options) из install_package() пакета — иначе виджет не появится в админке.`,
    ],
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
