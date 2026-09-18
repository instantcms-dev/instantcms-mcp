import { versionApiEvidence } from '../generated/version-api.js';

type Snapshot = (typeof versionApiEvidence.snapshots)[number];
type Hook = { name: string; files: string[] };
type Method = { component: string; name: string; file: string };

function hooksOf(snapshot: Snapshot): Hook[] {
  return Object.entries(snapshot.hooks).map(([name, files]) => ({ name, files }));
}

function methodsOf(snapshot: Snapshot): Method[] {
  return Object.entries(snapshot.methods).flatMap(([component, entry]) =>
    entry.names.map(name => ({ component, name, file: entry.file }))
  );
}

function changes<T>(from: readonly T[], to: readonly T[], key: (item: T) => string) {
  const before = new Set(from.map(key));
  const after = new Set(to.map(key));
  return {
    added: to.filter(item => !before.has(key(item))),
    removed: from.filter(item => !after.has(key(item))),
  };
}

export function compareVersionApi(from: string, to: string) {
  const source = versionApiEvidence.snapshots.find(item => item.version === from);
  const target = versionApiEvidence.snapshots.find(item => item.version === to);
  if (!source || !target) return null;
  const sourceHooks = hooksOf(source);
  const targetHooks = hooksOf(target);
  const sourceMethods = methodsOf(source);
  const targetMethods = methodsOf(target);
  return {
    provenance: {
      repository: versionApiEvidence.repository,
      from: { ref: source.ref, commit: source.commit },
      to: { ref: target.ref, commit: target.commit },
    },
    hooks: changes<Hook>(sourceHooks, targetHooks, item => item.name),
    methods: changes<Method>(
      sourceMethods,
      targetMethods,
      item => `${item.component}.${item.name}`
    ),
    source_hooks: new Set<string>(Object.keys(source.hooks)),
    target_hooks: new Set<string>(Object.keys(target.hooks)),
    target_method_names: new Set<string>(targetMethods.map(item => item.name)),
  };
}
