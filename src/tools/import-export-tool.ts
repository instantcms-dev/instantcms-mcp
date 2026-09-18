/**
 * @fileoverview Import/Export scaffolding tool for InstantCMS
 * Generates import/export classes for CSV, JSON, and XML formats
 *
 * Проверено по исходникам InstantCMS 2.18.2:
 * - модель данных — `cmsModel` (`insert`, `update`, `getItemByField`, `get`,
 *   `getCount`, `filterEqual`, `orderBy`, `limitPage`); статического
 *   `cmsModel::getInstance()` в ядре нет;
 * - библиотечные классы дополнения не автозагружаются, поэтому соседние файлы
 *   подключаются явным `require_once __DIR__ . '/...'`;
 * - формы собираются через `cmsForm::addField($fieldset_id, cmsFormField)`,
 *   `fieldFile`/`fieldCheckbox`/`fieldList` — реальные поля ядра;
 * - API-действия — отдельные файлы `actions/<action>.php` с классом
 *   `action<Controller><Action>`; ответ формируется `cmsResponse`.
 */

import { normalizeAddonName, type ScaffoldResult } from '../types/scaffold';
import { phpValue, quotePhp } from '../utils/serialization';
import { rejectUnsupportedOptions } from '../utils/generator-options';

/**
 * Available field types for import/export
 */
export const FieldTypeEnum = [
  'string',
  'text',
  'number',
  'date',
  'datetime',
  'bool',
  'select',
  'image',
  'file',
] as const;

type FieldType = (typeof FieldTypeEnum)[number];

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
    /** Table to import into / export from (default: <name>_items, как у scaffold_crud) */
    table?: string;
    /** Field used to find an existing row (default: slug) */
    key_field?: string;
    /** Values merged into every imported row (e.g. date_pub) */
    defaults?: Record<string, string | number | boolean>;
    /** Enable CSV upload form */
    use_csv?: boolean;
    /**
     * Заявлена в схеме для совместимости, но генератор её отклоняет:
     * разбор XLSX требует внешней библиотеки, которой нет в ядре ICMS.
     */
    use_xlsx?: boolean;
    /** Enable JSON API actions */
    use_json?: boolean;
    /** Enable XML export */
    use_xml?: boolean;
    /** Number of records per batch */
    batch_size?: number;
    /** Skip header row in CSV */
    skip_header?: boolean;
    /** Update existing records by key_field */
    update_existing?: boolean;
  };
}

const SAFE_IDENT = /^[a-z][a-z0-9_]*$/;

function assertSafeIdentifier(_tool: string, value: string, what: string): void {
  if (!SAFE_IDENT.test(value)) {
    throw new Error(`${what}: допустимы строчные латинские буквы, цифры и _ (получено «${value}»)`);
  }
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
  const parsing = fields
    .map(f => {
      const label = quotePhp(f.label || f.field);
      const key = quotePhp(f.field);
      switch (f.type) {
        case 'number':
          return `            ${key} => isset($row[${label}]) && $row[${label}] !== '' ? (float) $row[${label}] : null,`;
        case 'bool':
          return `            ${key} => isset($row[${label}]) ? (in_array(strtolower((string) $row[${label}]), ['1', 'yes', 'true', 'да'], true) ? 1 : 0) : 0,`;
        case 'date':
          return `            ${key} => !empty($row[${label}]) ? date('Y-m-d', strtotime($row[${label}])) : null,`;
        case 'datetime':
          return `            ${key} => !empty($row[${label}]) ? date('Y-m-d H:i:s', strtotime($row[${label}])) : null,`;
        default:
          return `            ${key} => $row[${label}] ?? null,`;
      }
    })
    .join('\n');

  const validation = fields
    .filter(f => f.required)
    .map(f => {
      const message = quotePhp(`Поле ${f.label || f.field} обязательно для заполнения`);
      return `        if (empty($item[${quotePhp(f.field)}])) {
            throw new Exception(${message});
        }`;
    })
    .join('\n');

  return `<?php
// InstantCMS 2. system/controllers/${name}/import.php

/**
 * Импорт записей ${name} из массива или CSV.
 *
 * Модель можно передать снаружи (например, $this->model контроллера), иначе
 * создаётся обычная cmsModel. Таблица и ключ обновления задаются опциями:
 *
 *   $import = new ${Name}Import(['table' => '${String(options.table)}'], $model);
 *   $stats  = $import->importFromArray($rows);
 */
class ${Name}Import {
    private $model;
    private $table;
    private $options = [];
    private $stats = [
        'total' => 0,
        'imported' => 0,
        'updated' => 0,
        'skipped' => 0,
        'errors' => 0,
    ];

    public function __construct($options = [], $model = null) {
        $this->model = $model ? $model : new cmsModel();

        $this->options = array_merge([
            'table' => ${quotePhp(String(options.table))},
            'batch_size' => ${phpValue(options.batch_size)},
            'skip_header' => ${phpValue(options.skip_header)},
            'update_existing' => ${phpValue(options.update_existing)},
            'key_field' => ${quotePhp(String(options.key_field))},
            'stop_on_error' => false,
            'defaults' => ${phpValue(options.defaults)},
        ], $options);

        $this->table = $this->options['table'];
    }

    public function importFromArray($data) {
        if (!is_array($data)) {
            throw new Exception('Ожидался массив строк для импорта');
        }

        $this->stats['total'] = count($data);

        if ($this->options['skip_header'] && !empty($data)) {
            array_shift($data);
        }

        $batch_size = max(1, (int) $this->options['batch_size']);

        foreach (array_chunk($data, $batch_size) as $batch) {
            $this->processBatch($batch);
        }

        return $this->stats;
    }

    public function importFromCsv($content) {
        return $this->importFromArray($this->parseCsv($content));
    }

    public function parseCsv($content) {
        $content = trim((string) $content);

        if ($content === '') {
            throw new Exception('Пустой файл');
        }

        $delimiter = $this->detectDelimiter($content);
        $rows = [];

        foreach (preg_split('/\\r\\n|\\r|\\n/', $content) as $line) {
            if ($line === '') {
                continue;
            }
            $rows[] = str_getcsv($line, $delimiter, '"', "\\\\");
        }

        return $rows;
    }

    public function validateCsv($content) {
        return $this->parseCsv($content);
    }

    private function processBatch($rows) {
        foreach ($rows as $row) {
            try {
                $this->importRow($row);
            } catch (Exception $e) {
                $this->stats['errors']++;
                if (!empty($this->options['stop_on_error'])) {
                    throw $e;
                }
            }
        }
    }

    private function importRow($row) {
        if (!is_array($row)) {
            throw new Exception('Строка импорта должна быть массивом');
        }

        $item = array_merge($this->options['defaults'], [
${parsing}
        ]);

${validation}

        $key_field = (string) $this->options['key_field'];

        if ($this->options['update_existing'] && $key_field !== '' && !empty($item[$key_field])) {
            $existing = $this->model->getItemByField($this->table, $key_field, $item[$key_field]);

            if ($existing) {
                $this->model->update($this->table, (int) $existing['id'], $item);
                $this->stats['updated']++;
                return;
            }
        }

        $id = $this->model->insert($this->table, $item);

        if ($id) {
            $this->stats['imported']++;
        } else {
            $this->stats['skipped']++;
        }
    }

    private function detectDelimiter($content) {
        $first_line = strtok($content, "\\r\\n");

        $commas = substr_count($first_line, ',');
        $semicolons = substr_count($first_line, ';');
        $tabs = substr_count($first_line, "\\t");

        if ($tabs > $commas && $tabs > $semicolons) {
            return "\\t";
        }

        if ($semicolons > $commas) {
            return ';';
        }

        return ',';
    }

    public function getStats() {
        return $this->stats;
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
  options: Record<string, unknown>
): string {
  const headers = fields.map(f => quotePhp(f.label || f.field)).join(', ');

  const mapping = fields
    .map(f => `                ${quotePhp(f.field)} => $item[${quotePhp(f.field)}] ?? '',`)
    .join('\n');

  const xmlMethod = options.use_xml
    ? `
    public function exportToXml($filters = []) {
        $items = $this->getItems($filters);

        $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><items></items>');

        foreach ($items as $item) {
            $node = $xml->addChild('item');

            foreach ($item as $key => $value) {
                if (!is_scalar($value)) {
                    continue;
                }
                $node->addChild((string) $key, htmlspecialchars((string) $value));
            }
        }

        return $xml->asXML();
    }
`
    : '';

  return `<?php
// InstantCMS 2. system/controllers/${name}/export.php

/**
 * Экспорт записей ${name} в массив, CSV, JSON и (опционально) XML.
 *
 *   $export = new ${Name}Export(['table' => '${String(options.table)}'], $model);
 *   $rows   = $export->exportToArray(['is_pub' => 1]);
 */
class ${Name}Export {
    private $model;
    private $table;
    private $options = [];

    public function __construct($options = [], $model = null) {
        $this->model = $model ? $model : new cmsModel();

        $this->options = array_merge([
            'table' => ${quotePhp(String(options.table))},
            'page' => 1,
            'per_page' => ${phpValue(options.per_page)},
        ], $options);

        $this->table = $this->options['table'];
    }

    public function exportToArray($filters = []) {
        $items = $this->getItems($filters);

        $result = [[${headers}]];

        foreach ($items as $item) {
            $result[] = [
${mapping}
            ];
        }

        return $result;
    }

    public function exportToCsv($filters = []) {
        $rows = $this->exportToArray($filters);

        $output = fopen('php://temp', 'r+');

        foreach ($rows as $row) {
            fputcsv($output, $row, ',', '"', "\\\\");
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    public function exportToJson($filters = []) {
        return json_encode($this->getItems($filters), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
${xmlMethod}
    public function getItems($filters = []) {
        $this->applyFilters($filters);

        $page = max(1, (int) $this->options['page']);
        $per_page = max(1, (int) $this->options['per_page']);

        $items = $this->model
            ->orderBy('id', 'DESC')
            ->limitPage($page, $per_page)
            ->get($this->table);

        return $items ? $items : [];
    }

    public function getTotalCount($filters = []) {
        $this->applyFilters($filters);

        return (int) $this->model->getCount($this->table, 'id', true);
    }

    private function applyFilters($filters) {
        if (!is_array($filters)) {
            return;
        }

        foreach ($filters as $field => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $this->model->filterEqual($field, $value);
        }
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
// InstantCMS 2. system/controllers/${name}/import.form.php

/**
 * Поля формы импорта. Подключается к форме контроллера:
 *
 *   $form = new cmsForm();
 *   ${Name}ImportForm::create($form);
 */
class ${Name}ImportForm {
    public function __construct($form) {
        $form->addField('import', new fieldFile('import_file', [
            'title' => 'Файл для импорта',
            'extensions' => 'csv',
            'max_size_mb' => 10,
            'rules' => [['required']],
        ]));

        $form->addField('import', new fieldCheckbox('update_existing', [
            'title' => 'Обновлять существующие записи',
            'default' => ${phpValue(options.update_existing)},
        ]));

        $form->addField('import', new fieldCheckbox('skip_header', [
            'title' => 'Пропустить первую строку (заголовки)',
            'default' => ${phpValue(options.skip_header)},
        ]));

        $form->addField('import', new fieldList('encoding', [
            'title' => 'Кодировка файла',
            'items' => [
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

function apiRespondHelper(): string {
  return `    protected function respond($data, $code = 200, $content_type = '') {
        $response = cmsCore::getInstance()->response
            ->setStatusCode($code)
            ->setContent($data);

        if ($content_type !== '') {
            $response->setHeader('Content-type', $content_type);
        }

        return $response->sendAndExit();
    }`;
}

/**
 * Generates a real API controller action (actions/<action>.php).
 * Класс называется так, как его ищет ядро: action<Controller><Action>.
 */
function generateApiAction(
  name: string,
  Name: string,
  action: 'api_import' | 'api_export',
  options: Record<string, unknown>
): string {
  const table = quotePhp(String(options.table));

  if (action === 'api_import') {
    return `<?php
// InstantCMS 2. system/controllers/${name}/actions/api_import.php

require_once __DIR__ . '/../import.php';

class action${Name}ApiImport extends cmsAction {

    public function run() {
        $data = $this->request->get('data');

        if (empty($data)) {
            return $this->respond(['error' => true, 'message' => 'No data provided'], 400);
        }

        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!is_array($data)) {
            return $this->respond(['error' => true, 'message' => 'Invalid data format'], 400);
        }

        $model = isset($this->model) ? $this->model : null;

        $import = new ${Name}Import([
            'table' => ${table},
            'update_existing' => (bool) $this->request->get('update_existing', 0),
            'skip_header' => false,
        ], $model);

        try {
            $stats = $import->importFromArray($data);
        } catch (Exception $e) {
            return $this->respond(['error' => true, 'message' => $e->getMessage()], 500);
        }

        return $this->respond(['success' => true, 'stats' => $stats], 200);
    }

${apiRespondHelper()}
}`;
  }

  const xmlBranch = options.use_xml
    ? `            case 'xml':
                $content = $export->exportToXml();
                $content_type = 'text/xml';
                break;
`
    : '';

  return `<?php
// InstantCMS 2. system/controllers/${name}/actions/api_export.php

require_once __DIR__ . '/../export.php';

class action${Name}ApiExport extends cmsAction {

    public function run() {
        $format = (string) $this->request->get('format', 'json');

        $model = isset($this->model) ? $this->model : null;

        $export = new ${Name}Export([
            'table' => ${table},
            'page' => max(1, (int) $this->request->get('page', 1)),
            'per_page' => min(500, max(1, (int) $this->request->get('per_page', 100))),
        ], $model);

        $content_type = 'application/json';

        switch ($format) {
            case 'csv':
                $content = $export->exportToCsv();
                $content_type = 'text/csv';
                break;
${xmlBranch}            default:
                $content = $export->getItems();
        }

        return $this->respond($content, 200, $content_type);
    }

${apiRespondHelper()}
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
 *   options: { table: 'products_items', use_csv: true, use_json: true, batch_size: 100 }
 * });
 * ```
 */
export function scaffoldImportExport(opts: ScaffoldImportExportOptions): ScaffoldResult {
  rejectUnsupportedOptions('scaffold_import_export', opts.options, {
    use_xlsx:
      'разбор XLSX требует внешней библиотеки (PhpSpreadsheet и т.п.), которой нет в ядре ICMS; используйте CSV',
  });

  const { lowercase, UpperCamelCase } = normalizeAddonName(opts.addon_name);
  const files: Record<string, string> = {};

  const table = opts.options?.table ?? `${lowercase}_items`;
  const keyField = opts.options?.key_field ?? 'slug';

  assertSafeIdentifier('scaffold_import_export', table, 'table');
  assertSafeIdentifier('scaffold_import_export', keyField, 'key_field');

  const fields = opts.fields.map(f => ({
    field: f.field,
    type: f.type,
    label: f.label || f.field,
    required: f.required ?? false,
    default: f.default,
    options: f.options,
  }));

  const options = {
    table,
    key_field: keyField,
    defaults: opts.options?.defaults ?? {},
    batch_size: Math.max(1, opts.options?.batch_size ?? 100),
    per_page: 100,
    skip_header: opts.options?.skip_header ?? true,
    update_existing: opts.options?.update_existing ?? true,
    use_csv: opts.options?.use_csv ?? true,
    use_json: opts.options?.use_json ?? true,
    use_xml: opts.options?.use_xml ?? false,
  };

  const ctrl = `package/system/controllers/${lowercase}`;

  files[`${ctrl}/import.php`] = generateImportClass(lowercase, UpperCamelCase, fields, options);
  files[`${ctrl}/export.php`] = generateExportClass(lowercase, UpperCamelCase, fields, options);

  if (options.use_csv) {
    files[`${ctrl}/import.form.php`] = generateImportForm(
      lowercase,
      UpperCamelCase,
      fields,
      options
    );
  }

  if (options.use_json) {
    files[`${ctrl}/actions/api_import.php`] = generateApiAction(
      lowercase,
      UpperCamelCase,
      'api_import',
      options
    );
    files[`${ctrl}/actions/api_export.php`] = generateApiAction(
      lowercase,
      UpperCamelCase,
      'api_export',
      options
    );
  }

  return {
    addon_name: lowercase,
    table: options.table,
    files,
    fields_count: fields.length,
    options,
    supported_options: [
      'table',
      'key_field',
      'defaults',
      'batch_size',
      'skip_header',
      'update_existing',
      'use_csv',
      'use_json',
      'use_xml',
    ],
    hook_events: [],
    structure_notes: [
      `Классы: ${UpperCamelCase}Import и ${UpperCamelCase}Export в system/controllers/${lowercase}/`,
      options.use_json
        ? `API-действия: system/controllers/${lowercase}/actions/api_import.php и api_export.php (класс action${UpperCamelCase}ApiImport/ApiExport)`
        : 'API-действия не создавались (use_json: false)',
      `Таблица по умолчанию: ${lowercase}_items (как у scaffold_crud); переопределяется опцией table`,
      `Обновление существующих строк идёт по полю ${keyField} (опция key_field); если поля нет в строке, строка вставляется`,
      'Поля, обязательные в БД, задавайте через options.defaults — иначе INSERT без них упадёт',
    ],
    limitations: [
      'Библиотека не создаёт UI сама: форму импорта подключайте к форме контроллера, а действия api_import/api_export — к маршрутам.',
      'Чтение XLSX не поддерживается: только CSV и массивы (use_xlsx отклоняется).',
      'JSON-тело запроса не разбирается: api_import читает JSON из параметра data.',
    ],
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
              enum: [...FieldTypeEnum],
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
          table: { type: 'string', description: 'Таблица для импорта/экспорта' },
          key_field: { type: 'string', description: 'Поле поиска существующей строки' },
          defaults: {
            type: 'object',
            description: 'Значения, добавляемые в каждую импортируемую строку',
          },
          use_csv: { type: 'boolean', description: 'Генерировать форму импорта CSV' },
          use_xlsx: {
            type: 'boolean',
            description: 'Не поддерживается: разбор XLSX отклоняется, используйте CSV',
          },
          use_json: { type: 'boolean', description: 'Генерировать API-действия импорта/экспорта' },
          use_xml: { type: 'boolean', description: 'Добавить экспорт в XML' },
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
        { field: 'title', type: 'string', label: 'title', required: true },
        { field: 'price', type: 'number', label: 'price' },
        { field: 'slug', type: 'string', label: 'slug' },
      ],
      options: {
        table: 'products_items',
        key_field: 'slug',
        defaults: { date_pub: '2026-01-01 00:00:00', is_pub: 1 },
        use_csv: true,
        use_json: true,
      },
    },
  ],
};
