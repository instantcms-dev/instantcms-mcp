import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseAllCoreFiles } from './core-parser.js';

export function generateComponentsSource(sourceRoot: string): string {
  const components = parseAllCoreFiles(sourceRoot).map(component => ({
    name: component.name,
    class: component.name,
    extends: component.extends,
    description: component.description,
    file: `system/core/${component.file}.php`,
    methods: component.methods
      .filter(method => method.visibility === 'public')
      .map(method => ({
        name: method.name,
        signature: method.signature,
        description: method.description,
        parameters: method.params.map(parameter => ({
          name: `$${parameter.name}`,
          type: parameter.type || 'mixed',
          description: parameter.description,
          required: parameter.required,
          default: parameter.default,
        })),
        return_type: method.returnType || 'mixed',
        deprecated: method.deprecated,
      })),
  }));

  return (
    `// Generated from official InstantCMS system/core classes. Do not edit.\n` +
    `export interface SourceComponentEvidence {\n` +
    `  name: string; class: string; extends?: string; description: string; file: string;\n` +
    `  methods: Array<{ name: string; signature: string; description: string; parameters: Array<{ name: string; type: string; description: string; required: boolean; default?: string }>; return_type: string; deprecated?: boolean }>;\n` +
    `}\n\nexport const sourceComponents: SourceComponentEvidence[] = ${JSON.stringify(components, null, 2)};\n`
  );
}

if (require.main === module) {
  const sourceRoot = path.resolve(process.env.INSTANTCMS_SOURCE || 'source');
  const outputPath = path.resolve('src/generated/components-source.ts');
  const output = generateComponentsSource(sourceRoot);
  fs.writeFileSync(outputPath, output);
  console.log(`Generated source-backed components to ${outputPath}`);
}
