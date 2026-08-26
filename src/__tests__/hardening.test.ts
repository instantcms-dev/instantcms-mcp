import { getComponentApi, validateAddon } from '../tools/addon-tool.js';
import { getHookDetails, searchHooks } from '../tools/hooks-tool.js';
import { scaffoldLayoutScheme } from '../tools/layout-tool.js';
import { scaffoldAddon, scaffoldTemplate } from '../tools/scaffold-tool.js';

describe('generator hardening', () => {
  test('generated addon passes validation with full package paths', () => {
    const result = scaffoldAddon({
      name: 'catalog',
      title: 'Каталог',
      type: 'basic',
    }) as { files: Record<string, string> };
    const validation = validateAddon(result.files) as { is_valid: boolean; errors: string[] };
    expect(validation.errors).toEqual([]);
    expect(validation.is_valid).toBe(true);
  });

  test('escapes XML, INI, and PHP strings', () => {
    const title = `A & <B> 'quoted' "value"`;
    const result = scaffoldAddon({
      name: 'safe_addon',
      title,
      type: 'basic',
    }) as { files: Record<string, string> };
    expect(result.files['package/system/controllers/safe_addon/manifest.xml']).toContain(
      'A &amp; &lt;B&gt; &apos;quoted&apos; &quot;value&quot;'
    );
    expect(result.files['[pkg] manifest.ru.ini']).toContain('\\"value\\"');
    expect(
      result.files['package/system/languages/ru/controllers/safe_addon/safe_addon.php']
    ).toContain("\\'quoted\\'");
  });

  test('rejects invalid names and versions', () => {
    expect(() => scaffoldAddon({ name: '../bad', title: 'Bad', type: 'basic' })).toThrow();
    expect(() =>
      scaffoldAddon({ name: 'valid_name', title: 'Bad', type: 'basic', version: 'latest' })
    ).toThrow();
    expect(() => scaffoldTemplate({ name: '!', title: 'Bad' })).toThrow();
  });

  test('quotes YAML scalars safely', () => {
    const result = scaffoldLayoutScheme({
      rows: [{ title: 'Footer: links #1', cols: [{ title: 'yes', position: 'null' }] }],
    });
    expect(result.yaml).toContain('title: "Footer: links #1"');
    expect(result.yaml).toContain('title: "yes"');
    expect(result.yaml).toContain('name: "null"');
  });

  test('does not silently choose ambiguous lookup results', () => {
    expect((getHookDetails('content') as { code?: string }).code).toBe('AMBIGUOUS_HOOK');
    expect((getComponentApi('cms') as { code?: string }).code).toBe('AMBIGUOUS_COMPONENT');
    expect((searchHooks('$data') as { total: number }).total).toBeGreaterThan(0);
  });
});
