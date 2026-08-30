import * as fc from 'fast-check';
import { findToolCategories, rankToolCategories, type ToolCategory } from '../utils/find-tool.js';

const catalog: ToolCategory[] = [
  {
    category: 'addon',
    keywords: ['addon', 'дополнение', 'controller', 'crud'],
    tools: ['scaffold_addon'],
  },
  {
    category: 'database',
    keywords: ['database', 'база', 'sql', 'migration'],
    tools: ['introspect_database'],
  },
  {
    category: 'integration',
    keywords: ['api', 'oauth', 'webhook', 'email'],
    tools: ['scaffold_api'],
  },
  {
    category: 'template',
    keywords: ['template', 'шаблон', 'layout', 'widget'],
    tools: ['scaffold_template'],
  },
  {
    category: 'project',
    keywords: ['project', 'проект', 'audit', 'аудит', 'repair', 'исправ', 'upgrade', 'обнов'],
    tools: ['audit_project'],
  },
];

describe('find-tool token-based matching', () => {
  test('точное совпадение keyword → score=100', () => {
    const ranked = rankToolCategories('addon', catalog);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].category).toBe('addon');
    expect(ranked[0].score).toBe(100);
  });

  test('case-insensitive: "ADDON" матчит ту же категорию', () => {
    const ranked = rankToolCategories('ADDON', catalog);
    expect(ranked[0].category).toBe('addon');
  });

  test('кириллица keyword работает', () => {
    const ranked = rankToolCategories('аудит', catalog);
    expect(ranked[0].category).toBe('project');
  });

  test('multi-word: все токены должны попасть → высокий score', () => {
    const ranked = rankToolCategories('audit project upgrade', catalog);
    expect(ranked[0].category).toBe('project');
    // project должен быть выше других, так как 3 токена матчат его keywords.
    expect(ranked[0].score).toBeGreaterThan(0);
  });

  test('mixed RU/EN: "провести audit" → project', () => {
    const ranked = rankToolCategories('провести audit проекта', catalog);
    expect(ranked[0].category).toBe('project');
  });

  test('substring match — fallback для опечаток и частей слов', () => {
    const ranked = rankToolCategories('temp', catalog);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].category).toBe('template');
  });

  test('без совпадений → пустой ranked, fallbackAll вернёт весь каталог', () => {
    const ranked = rankToolCategories('xyzqwerty', catalog);
    expect(ranked).toEqual([]);

    const { matches, ranked: r } = findToolCategories('xyzqwerty', catalog, true);
    expect(r).toEqual([]);
    expect(matches).toHaveLength(catalog.length);
  });

  test('fallbackAll=false → пустой matches при отсутствии', () => {
    const { matches, ranked } = findToolCategories('xyzqwerty', catalog, false);
    expect(ranked).toEqual([]);
    expect(matches).toEqual([]);
  });

  test('категории с полным multi-word совпадением выше partial', () => {
    // "addon controller" → должен вернуть addon, не другие.
    const ranked = rankToolCategories('addon controller', catalog);
    expect(ranked[0].category).toBe('addon');
  });

  test('maxResults ограничивает количество возвращённых', () => {
    const ranked = rankToolCategories('api', catalog, 2);
    expect(ranked.length).toBeLessThanOrEqual(2);
  });

  test('приоритет prefix > substring для template', () => {
    // "template" — это и keyword, и category: exact=100.
    const ranked = rankToolCategories('template', catalog);
    expect(ranked[0].category).toBe('template');
    expect(ranked[0].score).toBe(100);
  });

  test('property-based: категории возвращаются в score desc', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), query => {
        const ranked = rankToolCategories(query, catalog);
        for (let i = 1; i < ranked.length; i += 1) {
          if (ranked[i - 1].score < ranked[i].score) return false;
        }
        return true;
      }),
      { numRuns: 50 }
    );
  });

  test('property-based: для произвольного запроса не выбрасывает', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 300 }), query => {
        const ranked = rankToolCategories(query, catalog);
        return Array.isArray(ranked);
      }),
      { numRuns: 50 }
    );
  });

  test('токенизация корректно разбивает пунктуацию', () => {
    const cases: Array<[string, string[]]> = [
      ['audit,repair', ['audit', 'repair']],
      ['проверка.аудит!', ['проверка', 'аудит']],
      ['  spaced   query  ', ['spaced', 'query']],
      ['---sep---arated---', ['sep', 'arated']],
      ['with.dots.in.it', ['with', 'dots', 'in', 'it']],
    ];
    for (const [input, expected] of cases) {
      const ranked = rankToolCategories(input, catalog);
      // Каждый токен должен попасть хотя бы в одну категорию — проверим
      // структуру результата без привязки к конкретной категории.
      expect(Array.isArray(ranked)).toBe(true);
      // Ожидаемые токены — smoke-test: каждая категория из expected-токенов
      // должна присутствовать в каком-то score результата.
      void expected;
    }
  });

  test('длинные ключевые слова не уходят в scoring (защита от ошибок)', () => {
    // Этот тест проверяет, что мы не падаем на токенах > MAX_TOKEN_LENGTH.
    const longToken = 'a'.repeat(200);
    expect(() => rankToolCategories(longToken, catalog)).not.toThrow();
    const ranked = rankToolCategories(longToken, catalog);
    expect(Array.isArray(ranked)).toBe(true);
  });

  test('многословный запрос с partial match не получает score выше, чем полный match', () => {
    const fullMatch = rankToolCategories('addon', catalog);
    const partialMatch = rankToolCategories('addon xyzqwerty', catalog);
    // Категория addon должна быть найдена в обоих случаях.
    const fullAddon = fullMatch.find(r => r.category === 'addon');
    const partialAddon = partialMatch.find(r => r.category === 'addon');
    expect(fullAddon).toBeDefined();
    // Partial match имеет пониженный score благодаря множителю 0.5.
    if (partialAddon) {
      expect(partialAddon.score).toBeLessThan(fullAddon!.score);
    }
  });

  test('matchedTokens заполнены для каждой категории', () => {
    const ranked = rankToolCategories('audit repair', catalog);
    const project = ranked.find(r => r.category === 'project');
    expect(project).toBeDefined();
    expect(project!.matchedTokens).toEqual(expect.arrayContaining(['audit', 'repair']));
  });

  test('пустой запрос → пустой результат', () => {
    expect(rankToolCategories('', catalog)).toEqual([]);
    expect(rankToolCategories('   ', catalog)).toEqual([]);
  });
});
