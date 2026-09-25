import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createServer } from '../server.js';

/**
 * Замер расхода токенов на работу MCP-сервера / Token usage budget.
 *
 * Сколько токенов сервер стоит клиентской модели:
 *
 *  1. `tools/list` — определения всех инструментов. Это постоянный оверхед:
 *     клиент кладёт их в контекст на КАЖДЫЙ запрос, поэтому здесь выигрыш
 *     суммируется по всему сеансу.
 *  2. Ответы вызовов — одноразовые, но остаются в истории диалога.
 *
 * Точного токенизатора в зависимостях нет, поэтому токены оцениваются
 * эвристикой (ASCII ~3.4 симв./токен для JSON-подобного текста, не-ASCII ~1.6
 * для кириллицы/иероглифов). Погрешность ±25%, но для бюджетов важна
 * относительная величина: рост описаний или схем виден сразу.
 *
 * Тест печатает фактические числа, чтобы расход был виден в логах CI.
 */

const ASCII_CHARS_PER_TOKEN = 3.4;
const NON_ASCII_CHARS_PER_TOKEN = 1.6;

/** Оценка токенов без токенизатора / Rough token estimate (no tokenizer). */
function estimateTokens(text: string): number {
  let ascii = 0;
  let nonAscii = 0;
  for (const ch of text) {
    if (ch.charCodeAt(0) < 128) ascii += 1;
    else nonAscii += 1;
  }
  return Math.ceil(ascii / ASCII_CHARS_PER_TOKEN) + Math.ceil(nonAscii / NON_ASCII_CHARS_PER_TOKEN);
}

const json = (value: unknown): string => JSON.stringify(value) ?? '';
const format = (value: number): string => value.toLocaleString('ru-RU');

async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer();
  const client = new Client({ name: 'token-budget', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  try {
    return await fn(client);
  } finally {
    await client.close();
    await server.close();
  }
}

describe('бюджет токенов / token budget / 令牌预算', () => {
  test('estimateTokens: эвристика детерминирована и монотонна', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('a'.repeat(340))).toBe(100);
    expect(estimateTokens('б'.repeat(160))).toBe(100);
    // Рост текста не уменьшает оценку.
    expect(estimateTokens('hello world ')).toBeLessThan(
      estimateTokens('hello world ' + 'x'.repeat(500))
    );
  });

  test('tools/list: определения инструментов укладываются в бюджет', async () => {
    const tokens = await withClient(async client => {
      const { tools } = await client.listTools();
      const rows = tools.map(tool => {
        const {
          name = '',
          description = '',
          inputSchema,
        } = tool as {
          name?: string;
          description?: string;
          inputSchema?: unknown;
        };
        return {
          name,
          description: estimateTokens(description),
          schema: estimateTokens(json(inputSchema)),
          total: estimateTokens(json(tool)),
        };
      });

      const total = rows.reduce((acc, row) => acc + row.total, 0);
      const description = rows.reduce((acc, row) => acc + row.description, 0);
      const schema = rows.reduce((acc, row) => acc + row.schema, 0);
      const top = [...rows].sort((a, b) => b.total - a.total).slice(0, 15);

      process.stdout.write(
        `\ntools/list: ${rows.length} инструментов, ${format(total)} токенов ` +
          `(описания ${format(description)}, схемы ${format(schema)}), ` +
          `в среднем ${format(Math.round(total / rows.length))} на инструмент\n`
      );
      for (const row of top) {
        process.stdout.write(
          `  ${row.name.padEnd(38)} ${String(row.total).padStart(6)} ` +
            `(desc ${row.description}, schema ${row.schema})\n`
        );
      }
      return total;
    });

    // Постоянный оверхед сеанса: на каждый запрос модели уходят определения.
    expect(tokens).toBeLessThanOrEqual(30_000);
  });

  test('ответы типовых вызовов укладываются в бюджет', async () => {
    // Бюджеты — фактический замер + запас ~10% на шум данных. Превышение
    // означает, что ответ стал дороже: либо расширен справочник, либо
    // уехали дефолты пагинации.
    const calls: Array<[string, Record<string, unknown>, number]> = [
      ['get_server_capabilities', {}, 900],
      ['list_hooks', {}, 15_500],
      ['list_hooks', { brief: true }, 4_000],
      ['get_component_api', { component_name: 'cmsTemplate' }, 19_000],
      ['get_component_api', { component_name: 'cmsTemplate', brief: true }, 7_000],
      ['compare_instantcms_versions', { from: '2.16', to: '2.18.2' }, 13_000],
      [
        'scaffold_crud',
        {
          addon_name: 'tokendemo',
          fields: [
            { name: 'description', type: 'text', title: 'Описание' },
            { name: 'price', type: 'int', title: 'Цена' },
          ],
          options: { use_seo: true, use_slug: true },
        },
        17_500,
      ],
    ];

    await withClient(async client => {
      // Сначала печатаем все замеры, потом сверяем: один прогон даёт полную
      // картину, а не останавливается на первом превышении.
      const over: string[] = [];
      for (const [name, args, budget] of calls) {
        const result = await client.callTool({ name, arguments: args });
        const tokens = estimateTokens(json(result));
        process.stdout.write(`${name}: ${format(tokens)} токенов (бюджет ${format(budget)})\n`);
        if (tokens > budget) over.push(`${name}: ${format(tokens)} > ${format(budget)}`);
      }
      expect(over).toEqual([]);
    });
  });
});
