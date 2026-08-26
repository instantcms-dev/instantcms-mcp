function splitLines(content: string): string[] {
  if (!content) return [];
  const lines = content.split('\n');
  if (lines.at(-1) === '') lines.pop();
  return lines;
}

function patchBody(oldContent: string, newContent: string): string[] {
  const oldLines = splitLines(oldContent);
  const newLines = splitLines(newContent);
  const removed = oldLines.map(line => `-${line}`);
  const added = newLines.map(line => `+${line}`);
  if (oldContent && !oldContent.endsWith('\n')) removed.push('\\ No newline at end of file');
  if (newContent && !newContent.endsWith('\n')) added.push('\\ No newline at end of file');
  return [
    `@@ -${oldLines.length ? `1,${oldLines.length}` : '0,0'} +${newLines.length ? `1,${newLines.length}` : '0,0'} @@`,
    ...removed,
    ...added,
  ];
}

function header(path: string): string {
  const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '');
  if (
    !normalized ||
    normalized.startsWith('/') ||
    /[\r\n\0]/.test(normalized) ||
    normalized.split('/').some(part => part === '..')
  ) {
    throw new Error(`Unsafe project path: ${path}`);
  }
  return normalized;
}

export function createProjectPatch(
  beforeInput: Record<string, string>,
  afterInput: Record<string, string>
) {
  const before = Object.fromEntries(
    Object.entries(beforeInput).map(([path, value]) => [header(path), value])
  );
  const after = Object.fromEntries(
    Object.entries(afterInput).map(([path, value]) => [header(path), value])
  );
  const removed = Object.keys(before).filter(path => !(path in after));
  const added = Object.keys(after).filter(path => !(path in before));
  const renamed = new Map<string, string>();

  for (const oldPath of removed) {
    const newPath = added.find(
      path => ![...renamed.values()].includes(path) && after[path] === before[oldPath]
    );
    if (newPath) renamed.set(oldPath, newPath);
  }

  const chunks: string[] = [];
  for (const [oldPath, newPath] of [...renamed].sort(([a], [b]) => a.localeCompare(b))) {
    chunks.push(
      `diff --git a/${oldPath} b/${newPath}`,
      'similarity index 100%',
      `rename from ${oldPath}`,
      `rename to ${newPath}`
    );
  }
  for (const path of removed.filter(item => !renamed.has(item)).sort()) {
    chunks.push(
      `diff --git a/${path} b/${path}`,
      'deleted file mode 100644',
      `--- a/${path}`,
      '+++ /dev/null',
      ...patchBody(before[path], '')
    );
  }
  for (const path of added.filter(item => ![...renamed.values()].includes(item)).sort()) {
    chunks.push(
      `diff --git a/${path} b/${path}`,
      'new file mode 100644',
      '--- /dev/null',
      `+++ b/${path}`,
      ...patchBody('', after[path])
    );
  }
  for (const path of Object.keys(before)
    .filter(path => path in after && before[path] !== after[path])
    .sort()) {
    chunks.push(
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      ...patchBody(before[path], after[path])
    );
  }

  const patch = chunks.length ? `${chunks.join('\n')}\n` : '';
  return {
    patch,
    changed_files:
      removed.length +
      added.length -
      renamed.size +
      Object.keys(before).filter(path => path in after && before[path] !== after[path]).length,
    renames: Object.fromEntries(renamed),
    is_empty: !patch,
  };
}
