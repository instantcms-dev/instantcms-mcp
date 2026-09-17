import { scaffoldCrud } from '../tools/crud-tool.js';
import { scaffoldApi } from '../tools/api-tool.js';
import { validateGeneratedArtifacts } from '../tools/artifact-tool.js';
import { phpValue } from '../utils/serialization.js';

describe('generated PHP regressions', () => {
  test('CRUD with custom fields produces syntactically valid PHP', () => {
    const result = scaffoldCrud({
      addon_name: 'demo_catalog',
      fields: [
        { name: 'description', type: 'text', title: "Author's description (", default: 'Пример' },
      ],
    }) as { files: Record<string, string> };
    expect(validateGeneratedArtifacts(result.files).diagnostics).toEqual([]);
  });

  test('PHP data serializer emits arrays rather than JavaScript objects', () => {
    expect(
      phpValue({ title: "Author's", rules: [['required']], default: false, value: null })
    ).toBe(
      "['title' => 'Author\\'s', 'rules' => [['required']], 'default' => false, 'value' => null]"
    );
    expect(() => phpValue(undefined)).toThrow();
    expect(() => phpValue(Infinity)).toThrow();
  });

  test('brackets in PHP strings and comments do not cause false diagnostics', () => {
    expect(
      validateGeneratedArtifacts({ 'sample.php': "<?php $label = '('; // [\n" }).diagnostics
    ).toEqual([]);
  });

  test('API with multiple endpoints and path params produces valid PHP actions', () => {
    const result = scaffoldApi({
      addon_name: 'demo_api',
      endpoints: [
        { name: 'list', method: 'GET', path: '/list' },
        {
          name: 'item',
          method: 'GET',
          path: '/items/{id}',
          params: [{ name: 'id', type: 'path', required: true }],
        },
        { name: 'public', method: 'GET', path: '/public', auth_required: false },
      ],
    }) as unknown as {
      files: Record<string, string>;
      scaffold_status: string;
      limitations: string[];
    };
    expect(validateGeneratedArtifacts(result.files).diagnostics).toEqual([]);
    expect(result.scaffold_status).toBe('partial');
    expect(Array.isArray(result.limitations)).toBe(true);
    expect(
      result.files['package/system/controllers/demo_api/actions/api_v1_public.php']
    ).not.toContain('checkAuth()');
  });
});
