import * as fs from 'node:fs';
import * as path from 'node:path';

export interface SourceHook {
  name: string;
  inferredType: 'filter' | 'action';
  parameters: string[];
  files: string[];
  occurrences: number;
}

const PHP_EXTENSIONS = new Set(['.php']);
const HOOK_PATTERN =
  /(?:(cmsEventsManager)::(hook|hookAll)|(?:\$[a-zA-Z_][\w]*|\$this|\$controller)->(runHook))\(\s*(['"])([a-z][a-z0-9_]+)\4(?:\s*,\s*([^;\n]+))?/g;

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return PHP_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function extractParameters(expression = ''): string[] {
  const names = [...expression.matchAll(/\$[a-zA-Z_][\w]*/g)].map(match => match[0]);
  return [...new Set(names)].slice(0, 20);
}

export function discoverHooks(sourceRoot: string): SourceHook[] {
  const systemRoot = path.join(sourceRoot, 'system');
  const discovered = new Map<string, SourceHook>();

  for (const filePath of walk(systemRoot)) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const match of content.matchAll(HOOK_PATTERN)) {
      const name = match[5];
      const prefix = content.slice(Math.max(0, match.index - 80), match.index);
      const isFilter = /(?:return\s+|=\s*)$/.test(prefix.trimEnd());
      const relativeFile = path.relative(sourceRoot, filePath).replaceAll(path.sep, '/');
      const existing = discovered.get(name);
      if (existing) {
        existing.occurrences += 1;
        if (!existing.files.includes(relativeFile)) existing.files.push(relativeFile);
        existing.parameters = [
          ...new Set([...existing.parameters, ...extractParameters(match[6])]),
        ];
        if (isFilter) existing.inferredType = 'filter';
      } else {
        discovered.set(name, {
          name,
          inferredType: isFilter ? 'filter' : 'action',
          parameters: extractParameters(match[6]),
          files: [relativeFile],
          occurrences: 1,
        });
      }
    }
  }

  return [...discovered.values()]
    .map(hook => ({ ...hook, files: hook.files.sort() }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function generateHooksSource(sourceRoot: string): string {
  const hooks = discoverHooks(sourceRoot);
  return (
    `// Generated from official InstantCMS PHP hook calls. Do not edit.\n` +
    `export interface SourceHookEvidence {\n` +
    `  name: string;\n  inferredType: 'filter' | 'action';\n  parameters: string[];\n` +
    `  files: string[];\n  occurrences: number;\n}\n\n` +
    `export const sourceHooks: SourceHookEvidence[] = ${JSON.stringify(hooks, null, 2)};\n`
  );
}

if (require.main === module) {
  const sourceRoot = path.resolve(process.env.INSTANTCMS_SOURCE || 'source');
  const outputPath = path.resolve('src/generated/hooks-source.ts');
  const output = generateHooksSource(sourceRoot);
  fs.writeFileSync(outputPath, output);
  console.log(`Generated ${discoverHooks(sourceRoot).length} source-backed hooks to ${outputPath}`);
}
