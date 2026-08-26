import * as fs from 'fs';
import * as path from 'path';

export interface FieldOption {
  name: string;
  type: string;
  description?: string;
  default?: any;
  required?: boolean;
  extended?: boolean;
  visible_depend?: Record<string, Record<string, string[]>>;
  hint?: string;
  items?: Record<string, string>;
}

export interface FieldInfo {
  name: string;
  className: string;
  filePath: string;
  hasOptions: boolean;
  isSystem: boolean;
  options?: FieldOption[];
  description?: string;
  title?: string;
  sqlTemplate?: string;
  filterType?: string;
  filterHint?: string;
  varType?: string;
  allowIndex?: boolean;
  nativeTag?: boolean;
  dynamicList?: boolean;
  validationRules?: string[];
  methods?: {
    parse?: boolean;
    store?: boolean;
    getInput?: boolean;
    applyFilter?: boolean;
    getStringValue?: boolean;
    getFilterInput?: boolean;
  };
}

export interface FieldsMap {
  fields: FieldInfo[];
  byName: Record<string, FieldInfo>;
  systemFields: FieldInfo[];
  fieldCount: number;
  generatedAt: string;
}

const TYPE_MAP: Record<string, string> = {
  string: 'text',
  number: 'number',
  checkbox: 'boolean',
  list: 'select',
  listmultiple: 'multiselect',
  textarea: 'text',
  html: 'wysiwyg',
  image: 'image',
  file: 'file',
  date: 'date',
  datetime: 'datetime',
  color: 'color',
  hidden: 'hidden',
  captcha: 'captcha',
  user: 'user',
  users: 'users',
  category: 'category',
  url: 'url',
  email: 'email',
  age: 'age',
  child: 'child',
  parent: 'parent',
  toolbar: 'toolbar',
  listbitmask: 'bitmask',
  listgroups: 'groups',
  fieldsgroup: 'fieldsgroup',
  caption: 'caption',
  forms: 'forms',
  htmlcross: 'htmlcross',
  htmlhint: 'htmlhint',
  paypal: 'paypal',
};

function parseFieldFile(filePath: string): FieldInfo | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  const nameMatch = filePath.match(/([^\/]+)\.php$/);
  if (!nameMatch) return null;

  const fileName = nameMatch[1];

  const classMatch = content.match(/class\s+(field\w+)\s+extends\s+(\w+)/);
  if (!classMatch) return null;

  const className = classMatch[1];
  const isSystem =
    content.includes('public $is_system = true') || content.includes('public \\$is_system = true');

  const titleMatch = content.match(/public\s+\$title\s*=\s*LANG_(\w+)/);
  const title = titleMatch ? titleMatch[1].replace(/_/g, ' ').toLowerCase() : undefined;

  const sqlMatch = content.match(/public\s+\$sql\s*=\s*['"]([^'"]+)['"]/);
  const sqlTemplate = sqlMatch ? sqlMatch[1] : undefined;

  const filterTypeMatch = content.match(/public\s+\$filter_type\s*=\s*['"](\w+)['"]/);
  const filterType = filterTypeMatch ? filterTypeMatch[1] : undefined;

  const filterHintMatch = content.match(/public\s+\$filter_hint\s*=\s*LANG_(\w+)/);
  const filterHint = filterHintMatch
    ? filterHintMatch[1].replace(/_/g, ' ').toLowerCase()
    : undefined;

  const varTypeMatch = content.match(/public\s+\$var_type\s*=\s*['"](\w+)['"]/);
  const varType = varTypeMatch ? varTypeMatch[1] : undefined;

  const allowIndexMatch = content.match(/public\s+\$allow_index\s*=\s*(true|false)/);
  const allowIndex = allowIndexMatch ? allowIndexMatch[1] === 'true' : undefined;

  const nativeTagMatch = content.match(/public\s+\$native_tag\s*=\s*(true|false)/);
  const nativeTag = nativeTagMatch ? nativeTagMatch[1] === 'true' : undefined;

  const dynamicListMatch = content.match(/public\s+\$dynamic_list\s*=\s*(true|false)/);
  const dynamicList = dynamicListMatch ? dynamicListMatch[1] === 'true' : undefined;

  const validationRules: string[] = [];
  const getRulesMatch = content.match(
    /public\s+function\s+getRules\s*\(\s*\)\s*\{([\s\S]*?)\n\s*\}/
  );
  if (getRulesMatch) {
    const rulesBlock = getRulesMatch[1];
    const ruleMatches = rulesBlock.matchAll(/\[\s*['"](\w+)['"]/g);
    for (const match of ruleMatches) {
      validationRules.push(match[1]);
    }
  }

  const methods: FieldInfo['methods'] = {};
  if (content.match(/public\s+function\s+parse\s*\(/)) methods.parse = true;
  if (content.match(/public\s+function\s+store\s*\(/)) methods.store = true;
  if (content.match(/public\s+function\s+getInput\s*\(/)) methods.getInput = true;
  if (content.match(/public\s+function\s+applyFilter\s*\(/)) methods.applyFilter = true;
  if (content.match(/public\s+function\s+getStringValue\s*\(/)) methods.getStringValue = true;
  if (content.match(/public\s+function\s+getFilterInput\s*\(/)) methods.getFilterInput = true;

  const options: FieldOption[] = [];

  function extractOptionsBlock(content: string): string | null {
    const returnArray = content.indexOf('return array(');

    let returnBracket = -1;
    let searchFrom = 0;

    while (true) {
      returnBracket = content.indexOf('return [', searchFrom);
      if (returnBracket < 0) break;
      if (content.substring(returnBracket, returnBracket + 9) === 'return []') {
        searchFrom = returnBracket + 8;
        continue;
      }
      break;
    }

    if (returnBracket < 0 && returnArray < 0) return null;

    if (returnBracket >= 0 && (returnArray < 0 || returnBracket < returnArray)) {
      const start = content.indexOf('[', returnBracket) + 1;
      if (start === 0) return null;

      let bracketCount = 1;
      let end = start;

      for (let i = start; i < content.length; i++) {
        if (content[i] === '[') bracketCount++;
        if (content[i] === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            end = i;
            break;
          }
        }
        if (i > start + 15000) break;
      }

      return end > start ? content.substring(start, end) : null;
    }

    if (returnArray >= 0) {
      const start = returnArray + 'return array('.length;
      let end = start;

      for (let i = start; i < content.length; i++) {
        if (content[i] === ')' && content[i + 1] === ';') {
          end = i;
          break;
        }
        if (i > start + 15000) break;
      }

      return end > start ? content.substring(start, end) : null;
    }

    return null;
  }

  const optionsBlock = extractOptionsBlock(content);
  if (optionsBlock) {
    const fieldObjectMatches = optionsBlock.matchAll(
      /new\s+field(\w+)\s*\(\s*['"](\w+)['"]\s*,\s*\[([\s\S]*?)\]\s*\)/gi
    );
    for (const match of fieldObjectMatches) {
      const fieldType = match[1].toLowerCase();
      const optionName = match[2];
      const configBlock = match[3];

      let optionDescription: string | undefined;
      let defaultValue: any = undefined;
      let required = false;
      let extended = false;
      let hint: string | undefined;
      let visibleDepend: FieldOption['visible_depend'];
      let items: Record<string, string> | undefined;

      const titleLangMatch = configBlock.match(/['"]title['"]\s*=>\s*LANG_(\w+)/);
      if (titleLangMatch) {
        optionDescription = titleLangMatch[1].replace(/_/g, ' ').toLowerCase();
      }

      const defaultMatch = configBlock.match(/['"]default['"]\s*=>\s*(\w+)/);
      if (defaultMatch) {
        defaultValue =
          defaultMatch[1] === 'true' ? true : defaultMatch[1] === 'false' ? false : defaultMatch[1];
      }

      const numberDefaultMatch = configBlock.match(/['"]default['"]\s*=>\s*(\d+)/);
      if (numberDefaultMatch && !defaultMatch) {
        defaultValue = parseInt(numberDefaultMatch[1], 10);
      }

      const requiredMatch = configBlock.match(/\['required'\]/);
      if (requiredMatch) {
        required = true;
      }

      const extendedMatch = configBlock.match(/['"]extended_option['"]\s*=>\s*(true|false)/);
      if (extendedMatch) {
        extended = extendedMatch[1] === 'true';
      }

      const hintMatch = configBlock.match(/['"]hint['"]\s*=>\s*LANG_(\w+)/);
      if (hintMatch) {
        hint = hintMatch[1].replace(/_/g, ' ').toLowerCase();
      }

      const visibleDependMatch = configBlock.match(/['"]visible_depend['"]\s*=>\s*\[([\s\S]*?)\]/);
      if (visibleDependMatch) {
        try {
          const dependStr = visibleDependMatch[1];
          const keyMatch = dependStr.match(
            /['"](\w+)['"]\s*=>\s*\[[\s\S]*?['"](\w+)['"][\s\S]*?\[[\s\S]*?['"](\d+)['"][\s\S]*?\]/
          );
          if (keyMatch) {
            visibleDepend = { [keyMatch[1]]: { [keyMatch[2]]: [keyMatch[3]] } };
          }
        } catch {
          // ignore parse errors for visible_depend
        }
      }

      const staticItemsMatch = configBlock.match(/['"]items['"]\s*=>\s*\[([\s\S]*?)\]\s*/);
      if (staticItemsMatch) {
        items = {};
        const itemMatches = staticItemsMatch[1].matchAll(/['"](\w+)['"]\s*=>\s*LANG_(\w+)/g);
        for (const itemMatch of itemMatches) {
          items[itemMatch[1]] = itemMatch[2].replace(/_/g, ' ').toLowerCase();
        }
      }

      const mappedType = TYPE_MAP[fieldType] || fieldType;

      if (!options.find(o => o.name === optionName)) {
        options.push({
          name: optionName,
          type: mappedType,
          description: optionDescription,
          default: defaultValue,
          required,
          extended,
          hint,
          visible_depend: Object.keys(visibleDepend || {}).length > 0 ? visibleDepend : undefined,
          items: Object.keys(items || {}).length > 0 ? items : undefined,
        });
      }
    }
  }

  return {
    name: fileName,
    className,
    filePath: filePath.replace(process.cwd(), ''),
    hasOptions: options.length > 0,
    isSystem,
    options: options.length > 0 ? options : undefined,
    title,
    sqlTemplate,
    filterType,
    filterHint,
    varType,
    allowIndex,
    nativeTag,
    dynamicList,
    validationRules: validationRules.length > 0 ? validationRules : undefined,
    methods: Object.keys(methods).length > 0 ? methods : undefined,
  };
}

function scanFieldsDir(dirPath: string, fields: FieldInfo[]): void {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) continue;

    if (entry.name.endsWith('.php')) {
      const field = parseFieldFile(path.join(dirPath, entry.name));
      if (field) {
        fields.push(field);
      }
    }
  }
}

export function generateFieldsMap(sourceDir: string, outputPath: string): void {
  const fieldsDir = path.join(sourceDir, 'system', 'fields');
  const fields: FieldInfo[] = [];

  scanFieldsDir(fieldsDir, fields);

  fields.sort((a, b) => a.name.localeCompare(b.name));

  const byName: Record<string, FieldInfo> = {};
  for (const field of fields) {
    byName[field.name] = field;
  }

  const systemFields = fields.filter(f => f.isSystem);

  const data: FieldsMap = {
    fields,
    byName,
    systemFields,
    fieldCount: fields.length,
    generatedAt: process.env.KNOWLEDGE_GENERATED_AT || new Date().toISOString(),
  };

  const typescriptContent = `// AUTO-GENERATED from source/system/fields
// Do not edit manually - run 'npm run parse:fields' to regenerate

export interface FieldOption {
  name: string;
  type: string;
  description?: string;
  default?: any;
  required?: boolean;
  extended?: boolean;
  visible_depend?: Record<string, Record<string, string[]>>;
  hint?: string;
  items?: Record<string, string>;
}

export interface FieldInfo {
  name: string;
  className: string;
  filePath: string;
  hasOptions: boolean;
  isSystem: boolean;
  options?: FieldOption[];
  description?: string;
  title?: string;
  sqlTemplate?: string;
  filterType?: string;
  filterHint?: string;
  varType?: string;
  allowIndex?: boolean;
  nativeTag?: boolean;
  dynamicList?: boolean;
  validationRules?: string[];
  methods?: {
    parse?: boolean;
    store?: boolean;
    getInput?: boolean;
    applyFilter?: boolean;
    getStringValue?: boolean;
    getFilterInput?: boolean;
  };
}

export interface FieldsMap {
  fields: FieldInfo[];
  byName: Record<string, FieldInfo>;
  systemFields: FieldInfo[];
  fieldCount: number;
  generatedAt: string;
}

export const fieldsMap: FieldsMap = ${JSON.stringify(data, null, 2)};

export function getField(name: string): FieldInfo | undefined {
  return fieldsMap.byName[name];
}

export function getFieldTypes(): string[] {
  return fieldsMap.fields.map(f => f.name);
}

export function getSystemFields(): FieldInfo[] {
  return fieldsMap.systemFields;
}

export function getFieldOptions(name: string): FieldOption[] | undefined {
  return fieldsMap.byName[name]?.options;
}

export function getFieldBySqlTemplate(sql: string): FieldInfo | undefined {
  return fieldsMap.fields.find(f => f.sqlTemplate?.includes(sql));
}
`;

  fs.writeFileSync(outputPath, typescriptContent);
  console.log(`Generated ${data.fieldCount} fields to ${outputPath}`);
}

if (require.main === module) {
  const sourcePath = path.resolve(process.env.INSTANTCMS_SOURCE || 'source');
  const outputPath = path.resolve('src/data/fields-map.ts');
  generateFieldsMap(sourcePath, outputPath);
}
