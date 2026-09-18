/**
 * @fileoverview Content filtering system scaffolding tool for InstantCMS
 * Generates filter classes, forms, hooks, and optional saved filters
 */

import { z } from 'zod';
import { rejectUnsupportedOptions } from '../utils/generator-options.js';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * Available filter field types
 */
export const FilterTypeEnum = z.enum([
  'text',
  'select',
  'multiselect',
  'checkbox',
  'range',
  'date',
  'daterange',
]);

type FilterType = z.infer<typeof FilterTypeEnum>;

/**
 * Single filter field definition
 */
interface FilterField {
  /** Database field name */
  field: string;
  /** Filter type */
  type: FilterType;
  /** Display label */
  label?: string;
  /** Options for select/multiselect types */
  options?: { value: string; label: string }[];
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Options for filter generation
 */
interface ScaffoldFilterOptions {
  /** System name of the addon */
  addon_name: string;
  /** List of filter fields */
  fields: FilterField[];
  /** Additional configuration */
  options?: {
    /** Enable AJAX filtering */
    use_ajax?: boolean;
    /** Use URL parameters for filters */
    use_url_params?: boolean;
    /** Enable saved filters feature */
    save_filters?: boolean;
    /**
     * Сгенерировать фронтенд-фильтр списка (механизм list_filter
     * контроллера content): помощник на cmsFormField с applyFilter().
     */
    frontend?: boolean;
  };
}

/**
 * Normalizes filter field with defaults
 */
/**
 * Фильтры грида InstantCMS.
 *
 * Механизм проверен по 2.18.2: фильтрация бэкенд-грида задаётся в его колонках
 * (`'filter' => 'like' | 'exact' | 'range' | 'range_date' | 'date'`) и включается
 * опцией `'is_filter' => true`. Отдельных таблиц или хуков для фильтров в ядре нет,
 * поэтому генератор создаёт настоящую функцию грида, которую подключает экшен.
 */

const FILTER_TYPES: Record<FilterType, string | null> = {
  text: 'like',
  select: 'exact',
  multiselect: 'exact',
  range: 'range',
  date: 'range_date',
  daterange: 'range_date',
  checkbox: null,
};

/**
 * Классы полей cmsFormField для фронтенд-фильтра.
 * Проверены по 2.18.2: system/fields/*.php, метод applyFilter($model, $value).
 */
const FRONTEND_FIELD_CLASSES: Record<FilterType, string> = {
  text: 'fieldString',
  select: 'fieldList',
  multiselect: 'fieldListMultiple',
  range: 'fieldNumber',
  date: 'fieldDate',
  daterange: 'fieldDate',
  checkbox: 'fieldCheckbox',
};

function filterTitle(NAME: string, field: string): string {
  return `LANG_${NAME}_${field.toUpperCase()}`;
}

function generateGridFunction(gridName: string, NAME: string, fields: FilterField[]): string {
  const columns = fields
    .map(field => {
      const lines = [
        `        '${field.field}' => [`,
        `            'title'  => ${filterTitle(NAME, field.field)},`,
      ];
      const filter = FILTER_TYPES[field.type];
      if (filter) {
        lines.push(`            'filter' => '${filter}',`);
      }
      lines.push('        ],');
      return lines.join('\n');
    })
    .join('\n');

  return `<?php

/**
 * Грид с фильтрами.
 * Подключается экшеном: $this->grid_name = '${gridName}';
 */
function grid_${gridName}($controller) {

    $options = [
        'is_sortable'   => true,
        'is_filter'     => true,
        'is_pagination' => true,
        'order_by'      => 'date_pub',
        'order_to'      => 'desc',
    ];

    $columns = [
        'id' => [
            'title' => 'ID',
            'width' => 60,
        ],
${columns}
    ];

    return [
        'options' => $options,
        'columns' => $columns,
    ];
}
`;
}

function generateLang(NAME: string, fields: FilterField[]): string {
  const lines = fields
    .map(field => {
      const title = field.label || field.field;
      return `define('${filterTitle(NAME, field.field)}', '${title.replace(/'/g, "\\'")}');`;
    })
    .join('\n');

  return `<?php
// Заголовки колонок фильтра. Перенесите константы в языковой файл контроллера.

${lines}
`;
}

/**
 * Фронтенд-фильтр списка контроллера.
 *
 * Механизм повторяет контроллер content (system/controllers/content/frontend.php):
 * поля cmsFormField сами применяют значение к модели через applyFilter().
 */
function generateFrontendFilter(
  lowercase: string,
  UpperCamelCase: string,
  NAME: string,
  fields: FilterField[]
): string {
  const fieldsCode = fields
    .map(field => {
      const className = FRONTEND_FIELD_CLASSES[field.type];
      const options = [`'title' => ${filterTitle(NAME, field.field)}`];

      if ((field.type === 'select' || field.type === 'multiselect') && field.options?.length) {
        const items = field.options
          .map(option => `'${option.value}' => '${option.label.replace(/'/g, "\\'")}'`)
          .join(', ');
        options.push(`'items' => [${items}]`);
      }

      return `            '${field.field}' => new ${className}('${field.field}', [${options.join(', ')}]),`;
    })
    .join('\n');

  return `<?php

/**
 * Фильтры фронтенд-списка контроллера ${lowercase}.
 *
 * Подключение в экшене index:
 *
 *     $active = ${UpperCamelCase}Filter::apply($this->model, $this->request);
 *     $items  = $this->model->getPublished($perpage, ($page - 1) * $perpage);
 *     ...
 *     'filter' => [
 *         'fields' => ${UpperCamelCase}Filter::getFields(),
 *         'active' => $active,
 *     ]
 *
 * Поля строятся на cmsFormField, поэтому применяются ядром через applyFilter()
 * (как в system/controllers/content/frontend.php).
 */
class ${UpperCamelCase}Filter {

    /**
     * @return array[string]cmsFormField
     */
    public static function getFields(): array {

        return [
${fieldsCode}
        ];
    }

    /**
     * Применяет фильтры из запроса к модели.
     *
     * @param cmsModel   $model
     * @param cmsRequest $request
     * @return array активные значения по имени поля
     */
    public static function apply(cmsModel $model, cmsRequest $request): array {

        $active = [];

        foreach (self::getFields() as $name => $field) {

            if (!$request->has($name)) {
                continue;
            }

            $value = $request->get($name, false, $field->getDefaultVarType());
            $value = $field->storeFilter($value);

            if (is_empty_value($value)) {
                continue;
            }

            if ($field->applyFilter($model, $value) !== false) {
                $active[$name] = $value;
            }
        }

        return $active;
    }

    /**
     * Активные фильтры как строка запроса — для ссылок пагинации.
     */
    public static function getQuery(array $active): string {

        return $active ? http_build_query($active) : '';
    }
}
`;
}

export function scaffoldFilter(opts: ScaffoldFilterOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_filter', opts.options, {
    use_ajax: 'грид ICMS2 фильтрует без перезагрузки сам — отдельная AJAX-реализация не нужна',
    use_url_params: 'параметры фильтра грид разбирает из URL автоматически',
    save_filters: 'сохранение пользовательских фильтров в ICMS2 не поддержано',
  });

  if (!opts.fields?.length) {
    throw new Error('scaffold_filter: нужен хотя бы один фильтруемый столбец');
  }

  for (const field of opts.fields) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(field.field)) {
      throw new Error(`scaffold_filter: недопустимое имя поля ${field.field}`);
    }
  }

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const NAME = lowercase.toUpperCase();
  const gridName = lowercase;
  const frontend = Boolean(opts.options?.frontend);

  if (frontend) {
    for (const field of opts.fields) {
      if ((field.type === 'select' || field.type === 'multiselect') && !field.options?.length) {
        throw new Error(
          `scaffold_filter: для типа ${field.type} в поле ${field.field} нужны options (значение и подпись)`
        );
      }
    }
  }

  const filterFields = opts.fields.map(field => ({
    field: field.field,
    type: field.type,
    filter: FILTER_TYPES[field.type],
  }));

  const files: Record<string, string> = {
    [`package/system/controllers/${lowercase}/backend/grids/grid_${gridName}.php`]:
      generateGridFunction(gridName, NAME, opts.fields),
    [`package/system/languages/ru/controllers/${lowercase}/${lowercase}.php`]: generateLang(
      NAME,
      opts.fields
    ),
  };

  if (frontend) {
    files[`package/system/controllers/${lowercase}/${lowercase}_filter.php`] =
      generateFrontendFilter(lowercase, UpperCamelCase, NAME, opts.fields);
  }

  return {
    addon_name: lowercase,
    grid_name: gridName,
    function_name: `grid_${gridName}`,
    filter_fields: filterFields,
    scaffold_status: 'partial',
    files,
    supported_options: ['frontend'],
    options_applied: { frontend },
    structure_notes: [
      `Функция грида: grid_${gridName}($controller) в backend/grids/grid_${gridName}.php`,
      `Экшен подключает грид через $this->grid_name = '${gridName}';`,
      `Заголовки колонок: константы LANG_${NAME}_* в языковом файле контроллера`,
      'Колонки без поддержанного типа фильтрации (checkbox) получают обычный столбец',
      frontend
        ? `Фронтенд-фильтр: класс ${UpperCamelCase}Filter в ${lowercase}_filter.php`
        : 'Фронтенд-фильтр не запрошен (frontend) — генератор делает только бэкенд-грид',
    ],
    limitations: [
      'Тип фильтра checkbox не поддержан в гриде — используйте колонку-флаг (flag) без фильтра.',
      'Языковой файл может перезаписать существующий — перенесите константы в свой файл.',
      'Грид показывает только указанные столбцы: объедините их с остальными вручную.',
      frontend
        ? `${UpperCamelCase}Filter::apply() нужно вызвать в экшене index до выборки строк; разметку формы стройте по ${UpperCamelCase}Filter::getFields().`
        : 'Фронтенд-фильтр включается опцией frontend.',
    ],
  };
}
