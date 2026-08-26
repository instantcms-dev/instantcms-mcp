import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface ParsedMethod {
  name: string;
  visibility: 'public' | 'private' | 'protected' | 'static';
  signature: string;
  description: string;
  returnType: string;
  params: { name: string; type: string; description: string }[];
  deprecated?: boolean;
}

interface ParsedProperty {
  name: string;
  visibility: 'public' | 'private' | 'protected' | 'static';
  type: string;
  description: string;
}

interface ParsedConstant {
  name: string;
  value: string;
  description: string;
}

interface ParsedClass {
  name: string;
  extends?: string;
  description: string;
  file: string;
  methods: ParsedMethod[];
  properties: ParsedProperty[];
  constants: ParsedConstant[];
}

function getVisibility(modifiers: string[]): 'public' | 'private' | 'protected' | 'static' {
  if (modifiers.includes('private')) return 'private';
  if (modifiers.includes('protected')) return 'protected';
  if (modifiers.includes('static')) return 'static';
  return 'public';
}

function extractReturnType(docComment: string): string {
  const returnMatch = docComment.match(/@return\s+([^\s*]+)/);
  if (returnMatch) return returnMatch[1];
  return 'void';
}

function cleanDescription(desc: string): string {
  let result = desc
    .replace(/^\/\*\*[\s\*]*/gm, '')
    .replace(/\*\/$/gm, '')
    .replace(/^\s*\*\s*/gm, ' ')
    .replace(/^\s*$/gm, '')
    .trim();
  
  result = result.replace(/\s+/g, ' ').trim();
  
  if (result.includes('class ') || result.includes('function ') || result.includes('protected $') || result.includes('public $')) {
    return '';
  }
  
  if (result.length > 10 && (result.includes('*/') || result.includes('/**'))) {
    return '';
  }
  
  return result.slice(0, 200);
}

function isDeprecated(docComment: string): boolean {
  return docComment.includes('@deprecated');
}

function extractMethods(content: string): ParsedMethod[] {
  const methods: ParsedMethod[] = [];
  
  const lines = content.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.trim().startsWith('/**')) {
      const docLines: string[] = [line];
      i++;
      
      while (i < lines.length && !lines[i].trim().startsWith('*/')) {
        docLines.push(lines[i]);
        i++;
      }
      
      if (i < lines.length) {
        docLines.push(lines[i]);
        i++;
      }
      
      const docComment = docLines.join('\n');
      
      while (i < lines.length && !lines[i].includes('function ')) {
        i++;
      }
      
      if (i >= lines.length) break;
      
      const funcLine = lines[i];
      const funcMatch = funcLine.match(/(public|private|protected|static)?\s*function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([\w\\|]+))?/);
      
      if (funcMatch) {
        const visibility = getVisibility(funcMatch[1] ? [funcMatch[1]] : []);
        const funcName = funcMatch[2];
        const paramsStr = funcMatch[3];
        const returnType = funcMatch[4] || extractReturnType(docComment);
        
        const params: { name: string; type: string; description: string }[] = [];
        if (paramsStr.trim()) {
          const paramParts = paramsStr.split(',');
          for (const part of paramParts) {
            const trimmed = part.trim();
            const dollarIdx = trimmed.indexOf('$');
            if (dollarIdx === -1) continue;
            const paramName = trimmed.slice(dollarIdx + 1).trim();
            const typePart = trimmed.slice(0, dollarIdx).trim();
            if (paramName) {
              params.push({
                name: paramName,
                type: typePart || 'mixed',
                description: ''
              });
            }
          }
        }
        
        methods.push({
          name: funcName,
          visibility,
          signature: `function ${funcName}(${paramsStr}): ${returnType}`,
          description: cleanDescription(docComment),
          returnType,
          params,
          deprecated: isDeprecated(docComment)
        });
      }
    }
    i++;
  }
  
  return methods;
}

function extractProperties(content: string): ParsedProperty[] {
  const properties: ParsedProperty[] = [];
  
  const lines = content.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.trim().startsWith('/**')) {
      const docLines: string[] = [line];
      i++;
      
      while (i < lines.length && !lines[i].trim().startsWith('*/')) {
        docLines.push(lines[i]);
        i++;
      }
      
      if (i < lines.length) {
        docLines.push(lines[i]);
        i++;
      }
      
      const docComment = docLines.join('\n');
      
      while (i < lines.length && !lines[i].match(/\$(public|private|protected)\s+\$/)) {
        if (lines[i].match(/\$(public|private|protected)\s+\w/)) {
          const propMatch = lines[i].match(/\$(public|private|protected)\s+\$(\w+)/);
          if (propMatch) {
            properties.push({
              name: propMatch[2],
              visibility: getVisibility([propMatch[1]]),
              type: 'mixed',
              description: cleanDescription(docComment)
            });
          }
          i++;
          break;
        }
        i++;
      }
    } else {
      i++;
    }
  }
  
  return properties;
}

function extractConstants(content: string): ParsedConstant[] {
  const constants: ParsedConstant[] = [];
  
  const constRegex = /^\s*const\s+(\w+)\s*=\s*([^;]+);/gm;
  let match;
  
  while ((match = constRegex.exec(content)) !== null) {
    constants.push({
      name: match[1],
      value: match[2].trim().slice(0, 100),
      description: ''
    });
  }
  
  return constants;
}

export function parseCoreFile(filePath: string): ParsedClass | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const classMatch = content.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?/);
  if (!classMatch) return null;
  
  const className = classMatch[1];
  const extendsClass = classMatch[2];
  const fileName = path.basename(filePath, '.php');
  
  const classDocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
  const description = classDocMatch ? cleanDescription(classDocMatch[0]) : '';
  
  const methods = extractMethods(content);
  const properties = extractProperties(content);
  const constants = extractConstants(content);
  
  return {
    name: className,
    extends: extendsClass,
    description,
    file: fileName,
    methods,
    properties,
    constants
  };
}

export function parseAllCoreFiles(sourceDir: string): ParsedClass[] {
  const pattern = path.join(sourceDir, 'system', 'core', '*.php');
  const files = glob.sync(pattern);
  
  const classes: ParsedClass[] = [];
  
  for (const file of files) {
    const parsed = parseCoreFile(file);
    if (parsed) {
      classes.push(parsed);
    }
  }
  
  return classes.sort((a, b) => a.name.localeCompare(b.name));
}

export function generateCoreAPIData(sourceDir: string): string {
  const classes = parseAllCoreFiles(sourceDir);
  
  const lines: string[] = [
    `// Auto-generated from system/core/*.php`,
    `// Generated at: ${new Date().toISOString()}`,
    ``,
    `export interface CoreClass {`,
    `  name: string;`,
    `  extends?: string;`,
    `  description: string;`,
    `  file: string;`,
    `  methods: number;`,
    `  properties: number;`,
    `  constants: number;`,
    `}`,
    ``,
    `export const coreClasses: CoreClass[] = [`
  ];
  
  for (const cls of classes) {
    lines.push(`  {`);
    lines.push(`    name: "${cls.name}",`);
    if (cls.extends) lines.push(`    extends: "${cls.extends}",`);
    lines.push(`    description: "${cls.description.replace(/"/g, '\\"')}",`);
    lines.push(`    file: "${cls.file}.php",`);
    lines.push(`    methods: ${cls.methods.length},`);
    lines.push(`    properties: ${cls.properties.length},`);
    lines.push(`    constants: ${cls.constants.length},`);
    lines.push(`  },`);
  }
  
  lines.push(`];`);
  lines.push(``);
  
  lines.push(`export const coreAPIMap = {`);
  for (const cls of classes) {
    lines.push(`  ${cls.name}: {`);
    lines.push(`    name: "${cls.name}",`);
    lines.push(`    extends: ${cls.extends ? `"${cls.extends}"` : 'undefined'},`);
    lines.push(`    file: "${cls.file}.php",`);
    lines.push(`    description: "${cls.description.replace(/"/g, '\\"')}",`);
    lines.push(`    methods: [`);
    for (const method of cls.methods) {
      lines.push(`      {`);
      lines.push(`        name: "${method.name}",`);
      lines.push(`        visibility: "${method.visibility}",`);
      lines.push(`        signature: "${method.signature.replace(/"/g, '\\"')}",`);
      lines.push(`        returnType: "${method.returnType}",`);
      lines.push(`        params: [${method.params.map(p => `{name: "${p.name.replace(/"/g, '\\"')}", type: "${p.type.replace(/"/g, '\\"')}"}`).join(', ')}],`);
      lines.push(`        description: "${method.description.replace(/"/g, '\\"')}",`);
      if (method.deprecated) lines.push(`        deprecated: true,`);
      lines.push(`      },`);
    }
    lines.push(`    ],`);
    lines.push(`    properties: [`);
    for (const prop of cls.properties.slice(0, 20)) {
      lines.push(`      { name: "${prop.name}", visibility: "${prop.visibility}", type: "${prop.type}" },`);
    }
    if (cls.properties.length > 20) {
      lines.push(`      // ... ${cls.properties.length - 20} more properties`);
    }
    lines.push(`    ],`);
    lines.push(`    constants: [`);
    for (const c of cls.constants) {
      lines.push(`      { name: "${c.name}", value: "${c.value.replace(/"/g, '\\"')}" },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }
  lines.push(`};`);
  
  return lines.join('\n');
}

if (require.main === module) {
  const sourceDir = path.resolve(process.env.INSTANTCMS_SOURCE || path.resolve(__dirname, '../../../source'));
  const outputFile = path.resolve(__dirname, '../../../src/data/core-api.ts');
  
  console.log(`Parsing system/core/ files from: ${sourceDir}`);
  
  const classes = parseAllCoreFiles(sourceDir);
  
  console.log(`\nFound ${classes.length} core classes:\n`);
  
  for (const cls of classes) {
    const publicMethods = cls.methods.filter(m => m.visibility === 'public');
    console.log(`  ${cls.name}${cls.extends ? ` extends ${cls.extends}` : ''} (${cls.file}.php)`);
    console.log(`    Methods: ${cls.methods.length} (${publicMethods.length} public)`);
    console.log(`    Properties: ${cls.properties.length}`);
    console.log(`    Constants: ${cls.constants.length}`);
  }
  
  const output = generateCoreAPIData(sourceDir);
  fs.writeFileSync(outputFile, output);
  console.log(`\nGenerated: ${outputFile}`);
}
