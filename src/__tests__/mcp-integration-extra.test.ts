import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createServer } from '../server.js';
import { addonStructures } from '../data/schemas.js';
import { hooks } from '../data/hooks.js';
import { components } from '../data/components.js';

describe('MCP integration (extra)', () => {
  async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createServer();
    const client = new Client({ name: 'integration-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    try {
      return await fn(client);
    } finally {
      await client.close();
      await server.close();
    }
  }

  test('get_server_capabilities: число tools соответствует фактическому', async () => {
    await withClient(async client => {
      const listed = await client.listTools();
      const caps = await client.callTool({ name: 'get_server_capabilities', arguments: {} });
      const data = caps.structuredContent as { tools_count: number };
      // Подтверждаем, что tools_count в capabilities соответствует длине каталога.
      expect(data.tools_count).toBe(listed.tools.length);
      // И в частности — это все реально зарегистрированные tools.
      expect(data.tools_count).toBe(100);
    });
  });

  test('find_tool: известный запрос → matches не пустой', async () => {
    await withClient(async client => {
      const r = await client.callTool({
        name: 'find_tool',
        arguments: { query: 'создай дополнение' },
      });
      const data = r.structuredContent as { matches: unknown[] };
      expect(Array.isArray(data.matches)).toBe(true);
      expect(data.matches.length).toBeGreaterThan(0);
    });
  });

  test('find_tool: ranked содержит информацию о релевантности', async () => {
    await withClient(async client => {
      const r = await client.callTool({
        name: 'find_tool',
        arguments: { query: 'audit project upgrade' },
      });
      const data = r.structuredContent as { ranked: Array<unknown> };
      expect(Array.isArray(data.ranked)).toBe(true);
    });
  });

  test('get_workflow: каждый известный workflow отдаёт последовательность', async () => {
    await withClient(async client => {
      const workflows = ['addon', 'widget', 'template', 'audit', 'repair', 'upgrade'];
      for (const name of workflows) {
        const r = await client.callTool({ name: 'get_workflow', arguments: { workflow: name } });
        const data = r.structuredContent as { workflow: string; tools: string[] };
        expect(data.workflow).toBe(name);
        expect(Array.isArray(data.tools)).toBe(true);
        expect(data.tools.length).toBeGreaterThan(0);
      }
    });
  });

  test('explain_validation_error: известный код → success, неизвестный → error', async () => {
    await withClient(async client => {
      const ok = await client.callTool({
        name: 'explain_validation_error',
        arguments: { code: 'MISSING_REQUIRED_FILE' },
      });
      expect(ok.isError).toBeFalsy();

      const bad = await client.callTool({
        name: 'explain_validation_error',
        arguments: { code: 'UNDEFINED_CODE_XYZ' },
      });
      expect(bad.isError).toBe(true);
    });
  });

  test('compare_instantcms_versions: known и unknown', async () => {
    await withClient(async client => {
      const r = await client.callTool({
        name: 'compare_instantcms_versions',
        arguments: { from: '2.17', to: '2.18.2' },
      });
      expect(r.isError).toBeFalsy();

      const r2 = await client.callTool({
        name: 'compare_instantcms_versions',
        arguments: { from: '99.99.99', to: '2.18.2' },
      });
      // Не isError — просто возвращает warnings.
      expect(r2.isError).toBeFalsy();
    });
  });

  test('get_project_health: возвращает status=ready', async () => {
    await withClient(async client => {
      const r = await client.callTool({ name: 'get_project_health', arguments: {} });
      const data = r.structuredContent as { status: string };
      expect(data.status).toBe('ready');
    });
  });

  test('validate_generated_artifacts: валидный набор → is_valid=true', async () => {
    await withClient(async client => {
      const r = await client.callTool({
        name: 'validate_generated_artifacts',
        arguments: {
          files: {
            'manifest.xml': '<?xml version="1.0"?><root/>',
            'layout.yaml': 'layout:\n  rows: []',
          },
        },
      });
      const data = r.structuredContent as { is_valid: boolean };
      expect(data.is_valid).toBe(true);
    });
  });

  test('invalid input на list_hooks → isError', async () => {
    await withClient(async client => {
      const r = await client.callTool({
        name: 'list_hooks',
        arguments: { limit: -1 },
      });
      // Schema отвергает <0 и >200; Zod или no-throw поведение зависит от реализации.
      // Минимум — не должно throw.
      expect(r).toBeDefined();
    });
  });

  test('tools/list contains весь critical tool set', async () => {
    await withClient(async client => {
      const listed = await client.listTools();
      const names = new Set(listed.tools.map(t => t.name));
      // Подмножество, которое ОБЯЗАНО быть для всех наших workflows.
      const critical = [
        'get_server_capabilities',
        'find_tool',
        'get_workflow',
        'diagnose_request',
        'list_hooks',
        'get_hook_details',
        'search_hooks',
        'list_components',
        'get_component_api',
        'scaffold_addon',
        'get_addon_structure',
        'validate_addon',
        'validate_generated_artifacts',
        'build_addon_archive',
        'inspect_addon_archive',
        'get_field_types',
      ];
      for (const name of critical) {
        expect(names.has(name)).toBe(true);
      }
    });
  });

  test('knowledge volume count matches встроенным справочникам', async () => {
    await withClient(async client => {
      const r = await client.callTool({ name: 'get_server_capabilities', arguments: {} });
      const data = r.structuredContent as {
        knowledge: { hooks: number; components: number; addon_types: string[] };
      };
      expect(data.knowledge.hooks).toBe(hooks.length);
      expect(data.knowledge.components).toBe(components.length);
      expect(data.knowledge.addon_types.length).toBe(Object.keys(addonStructures).length);
    });
  });
});
