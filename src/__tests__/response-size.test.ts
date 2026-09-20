import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createServer } from '../server.js';
import { components } from '../data/components.js';

/**
 * Бюджеты размеров ответов.
 *
 * Типовой workflow не должен получать сотни килобайт справочника: у крупных
 * resources есть постраничные и компактные варианты, а `get_component_api`
 * отдаёт методы страницами (`methods_page.next_cursor`). Полный справочник
 * по-прежнему доступен: `instantcms://hooks/all`, `components/all` и
 * `limit`/`cursor` в инструментах.
 *
 * Тест не только проверяет бюджеты, но и печатает фактические размеры, чтобы
 * рост был виден в логах CI.
 */
const KiB = 1024;
const bytes = (value: unknown): number => Buffer.byteLength(JSON.stringify(value) ?? '', 'utf8');
const size = (value: unknown): string => `${(bytes(value) / KiB).toFixed(1)} KiB`;

async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer();
  const client = new Client({ name: 'size-budget', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  try {
    return await fn(client);
  } finally {
    await client.close();
    await server.close();
  }
}

describe('бюджет размера ответов / response size budget / 响应大小预算', () => {
  const resourceBudgets: Array<[string, number]> = [
    ['instantcms://quickstart', 8],
    ['instantcms://hooks/summary', 32],
    ['instantcms://components/summary', 32],
    ['instantcms://hooks/page/first', 64],
    ['instantcms://components/page/first', 64],
    ['instantcms://addon/types', 64],
    // Полные справочники остаются доступными, но не должны расти бесконтрольно.
    ['instantcms://hooks/all', 1024],
    ['instantcms://components/all', 1024],
  ];

  test.each(resourceBudgets)('resource %s укладывается в бюджет', async (uri, maxKiB) => {
    await withClient(async client => {
      const result = await client.readResource({ uri });
      const measured = bytes(result);
      process.stdout.write(`${uri}: ${size(result)} (budget ${maxKiB} KiB)\n`);
      expect(measured).toBeLessThanOrEqual(maxKiB * KiB);
    });
  });

  test('постраничные ресурсы меньше полных', async () => {
    await withClient(async client => {
      const allHooks = bytes(await client.readResource({ uri: 'instantcms://hooks/all' }));
      const pageHooks = bytes(await client.readResource({ uri: 'instantcms://hooks/page/first' }));
      expect(pageHooks).toBeLessThan(allHooks);

      const summary = bytes(await client.readResource({ uri: 'instantcms://components/summary' }));
      const all = bytes(await client.readResource({ uri: 'instantcms://components/all' }));
      expect(summary).toBeLessThan(all / 10);
    });
  });

  const toolBudgets: Array<[string, Record<string, unknown>, number]> = [
    ['get_server_capabilities', {}, 16],
    ['list_hooks', {}, 64],
    ['get_component_api', { component_name: 'cmsTemplate' }, 64],
    ['compare_instantcms_versions', { from: '2.16', to: '2.18.2' }, 64],
    [
      'plan_instantcms_upgrade',
      {
        files: {
          'system/controllers/demo/actions/index.php':
            "<?php cmsEventsManager::hook('captcha_html', $data); $cache->pause(); $cms->hookAll('before_render_page');",
        },
        from: '2.16',
        to: '2.18.2',
      },
      64,
    ],
    [
      'scaffold_crud',
      {
        addon_name: 'budgetdemo',
        fields: [
          { name: 'description', type: 'text', title: 'Описание' },
          { name: 'price', type: 'int', title: 'Цена' },
        ],
        options: { use_seo: true, use_slug: true },
      },
      96,
    ],
    ['scaffold_addon', { name: 'budgetaddon', title: 'Budget', type: 'with_admin' }, 96],
  ];

  test.each(toolBudgets)('tool %s укладывается в бюджет', async (name, args, maxKiB) => {
    await withClient(async client => {
      const result = await client.callTool({ name, arguments: args });
      const measured = bytes(result);
      process.stdout.write(`${name}: ${size(result)} (budget ${maxKiB} KiB)\n`);
      expect(measured).toBeLessThanOrEqual(maxKiB * KiB);
    });
  });

  test('get_component_api отдаёт методы страницами с курсором', async () => {
    await withClient(async client => {
      const biggest = [...components].sort((a, b) => b.methods.length - a.methods.length)[0];
      const first = await client.callTool({
        name: 'get_component_api',
        arguments: { component_name: biggest.name, limit: 5 },
      });
      const payload = first.structuredContent as {
        methods: Array<{ name: string }>;
        methods_page: { total: number; next_cursor: string | null; returned: number };
      };

      expect(payload.methods.length).toBe(5);
      expect(payload.methods_page.returned).toBe(5);
      expect(payload.methods_page.total).toBe(biggest.methods.length);

      if (payload.methods_page.next_cursor) {
        const second = await client.callTool({
          name: 'get_component_api',
          arguments: {
            component_name: biggest.name,
            limit: 5,
            cursor: payload.methods_page.next_cursor,
          },
        });
        const next = second.structuredContent as { methods: Array<{ name: string }> };
        expect(next.methods[0].name).not.toBe(payload.methods[0].name);
      }
    });
  });

  test('get_component_api без limit больше не отдаёт весь справочник', async () => {
    await withClient(async client => {
      const result = await client.callTool({
        name: 'get_component_api',
        arguments: { component_name: 'cmsTemplate' },
      });
      const payload = result.structuredContent as { methods_page: { limit: number } };
      expect(payload.methods_page.limit).toBe(50);
    });
  });
});
