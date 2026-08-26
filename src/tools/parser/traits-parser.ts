import * as fs from 'fs';
import * as path from 'path';

export interface TraitMethod {
  name: string;
  visibility: 'public' | 'protected' | 'private';
  params: string[];
  description?: string;
}

export interface TraitInfo {
  name: string;
  namespace: string;
  filePath: string;
  methods: TraitMethod[];
  description?: string;
}

export interface TraitsMap {
  traits: TraitInfo[];
  byNamespace: Record<string, TraitInfo[]>;
  methodCount: number;
  generatedAt: string;
}

function parseTraitFile(filePath: string, namespace: string): TraitInfo | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  const nameMatch = filePath.match(/([^\/]+)\.php$/);
  if (!nameMatch) return null;

  const classMatch = content.match(/trait\s+(\w+)/);
  if (!classMatch) return null;

  const traitName = classMatch[1];

  let description: string | undefined;
  const docMatch = content.match(/\*\*[\s\S]*?@/);
  if (docMatch) {
    const descMatch = docMatch[0].match(/@([\s\S]+?)@/);
    if (descMatch) {
      description = descMatch[1]
        .trim()
        .replace(/\n\s*\*/g, '\n')
        .trim();
    }
  }

  const methods: TraitMethod[] = [];
  const methodRegex = /(public|protected|private)\s+function\s+(\w+)\s*\(([^)]*)\)/g;
  let methodMatch;

  while ((methodMatch = methodRegex.exec(content)) !== null) {
    const paramsStr = methodMatch[3].trim();
    const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : [];

    methods.push({
      name: methodMatch[2],
      visibility: methodMatch[1] as TraitMethod['visibility'],
      params,
    });
  }

  return {
    name: traitName,
    namespace,
    filePath: filePath.replace(process.cwd(), ''),
    methods,
    description,
  };
}

function scanTraitsDir(dirPath: string, namespace: string, traits: TraitInfo[]): void {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const newNamespace = namespace ? `${namespace}\\${entry.name}` : entry.name;
      scanTraitsDir(entryPath, newNamespace, traits);
    } else if (entry.name.endsWith('.php')) {
      const trait = parseTraitFile(entryPath, namespace);
      if (trait) {
        traits.push(trait);
      }
    }
  }
}

export function generateTraitsMap(sourceDir: string, outputPath: string): void {
  const traitsDir = path.join(sourceDir, 'system', 'traits');
  const traits: TraitInfo[] = [];

  scanTraitsDir(traitsDir, 'icms', traits);

  const byNamespace: Record<string, TraitInfo[]> = {};
  for (const trait of traits) {
    if (!byNamespace[trait.namespace]) {
      byNamespace[trait.namespace] = [];
    }
    byNamespace[trait.namespace].push(trait);
  }

  const data: TraitsMap = {
    traits,
    byNamespace,
    methodCount: traits.reduce((sum, t) => sum + t.methods.length, 0),
    generatedAt: process.env.KNOWLEDGE_GENERATED_AT || new Date().toISOString(),
  };

  const typescriptContent = `// AUTO-GENERATED from source/system/traits
// Do not edit manually - run 'npm run parse:traits' to regenerate

export interface TraitMethod {
  name: string;
  visibility: 'public' | 'protected' | 'private';
  params: string[];
  description?: string;
}

export interface TraitInfo {
  name: string;
  namespace: string;
  filePath: string;
  methods: TraitMethod[];
  description?: string;
}

export interface TraitsMap {
  traits: TraitInfo[];
  byNamespace: Record<string, TraitInfo[]>;
  methodCount: number;
  generatedAt: string;
}

export const traitsMap: TraitsMap = ${JSON.stringify(data, null, 2)};

export function getTrait(name: string): TraitInfo | undefined {
  return traitsMap.traits.find(t => t.name === name);
}

export function getTraitMethods(name: string): TraitMethod[] {
  const trait = getTrait(name);
  return trait?.methods || [];
}

export function getTraitsByNamespace(namespace: string): TraitInfo[] {
  return traitsMap.byNamespace[namespace] || [];
}
`;

  fs.writeFileSync(outputPath, typescriptContent);
  console.log(
    `Generated ${data.traits.length} traits with ${data.methodCount} methods to ${outputPath}`
  );
}

if (require.main === module) {
  const sourcePath = path.resolve(process.env.INSTANTCMS_SOURCE || 'source');
  const outputPath = path.resolve('src/data/traits-map.ts');
  generateTraitsMap(sourcePath, outputPath);
}
