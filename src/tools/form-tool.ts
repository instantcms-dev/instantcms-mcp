import { rejectUnsupportedOptions } from '../utils/generator-options.js';

interface FormField {
  name: string;
  type: string;
  title?: string;
  rules?: string[];
  options?: Record<string, unknown>;
  is_system?: boolean;
}

interface ScaffoldFormOptions {
  addon_name: string;
  form_name: string;
  fields: FormField[];
  options?: {
    use_tabs?: boolean;
    use_separate_save?: boolean;
    generate_rules?: boolean;
  };
}

export function scaffoldForm(opts: ScaffoldFormOptions): object {
  rejectUnsupportedOptions('scaffold_form', opts.options, {
    generate_rules: 'автогенерация правил валидации не поддержана — задайте rules у поля вручную',
  });

  const name = opts.addon_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const Name = name.split('_').map(capitalize).join('');
  const formName = opts.form_name || 'item';
  const FormName = formName.split('_').map(capitalize).join('');

  const files: Record<string, string> = {};

  const ctrl = `package/system/controllers/${name}`;
  const formFile = `${ctrl}/backend/forms/form_${formName}.php`;

  files[formFile] = generateForm(opts.fields, Name, FormName, opts.options);
  files[`${ctrl}/manifest.xml`] = generateManifest(name, Name);

  if (opts.options?.use_separate_save) {
    files[`${ctrl}/backend/forms/form_${formName}_save.php`] = generateFormSave(Name, FormName);
  }

  return {
    addon_name: name,
    form_name: formName,
    form_class: `form${Name}${FormName}`,
    file_path: formFile,
    files,
    form_fields: opts.fields.map(f => ({
      name: f.name,
      type: f.type,
      class: getFieldClass(f.type),
    })),
    structure_notes: [
      `Форма: ${formFile}`,
      `Класс: form${Name}${FormName}`,
      `Используйте в экшене: $this->getForm('${formName}')`,
    ],
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateForm(
  fields: FormField[],
  Name: string,
  FormName: string,
  options?: ScaffoldFormOptions['options']
): string {
  let formCode = `<?php

class form${Name}${FormName} extends cmsForm {

    public function init($do = 'add') {

        $is_edit = ($do === 'edit');

        return [`;

  if (options?.use_tabs) {
    formCode += generateTabsForm(fields);
  } else {
    formCode += generateBasicForm(fields);
  }

  formCode += `
        ];
    }

`;
  if (options?.use_separate_save) {
    formCode += generateSaveMethod(Name, FormName);
  }

  formCode += `}
`;
  return formCode;
}

function generateBasicForm(fields: FormField[]): string {
  const basicFields = fields.filter(f => !f.is_system);
  const systemFields = fields.filter(f => f.is_system);

  let code = `
            'basic' => [
                'title'  => LANG_CP_BASIC,
                'type'   => 'fieldset',
                'childs' => [`;

  for (const field of basicFields) {
    const fieldClass = getFieldClass(field.type);
    const fieldTitle = field.title || capitalize(field.name.replace(/_/g, ' '));

    let fieldOptions: Record<string, unknown> = { title: fieldTitle };

    if (field.rules && field.rules.length > 0) {
      fieldOptions.rules = field.rules.map(r => {
        if (typeof r === 'string') {
          const [rule, ...args] = r.split(':');
          return [rule, ...args.map(a => (isNaN(Number(a)) ? a : Number(a)))];
        }
        return r;
      });
    } else if (field.type === 'varchar') {
      fieldOptions.rules = [['max_length', 255]];
    }

    if (field.options) {
      fieldOptions = { ...fieldOptions, ...field.options };
    }

    const optionsStr = formatFieldOptions(fieldOptions);
    code += `
                    new ${fieldClass}('${field.name}', ${optionsStr}),`;
  }

  code += `
                ],
            ],`;

  if (systemFields.length > 0) {
    code += `
            'system' => [
                'title'  => LANG_SYSTEM,
                'type'   => 'fieldset',
                'childs' => [`;

    for (const field of systemFields) {
      const fieldClass = getFieldClass(field.type);
      const fieldTitle = field.title || capitalize(field.name.replace(/_/g, ' '));
      const fieldOptions = formatFieldOptions({ title: fieldTitle, ...field.options });
      code += `
                    new ${fieldClass}('${field.name}', ${fieldOptions}),`;
    }

    code += `
                ],
            ],`;
  }

  return code;
}

function generateTabsForm(fields: FormField[]): string {
  const tabGroups: Record<string, FormField[]> = {};

  for (const field of fields) {
    const group = ((field.options as Record<string, unknown>)?.tab as string) || 'basic';
    if (!tabGroups[group]) {
      tabGroups[group] = [];
    }
    tabGroups[group].push(field);
  }

  let code = '';

  for (const [tabName, tabFields] of Object.entries(tabGroups)) {
    const tabTitle = tabName === 'basic' ? LANG_CP_BASIC : capitalize(tabName.replace(/_/g, ' '));
    code += `
            '${tabName}' => [
                'title'  => '${tabTitle}',
                'type'   => 'fieldset',
                'childs' => [`;

    for (const field of tabFields) {
      const fieldClass = getFieldClass(field.type);
      const fieldTitle = field.title || capitalize(field.name.replace(/_/g, ' '));
      let fieldOptions: Record<string, unknown> = { title: fieldTitle };

      if (field.rules && field.rules.length > 0) {
        fieldOptions.rules = field.rules;
      } else if (field.type === 'varchar') {
        fieldOptions.rules = [['max_length', 255]];
      }

      if (field.options) {
        fieldOptions = { ...fieldOptions, ...field.options };
      }

      const optionsStr = formatFieldOptions(fieldOptions);
      code += `
                    new ${fieldClass}('${field.name}', ${optionsStr}),`;
    }

    code += `
                ],
            ],`;
  }

  return code;
}

function generateSaveMethod(Name: string, _FormName: string): string {
  return `

    public function save($item, $do, $is_update) {

        if ($is_update) {
            cmsEventsManager::hook('${Name.toLowerCase()}_before_update', $item, $this->request);
        } else {
            cmsEventsManager::hook('${Name.toLowerCase()}_before_add', $item, $this->request);
        }

        return $item;
    }
`;
}

function generateFormSave(Name: string, FormName: string): string {
  return `<?php

class form${Name}${FormName}Save extends cmsForm {

    public function init() {
        return [
            'basic' => [
                'title'  => LANG_CP_BASIC,
                'type'   => 'fieldset',
                'childs' => [
                    new fieldCheckbox('is_approved', [
                        'title'   => LANG_APPROVED,
                        'default' => 1,
                    ]),
                    new fieldNumber('sorder', [
                        'title'   => LANG_SORT_ORDER,
                        'default' => 0,
                    ]),
                ],
            ],
        ];
    }

}`;
}

function generateManifest(name: string, Name: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<addon>
    <name>${name}</name>
    <title>${Name}</title>
    <version>1.0.0</version>
    <files>
        <file>backend/forms/form_item.php</file>
    </files>
</addon>`;
}

function getFieldClass(type: string): string {
  const map: Record<string, string> = {
    varchar: 'fieldString',
    text: 'fieldText',
    html: 'fieldHtml',
    int: 'fieldNumber',
    tinyint: 'fieldNumber',
    decimal: 'fieldNumber',
    float: 'fieldNumber',
    bool: 'fieldCheckbox',
    boolean: 'fieldCheckbox',
    date: 'fieldDate',
    datetime: 'fieldDate',
    timestamp: 'fieldDate',
    time: 'fieldTime',
    select: 'fieldList',
    enum: 'fieldList',
    radio: 'fieldRadio',
    checkbox: 'fieldCheckbox',
    file: 'fieldFile',
    image: 'fieldImage',
    images: 'fieldImages',
    video: 'fieldVideo',
    audio: 'fieldAudio',
    user: 'fieldUser',
    users: 'fieldUsers',
    parent: 'fieldParent',
    slug: 'fieldSlug',
    tags: 'fieldTags',
    price: 'fieldPrice',
    theme: 'fieldTheme',
  };
  return map[type] || 'fieldString';
}

function formatFieldOptions(options: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) {
      continue;
    }
    if (typeof value === 'string') {
      lines.push(`'${key}' => '${value}'`);
    } else if (typeof value === 'boolean') {
      lines.push(`'${key}' => ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`'${key}' => ${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`'${key}' => ${JSON.stringify(value)}`);
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`'${key}' => ${JSON.stringify(value)}`);
    }
  }
  if (lines.length === 0) {
    return '{}';
  }
  return `[\n                        ${lines.join(',\n                        ')}\n                    ]`;
}

const LANG_CP_BASIC = 'LANG_CP_BASIC';
const LANG_SYSTEM = 'LANG_SYSTEM'; // eslint-disable-line @typescript-eslint/no-unused-vars
const LANG_APPROVED = 'LANG_APPROVED'; // eslint-disable-line @typescript-eslint/no-unused-vars
const LANG_SORT_ORDER = 'LANG_SORT_ORDER'; // eslint-disable-line @typescript-eslint/no-unused-vars
