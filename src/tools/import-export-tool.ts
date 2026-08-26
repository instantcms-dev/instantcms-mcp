/**
 * @fileoverview Import/Export scaffolding tool for InstantCMS
 * Generates import/export classes for CSV, Excel, JSON, and XML formats
 */

import { z } from 'zod';
import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';

/**
 * Available field types for import/export
 */
export const FieldTypeEnum = z.enum([
  'string',
  'text',
  'number',
  'date',
  'datetime',
  'bool',
  'select',
  'image',
  'file',
]);

type FieldType = z.infer<typeof FieldTypeEnum>;

/**
 * Single import/export field definition
 */
interface ImportExportField {
  /** Database field name */
  field: string;
  /** Field type for parsing */
  type: FieldType;
  /** Display label in CSV header */
  label?: string;
  /** Whether field is required */
  required?: boolean;
  /** Default value */
  default?: string;
  /** Options for select type */
  options?: { value: string; label: string }[];
}

/**
 * Options for import/export generation
 */
interface ScaffoldImportExportOptions {
  /** System name of the addon */
  addon_name: string;
  /** List of fields to import/export */
  fields: ImportExportField[];
  /** Additional configuration */
  options?: {
    /** Enable CSV format support */
    use_csv?: boolean;
    /** Enable Excel (XLSX) format support */
    use_xlsx?: boolean;
    /** Enable JSON API support */
    use_json?: boolean;
    /** Enable XML format support */
    use_xml?: boolean;
    /** Number of records per batch */
    batch_size?: number;
    /** Skip header row in CSV */
    skip_header?: boolean;
    /** Update existing records by slug */
    update_existing?: boolean;
  };
}

/**
 * Normalizes field with label defaults
 */
function normalizeField(f: ImportExportField): ImportExportField {
  return {
    field: f.field,
    type: f.type,
    label: f.label || f.field,
    required: f.required ?? false,
    default: f.default,
    options: f.options,
  };
}

/**
 * Generates import class
 */
function generateImportClass(
  name: string,
  Name: string,
  fields: ImportExportField[],
  options: Record<string, unknown>
): string {
  const fieldParsing = fields
    .map(f => {
      switch (f.type) {
        case 'number':
          return `        '${f.field}' => isset($row['${f.label}']) ? floatval($row['${f.label}']) : null,`;
        case 'bool':
          return `        '${f.field}' => isset($row['${f.label}']) ? (in_array(strtolower($row['${f.label}']), ['1', 'yes', 'true', 'да'], true) ? 1 : 0) : 0,`;
        case 'date':
          return `        '${f.field}' => isset($row['${f.label}']) ? date('Y-m-d', strtotime($row['${f.label}'])) : null,`;
        case 'datetime':
          return `        '${f.field}' => isset($row['${f.label}']) ? date('Y-m-d H:i:s', strtotime($row['${f.label}'])) : null,`;
        case 'select':
          return `        '${f.field}' => \\$row['${f.label}'] ?? null,`;
        default:
          return `        '${f.field}' => \\$row['${f.label}'] ?? null,`;
      }
    })
    .join('\n');

  const validation = fields
    .filter(f => f.required)
    .map(f => {
      return `            if (empty(\\$item['${f.field}'])) {
                throw new Exception('Поле ${f.label || f.field} обязательно для заполнения');
            }`;
    })
    .join('\n');

  return `<?php
// InstantCMS 2. ${name}/import.php

class ${Name}Import {
    private $model;
    private $options = [];
    private $stats = [
        'total' => 0,
        'imported' => 0,
        'updated' => 0,
        'skipped' => 0,
        'errors' => 0,
    ];

    public function __construct($options = []) {
        $this->model = cmsModel::getInstance();
        $this->options = array_merge([
            'batch_size' => ${options.batch_size},
            'skip_header' => ${options.skip_header},
            'update_existing' => ${options.update_existing},
        ], $options);
    }

    public function importFromArray($data) {
        $this->stats['total'] = count($data);

        if ($this->options['skip_header'] && !empty($data[0])) {
            array_shift($data);
        }

        $batches = array_chunk($data, $this->options['batch_size']);

        foreach ($batches as $batch) {
            $this->processBatch($batch);
        }

        return $this->stats;
    }

    private function processBatch($rows) {
        foreach ($rows as $row) {
            try {
                $this->importRow($row);
            } catch (Exception $e) {
                $this->stats['errors']++;
                if ($this->options['stop_on_error'] ?? false) {
                    throw $e;
                }
            }
        }
    }

    private function importRow($row) {
        $item = [
${fieldParsing}
        ];

${validation}

        if ($this->options['update_existing'] && !empty($item['slug'])) {
            $existing = $this->model->getItem('${name}', ['slug' => $item['slug']]);
            if ($existing) {
                $this->model->update('${name}', $existing['id'], $item);
                $this->stats['updated']++;
                return;
            }
        }

        $id = $this->model->insert('${name}', $item);

        if ($id) {
            $this->stats['imported']++;
        } else {
            $this->stats['skipped']++;
        }
    }

    public function getStats() {
        return $this->stats;
    }

    public function validateCsv($content) {
        $lines = explode("\\n", trim($content));
        if (empty($lines)) {
            throw new Exception('Пустой файл');
        }

        $delimiter = $this->detectDelimiter($content);
        $rows = [];

        foreach ($lines as $line) {
            $rows[] = str_getcsv($line, $delimiter);
        }

        return $rows;
    }

    private function detectDelimiter($content) {
        $firstLine = explode("\\n", $content)[0];
        $commas = substr_count($firstLine, ',');
        $semicolons = substr_count($firstLine, ';');
        $tabs = substr_count($firstLine, "\\t");

        if ($tabs > $commas && $tabs > $semicolons) {
            return "\\t";
        }
        if ($semicolons > $commas) {
            return ';';
        }
        return ',';
    }
}`;
}

/**
 * Generates export class
 */
function generateExportClass(
  name: string,
  Name: string,
  fields: ImportExportField[],
  _options: Record<string, unknown>
): string {
  const fieldHeaders = fields.map(f => `'${f.label || f.field}'`).join(', ');

  const fieldMapping = fields
    .map(f => {
      return `            '${f.field}' => \\$item['${f.field}'],`;
    })
    .join('\n');

  return `<?php
// InstantCMS 2. ${name}/export.php

class ${Name}Export {
    private $model;
    private $options = [];

    public function __construct($options = []) {
        $this->model = cmsModel::getInstance();
        $this->options = $options;
    }

    public function exportToArray($filters = []) {
        $items = $this->getItems($filters);
        $result = [];

        $result[] = [${fieldHeaders}];

        foreach ($items as $item) {
            $result[] = [
${fieldMapping}
            ];
        }

        return $result;
    }

    public function exportToCsv($filters = []) {
        $data = $this->exportToArray($filters);

        if (empty($data)) {
            return '';
        }

        $output = fopen('php://temp', 'r+');

        foreach ($data as $row) {
            fputcsv($output, $row);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    public function exportToJson($filters = []) {
        $items = $this->getItems($filters);
        return json_encode($items, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public function exportToXml($filters = []) {
        $items = $this->getItems($filters);

        $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><${name}_list></${name}_list>');

        foreach ($items as $item) {
            $itemXml = $xml->addChild('item');
            foreach ($item as $key => $value) {
                if (is_array($value) || is_object($value)) {
                    continue;
                }
                $itemXml->addChild($key, htmlspecialchars($value));
            }
        }

        return $xml->asXML();
    }

    private function getItems($filters = []) {
        $query = $this->model->get('${name}', null, function ($model, $item) {
            return $item;
        });

        if (!empty($filters)) {
            foreach ($filters as $key => $value) {
                if ($value !== null && $value !== '') {
                    $query->where($key, '=', $value);
                }
            }
        }

        $page = $this->options['page'] ?? 1;
        $per_page = $this->options['per_page'] ?? 100;

        return $query->orderBy('id', 'DESC')->limit($page, $per_page)->fetchAll();
    }

    public function getTotalCount($filters = []) {
        return $this->model->getCount('${name}', function ($model) use ($filters) {
            if (!empty($filters)) {
                foreach ($filters as $key => $value) {
                    if ($value !== null && $value !== '') {
                        $model->where($key, '=', $value);
                    }
                }
            }
        });
    }
}`;
}

/**
 * Generates import form class
 */
function generateImportForm(
  name: string,
  Name: string,
  _fields: ImportExportField[],
  options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. ${name}/import.form.php

class ${Name}ImportForm {
    public function __construct($form) {
        $form->addField('import_file', new fieldFile('Файл для импорта', [
            'extensions' => ${options.use_xlsx ? "['csv', 'xlsx', 'xls']" : "['csv']"},
            'max_size' => 10 * 1024 * 1024,
            'required' => true,
        ]));

        $form->addField('update_existing', new fieldCheckbox('Обновлять существующие записи', [
            'is_checked' => ${options.update_existing},
        ]));

        $form->addField('skip_header', new fieldCheckbox('Пропустить первую строку (заголовки)', [
            'is_checked' => ${options.skip_header},
        ]));

        $form->addField('encoding', new fieldList('Кодировка файла', [
            'options' => [
                'utf-8' => 'UTF-8',
                'windows-1251' => 'Windows-1251',
                'koi8-r' => 'KOI8-R',
            ],
            'default' => 'utf-8',
        ]));
    }

    public static function create($form) {
        return new self($form);
    }
}`;
}

/**
 * Generates API import/export controller
 */
function generateApiImport(
  name: string,
  Name: string,
  _fields: ImportExportField[],
  options: Record<string, unknown>
): string {
  return `<?php
// InstantCMS 2. ${name}/api.import.php

class ${Name}ApiImport {
    public function __construct($controller) {
        $this->controller = $controller;
    }

    public function actionImport() {
        $request = $this->controller->request;

        $data = $request->get('data');
        if (empty($data)) {
            $this->controller->halt(400, json_encode(['error' => 'No data provided']));
        }

        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!is_array($data)) {
            $this->controller->halt(400, json_encode(['error' => 'Invalid data format']));
        }

        $import = new ${Name}Import([
            'update_existing' => $request->get('update_existing', ${options.update_existing}),
        ]);

        try {
            $stats = $import->importFromArray($data);
            $this->controller->halt(200, json_encode([
                'success' => true,
                'stats' => $stats,
            ]));
        } catch (Exception $e) {
            $this->controller->halt(500, json_encode([
                'error' => $e->getMessage(),
            ]));
        }
    }

    public function actionExport() {
        $request = $this->controller->request;
        $format = $request->get('format', 'json');

        $filters = [];
        $filters['is_published'] = $request->get('published', null);

        $export = new ${Name}Export([
            'page' => $request->get('page', 1),
            'per_page' => $request->get('per_page', 100),
        ]);

        switch ($format) {
            case 'csv':
                $content = $export->exportToCsv($filters);
                $this->controller->halt(200, $content);
                break;
            case 'xml':
                $content = $export->exportToXml($filters);
                $this->controller->halt(200, $content);
                break;
            default:
                $content = $export->exportToJson($filters);
                $this->controller->halt(200, $content);
        }
    }

    public function actionValidate() {
        $request = $this->controller->request;
        $data = $request->get('data');

        if (empty($data)) {
            $this->controller->halt(400, json_encode(['error' => 'No data provided']));
        }

        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        $errors = [];
        $rowNum = 0;

        foreach ($data as $row) {
            $rowNum++;
            foreach ($row as $key => $value) {
                if (empty($value) && in_array($key, ['title', 'name'])) {
                    $errors[] = "Row {$rowNum}: Field '{$key}' is required";
                }
            }
        }

        if (empty($errors)) {
            $this->controller->halt(200, json_encode([
                'valid' => true,
                'rows' => count($data),
            ]));
        } else {
            $this->controller->halt(400, json_encode([
                'valid' => false,
                'errors' => $errors,
            ]));
        }
    }
}`;
}

/**
 * Generates a complete import/export system for an InstantCMS addon
 *
 * @param opts - Configuration options for import/export
 * @returns Object containing generated files and metadata
 *
 * @example
 * ```typescript
 * const result = scaffoldImportExport({
 *   addon_name: 'products',
 *   fields: [
 *     { field: 'title', type: 'string', label: 'Название', required: true },
 *     { field: 'price', type: 'number', label: 'Цена' }
 *   ],
 *   options: { use_csv: true, use_json: true, batch_size: 100 }
 * });
 * ```
 */
export function scaffoldImportExport(opts: ScaffoldImportExportOptions): ScaffoldResult {
  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const fields = opts.fields.map(normalizeField);

  const options = {
    use_csv: opts.options?.use_csv ?? true,
    use_xlsx: opts.options?.use_xlsx ?? true,
    use_json: opts.options?.use_json ?? true,
    use_xml: opts.options?.use_xml ?? false,
    batch_size: opts.options?.batch_size ?? 100,
    skip_header: opts.options?.skip_header ?? true,
    update_existing: opts.options?.update_existing ?? true,
  };

  files[`${lowercase}/import.php`] = generateImportClass(
    lowercase,
    UpperCamelCase,
    fields,
    options
  );
  files[`${lowercase}/export.php`] = generateExportClass(
    lowercase,
    UpperCamelCase,
    fields,
    options
  );

  if (options.use_csv || options.use_xlsx) {
    files[`${lowercase}/import.form.php`] = generateImportForm(
      lowercase,
      UpperCamelCase,
      fields,
      options
    );
  }

  if (options.use_json) {
    files[`${lowercase}/api.import.php`] = generateApiImport(
      lowercase,
      UpperCamelCase,
      fields,
      options
    );
  }

  return {
    addon_name: lowercase,
    files,
    fields_count: fields.length,
    options,
  };
}

export const importExportToolSchema = {
  name: 'scaffold_import_export',
  description: 'Генерация системы импорта/экспорта данных для InstantCMS',
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
              enum: [
                'string',
                'text',
                'number',
                'date',
                'datetime',
                'bool',
                'select',
                'image',
                'file',
              ],
              description: 'Тип поля',
            },
            label: { type: 'string', description: 'Название в CSV/заголовке' },
            required: { type: 'boolean', description: 'Обязательное' },
            default: { type: 'string', description: 'Значение по умолчанию' },
          },
        },
        description: 'Поля для импорта/экспорта',
      },
      options: {
        type: 'object',
        properties: {
          use_csv: { type: 'boolean', description: 'Поддержка CSV' },
          use_xlsx: { type: 'boolean', description: 'Поддержка Excel' },
          use_json: { type: 'boolean', description: 'Поддержка JSON API' },
          use_xml: { type: 'boolean', description: 'Поддержка XML' },
          batch_size: { type: 'number', description: 'Размер батча' },
          skip_header: { type: 'boolean', description: 'Пропускать заголовки' },
          update_existing: { type: 'boolean', description: 'Обновлять существующие' },
        },
      },
    },
    required: ['addon_name'],
  },
  inputExamples: [
    {
      addon_name: 'products',
      fields: [
        { field: 'title', type: 'string', label: 'Название', required: true },
        { field: 'price', type: 'number', label: 'Цена' },
        { field: 'description', type: 'text', label: 'Описание' },
      ],
      options: { use_csv: true, use_json: true },
    },
  ],
};
