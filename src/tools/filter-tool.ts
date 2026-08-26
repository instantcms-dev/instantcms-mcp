/**
 * @fileoverview Content filtering system scaffolding tool for InstantCMS
 * Generates filter classes, forms, hooks, and optional saved filters
 */

import { z } from 'zod';
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
function normalizeField(f: FilterField): FilterField {
  return {
    field: f.field,
    type: f.type,
    label: f.label || f.field,
    options: f.options || [],
    placeholder: f.placeholder || '',
  };
}

/**
 * Generates the main filter class
 */
function generateFilterClass(name: string, Name: string, fields: FilterField[]): string {
  const filterInit = fields
    .map(f => {
      return `        '${f.field}' => [
            'type' => '${f.type}',
            'label' => '${f.label}',
            'options' => [${(f.options || []).map(o => `'${o.value}' => '${o.label}'`).join(', ')}],
        ]`;
    })
    .join(',\n');

  const applyConditions = fields
    .map(f => {
      switch (f.type) {
        case 'text':
          return `        if (!empty($filters['${f.field}'])) {
            $where[] = "${f.field} LIKE '%" . db::escapeLike($filters['${f.field}']) . "%'";
        }`;
        case 'select':
          return `        if (!empty($filters['${f.field}'])) {
            $where[] = "${f.field} = '" . db::escape($filters['${f.field}']) . "'";
        }`;
        case 'multiselect':
          return `        if (!empty($filters['${f.field}']) && is_array($filters['${f.field}'])) {
            $ids = array_map('intval', $filters['${f.field}']);
            $where[] = "${f.field} IN (" . implode(',', $ids) . ")";
        }`;
        case 'checkbox':
          return `        if (isset($filters['${f.field}'])) {
            $where[] = "${f.field} = " . (int)$filters['${f.field}'];
        }`;
        case 'range':
          return `        if (!empty($filters['${f.field}_from'])) {
            $where[] = "${f.field} >= " . (float)$filters['${f.field}_from'];
        }
        if (!empty($filters['${f.field}_to'])) {
            $where[] = "${f.field} <= " . (float)$filters['${f.field}_to'];
        }`;
        case 'date':
          return `        if (!empty($filters['${f.field}'])) {
            $where[] = "DATE(${f.field}) = '" . db::escape($filters['${f.field}']) . "'";
        }`;
        case 'daterange':
          return `        if (!empty($filters['${f.field}_from'])) {
            $where[] = "${f.field} >= '" . db::escape($filters['${f.field}_from']) . "'";
        }
        if (!empty($filters['${f.field}_to'])) {
            $where[] = "${f.field} <= '" . db::escape($filters['${f.field}_to']) . "'";
        }`;
        default:
          return '';
      }
    })
    .join('\n');

  return `<?php
// InstantCMS 2. ${name}/filters.php

class ${Name}Filter {
    private static $instance = null;
    private $filters = [];

    private function __construct() {
        $this->filters = $this->getDefaultFilters();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getDefaultFilters() {
        return [
${filterInit}
        ];
    }

    public function apply($model, $filters = []) {
        if (empty($filters)) {
            return $model;
        }

        $where = [];
${applyConditions}

        if (!empty($where)) {
            $model->where(implode(' AND ', $where));
        }

        return $model;
    }

    public function getFromRequest($request) {
        $filters = [];
        foreach ($this->filters as $field => $config) {
            $value = $request->get($field);
            if ($value !== null && $value !== '') {
                $filters[$field] = $value;
            }
        }
        return $filters;
    }

    public function validate($filters) {
        $errors = [];

        foreach ($filters as $field => $value) {
            if (!isset($this->filters[$field])) {
                continue;
            }

            $config = $this->filters[$field];

            switch ($config['type']) {
                case 'text':
                    if (strlen($value) > 255) {
                        $errors[$field] = 'Слишком длинное значение';
                    }
                    break;
                case 'select':
                    if (!isset($config['options'][$value])) {
                        $errors[$field] = 'Недопустимое значение';
                    }
                    break;
                case 'multiselect':
                    if (!is_array($value)) {
                        $errors[$field] = 'Ожидался массив';
                    }
                    break;
                case 'range':
                case 'daterange':
                    if (!is_numeric($value) && !strtotime($value)) {
                        $errors[$field] = 'Недопустимое значение';
                    }
                    break;
            }
        }

        return $errors;
    }
}`;
}

/**
 * Generates the filter form class
 */
function generateFilterForm(name: string, Name: string, fields: FilterField[]): string {
  const formFields = fields
    .map(f => {
      const placeholder = f.placeholder ? `, 'placeholder' => '${f.placeholder}'` : '';

      switch (f.type) {
        case 'text':
          return `        $form->addField('${f.field}', new fieldString('${f.label}', [${placeholder}]));`;
        case 'select': {
          const opts =
            (f.options || []).length > 0
              ? `['options' => [${(f.options || []).map(o => `'${o.value}' => '${o.label}'`).join(', ')}]]`
              : '';
          return `        $form->addField('${f.field}', new fieldList('${f.label}', ${opts}));`;
        }
        case 'multiselect': {
          const multiOpts =
            (f.options || []).length > 0
              ? `['options' => [${(f.options || []).map(o => `'${o.value}' => '${o.label}'`).join(', ')}]]`
              : '';
          return `        $form->addField('${f.field}', new fieldList('${f.label}', ['is_multiple' => true${multiOpts ? ', ' + multiOpts : ''}]));`;
        }
        case 'checkbox':
          return `        $form->addField('${f.field}', new fieldCheckbox('${f.label}'));`;
        case 'range':
          return `        $form->addField('${f.field}_from', new fieldNumber('${f.label} (от)'));
        $form->addField('${f.field}_to', new fieldNumber('${f.label} (до)'));`;
        case 'date':
          return `        $form->addField('${f.field}', new fieldDate('${f.label}'));`;
        case 'daterange':
          return `        $form->addField('${f.field}_from', new fieldDate('${f.label} (от)'));
        $form->addField('${f.field}_to', new fieldDate('${f.label} (до)'));`;
        default:
          return '';
      }
    })
    .join('\n');

  return `<?php
// InstantCMS 2. ${name}/filter.form.php

class ${Name}FilterForm {
    public function __construct($form) {
${formFields}
    }

    public static function create($form) {
        return new self($form);
    }
}`;
}

/**
 * Generates hook handlers for filter integration
 */
function generateFilterHooks(name: string, Name: string, _fields: FilterField[]): string {
  return `<?php
// InstantCMS 2. system/hooks/${name}/filter.hooks.php

class on${Name}FilterHook {
    public function onBeforeLoadModel($model) {
        $request = cmsCore::getInstance()->request;
        $filters = ${Name}Filter::getInstance()->getFromRequest($request);

        if (!empty($filters)) {
            ${Name}Filter::getInstance()->apply($model, $filters);

            // Сохраняем в сессию
            cmsUser::sessionPut('${name}_filters', $filters);
        }
    }

    public function onBeforeRender($controller) {
        $filters = cmsUser::sessionGet('${name}_filters', []);
        $controller->renderTemplate('filter', [
            'filters' => ${Name}Filter::getInstance()->getDefaultFilters(),
            'values' => $filters,
        ]);
    }
}`;
}

/**
 * Generates saved filters feature
 */
function generateSavedFilters(name: string, Name: string, _fields: FilterField[]): string {
  return `<?php
// InstantCMS 2. ${name}/saved_filters.php

class ${Name}SavedFilters {
    public static function save($user_id, $name, $filters) {
        $model = cmsModel::getInstance();

        $model->insert('saved_filters', [
            'user_id' => $user_id,
            'name' => $name,
            'filters' => json_encode($filters),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    public static function load($user_id, $filter_id) {
        $model = cmsModel::getInstance();
        return $model->getItemById('saved_filters', $filter_id, false, function ($item) {
            $item['filters'] = json_decode($item['filters'], true);
            return $item;
        });
    }

    public static function getAll($user_id) {
        $model = cmsModel::getInstance();
        return $model->get('saved_filters', function ($item) {
            $item['filters'] = json_decode($item['filters'], true);
            return $item;
        }, [
            'user_id' => $user_id,
        ]);
    }

    public static function delete($user_id, $filter_id) {
        $model = cmsModel::getInstance();
        return $model->delete('saved_filters', $filter_id, ['user_id' => $user_id]);
    }
}`;
}

/**
 * Generates a complete filtering system for an InstantCMS addon
 *
 * @param opts - Configuration options for the filter system
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldFilter({
 *   addon_name: 'catalog',
 *   fields: [
 *     { field: 'price', type: 'range', label: 'Цена' },
 *     { field: 'category_id', type: 'select', label: 'Категория' }
 *   ],
 *   options: { use_ajax: true, save_filters: true }
 * });
 * ```
 */
export function scaffoldFilter(opts: ScaffoldFilterOptions): ScaffoldResult {
  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const filterFields = opts.fields.map(normalizeField);

  files[`${lowercase}/filters.php`] = generateFilterClass(lowercase, UpperCamelCase, filterFields);
  files[`${lowercase}/filter.form.php`] = generateFilterForm(
    lowercase,
    UpperCamelCase,
    filterFields
  );
  files[`system/hooks/${lowercase}/filter.hooks.php`] = generateFilterHooks(
    lowercase,
    UpperCamelCase,
    filterFields
  );

  if (opts.options?.save_filters) {
    files[`${lowercase}/saved_filters.php`] = generateSavedFilters(
      lowercase,
      UpperCamelCase,
      filterFields
    );
  }

  return {
    addon_name: lowercase,
    filters_count: filterFields.length,
    options: opts.options || {},
    files,
    filters: filterFields.map(f => ({
      field: f.field,
      type: f.type,
      label: f.label,
    })),
  };
}
