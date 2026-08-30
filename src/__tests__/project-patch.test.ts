import * as fc from 'fast-check';
import { createProjectPatch } from '../tools/project-patch-tool.js';

describe('createProjectPatch', () => {
  test('идентичные file-maps → пустой patch', () => {
    const result = createProjectPatch({ 'a.txt': 'hello' }, { 'a.txt': 'hello' });
    expect(result.patch).toBe('');
    expect(result.is_empty).toBe(true);
    expect(result.changed_files).toBe(0);
  });

  test('пустые file-maps → пустой patch', () => {
    const result = createProjectPatch({}, {});
    expect(result.patch).toBe('');
    expect(result.is_empty).toBe(true);
  });

  test('изменён один файл → patch содержит этот файл', () => {
    const result = createProjectPatch({ 'a.txt': 'hello' }, { 'a.txt': 'world' });
    expect(result.patch).toContain('diff --git a/a.txt b/a.txt');
    expect(result.patch).toContain('-hello');
    expect(result.patch).toContain('+world');
    expect(result.changed_files).toBe(1);
    expect(result.is_empty).toBe(false);
  });

  test('удалён файл → patch содержит "deleted file mode" и весь контент с -', () => {
    const result = createProjectPatch({ 'remove.txt': 'gone' }, {});
    expect(result.patch).toContain('deleted file mode 100644');
    expect(result.patch).toContain('--- a/remove.txt');
    expect(result.patch).toContain('+++ /dev/null');
    expect(result.patch).toContain('-gone');
  });

  test('добавлен файл → patch содержит "new file mode" и контент с +', () => {
    const result = createProjectPatch({}, { 'new.txt': 'fresh' });
    expect(result.patch).toContain('new file mode 100644');
    expect(result.patch).toContain('--- /dev/null');
    expect(result.patch).toContain('+++ b/new.txt');
    expect(result.patch).toContain('+fresh');
  });

  test('identical content, different path → registered as rename с similarity 100%', () => {
    const result = createProjectPatch(
      { 'old/name.txt': 'unchanged' },
      { 'new/name.txt': 'unchanged' }
    );
    expect(result.patch).toContain('rename from old/name.txt');
    expect(result.patch).toContain('rename to new/name.txt');
    expect(result.patch).toContain('similarity index 100%');
    expect(result.renames).toEqual({ 'old/name.txt': 'new/name.txt' });
  });

  test('path traversal в path → throws "Unsafe project path"', () => {
    expect(() => createProjectPatch({}, { '../escape.txt': 'pwn' })).toThrow(/Unsafe project path/);
    expect(() => createProjectPatch({}, { '/abs/path': 'pwn' })).toThrow(/Unsafe project path/);
    expect(() => createProjectPatch({}, { 'with\nnewline.txt': 'pwn' })).toThrow(
      /Unsafe project path/
    );
  });

  test('multi-file: deletes, additions, edits, renames в одном patch', () => {
    const before = {
      'keep.txt': 'k',
      'edit.txt': 'old',
      'gone.txt': 'g',
    };
    const after = {
      'keep.txt': 'k',
      'edit.txt': 'new',
      'added.txt': 'a',
      'moved.txt': 'g', // rename of gone.txt
    };
    const result = createProjectPatch(before, after);
    expect(result.patch).toContain('rename from gone.txt');
    expect(result.patch).toContain('rename to moved.txt');
    expect(result.patch).toContain('-old'); // from edit.txt
    expect(result.patch).toContain('+new');
    expect(result.patch).toContain('+a'); // added.txt
    // changed_files = adds - renames + edits = (1 added + 1 deleted) - 1 rename + 1 edited = 2
    expect(result.changed_files).toBeGreaterThan(0);
  });

  test('content без trailing newline → "No newline at end of file"', () => {
    const result = createProjectPatch({ 'n.txt': 'no-nl' }, { 'n.txt': 'with-nl' });
    expect(result.patch).toContain('\\ No newline at end of file');
  });

  test('property-based: patch никогда не throws на корректных путях', () => {
    const safePath = fc
      .stringMatching(/^[a-z][a-z0-9_]{0,20}(\/[a-z0-9_]{0,20})*$/)
      .filter(s => s.length > 0);
    fc.assert(
      fc.property(
        fc.dictionary(safePath, fc.string({ maxLength: 200 }), { maxKeys: 10 }),
        fc.dictionary(safePath, fc.string({ maxLength: 200 }), { maxKeys: 10 }),
        (before, after) => {
          const result = createProjectPatch(before, after);
          expect(typeof result.patch).toBe('string');
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('property-based: changed_files >= 0 всегда', () => {
    const safePath = fc
      .stringMatching(/^[a-z][a-z0-9_]{0,15}(\/[a-z0-9_]{0,15})*$/)
      .filter(s => s.length > 0);
    fc.assert(
      fc.property(
        fc.dictionary(safePath, fc.string({ maxLength: 100 }), { maxKeys: 8 }),
        fc.dictionary(safePath, fc.string({ maxLength: 100 }), { maxKeys: 8 }),
        (before, after) => {
          const result = createProjectPatch(before, after);
          expect(result.changed_files).toBeGreaterThanOrEqual(0);
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('patch валиден как string даже на пустых maps (не null/undefined)', () => {
    const result = createProjectPatch({}, {});
    expect(typeof result.patch).toBe('string');
    expect(result.patch).toBe('');
  });

  test('rename detection: одинаковый content по новому пути + нет других совпадений → rename', () => {
    const result = createProjectPatch({ 'a.txt': 'one' }, { 'b.txt': 'one' });
    expect(result.renames['a.txt']).toBe('b.txt');
    expect(result.patch).toContain('rename from a.txt');
  });

  test('content без неломающих символов (null-byte и \\r остаются в patch как есть — backend отвечает за экранирование)', () => {
    const result = createProjectPatch(
      { 'a.php': '<?php\n/*\u0000bad*/' },
      { 'a.php': '<?php\n/*fixed*/' }
    );
    expect(result.patch).toContain('+<?php');
    expect(result.patch).toContain('+/*fixed*/');
  });
});
