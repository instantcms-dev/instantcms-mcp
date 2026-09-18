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

  const { lowercase } = normalizeAddonName(opts.addon_name);
  const NAME = lowercase.toUpperCase();
  const gridName = lowercase;

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

  return {
    addon_name: lowercase,
    grid_name: gridName,
    function_name: `grid_${gridName}`,
    filter_fields: filterFields,
    scaffold_status: 'partial',
    files,
    structure_notes: [
      `Функция грида: grid_${gridName}($controller) в backend/grids/grid_${gridName}.php`,
      `Экшен подключает грид через $this->grid_name = '${gridName}';`,
      `Заголовки колонок: константы LANG_${NAME}_* в языковом файле контроллера`,
      'Колонки без поддержанного типа фильтрации (checkbox) получают обычный столбец',
    ],
    limitations: [
      'Тип фильтра checkbox не поддержан — используйте колонку-флаг (flag) без фильтра.',
      'Языковой файл может перезаписать существующий — перенесите константы в свой файл.',
      'Грид показывает только указанные столбцы: объедините их с остальными вручную.',
    ],
  };
}
