import { readFileSync } from 'node:fs';

const evidence = JSON.parse(readFileSync('knowledge/version-api.json', 'utf8'));
const upstream = JSON.parse(readFileSync('knowledge/upstream.json', 'utf8'));
const profiles = ['2.16', '2.17', '2.18.1', '2.18.2'];
if (evidence.schema_version !== 1 || evidence.repository !== upstream.repository) {
  throw new Error('Version API provenance mismatch');
}
if (evidence.snapshots.map(item => item.version).join(',') !== profiles.join(',')) {
  throw new Error('Version API profiles mismatch');
}
for (const snapshot of evidence.snapshots) {
  if (
    !/^[a-f0-9]{40}$/.test(snapshot.commit) ||
    !Object.keys(snapshot.hooks).length ||
    !Object.keys(snapshot.methods).length
  ) {
    throw new Error(`Invalid version API snapshot: ${snapshot.version}`);
  }
}
if (
  upstream.resolved_ref === evidence.snapshots.at(-1).ref &&
  evidence.snapshots.at(-1).commit !== upstream.commit
) {
  throw new Error('Current version API snapshot does not match pinned upstream commit');
}
const generated = readFileSync('src/generated/version-api.ts', 'utf8');
if (!generated.includes(JSON.stringify(evidence, null, 2))) {
  throw new Error('Runtime version API snapshot differs from provenance data');
}
console.log(`Validated ${evidence.snapshots.length} version API snapshots.`);
