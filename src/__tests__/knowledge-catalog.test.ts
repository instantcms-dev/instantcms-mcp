import {
  looksGenerated,
  summarizeKnowledgeSources,
  validateKnowledgeSources,
  type CatalogSource,
} from '../utils/knowledge-catalog.js';

/**
 * Уровень достоверности знаний должен быть заслуженным: `verified` допустим
 * только для данных, созданных парсером закреплённого исходника. Именно
 * рукописный `src/data/schemas.ts` был помечен `verified` и долго учил
 * несуществующему классу-установщику.
 */
const GENERATED_HEADER = '// AUTO-GENERATED from base.sql\n// Do not edit manually\n';
const CURATED_HEADER = '// Структуры файлов дополнений и шаблонов InstantCMS\n\n';

function source(overrides: Partial<CatalogSource> = {}): CatalogSource {
  return {
    id: 'sample',
    runtime_file: 'src/data/sample.ts',
    domain: 'hooks',
    confidence: 'verified',
    provenance: 'generated',
    verified_at: '2026-09-18',
    ...overrides,
  };
}

describe('knowledge catalog', () => {
  test('looksGenerated распознаёт шапку парсера', () => {
    expect(looksGenerated(GENERATED_HEADER)).toBe(true);
    expect(looksGenerated('// Auto-generated from system/core/*.php\n')).toBe(true);
    expect(
      looksGenerated('// Generated from official InstantCMS PHP hook calls. Do not edit.\n')
    ).toBe(true);
    expect(looksGenerated(CURATED_HEADER)).toBe(false);
  });

  test('generated + verified проходит', () => {
    const problems = validateKnowledgeSources([source()], () => GENERATED_HEADER);
    expect(problems).toEqual([]);
  });

  test('рукописный файл не может быть verified', () => {
    // Случай 1: файл рукописный, но объявлен сгенерированным.
    const markedGenerated = validateKnowledgeSources([source()], () => CURATED_HEADER);
    expect(markedGenerated).toHaveLength(1);
    expect(markedGenerated.join('\n')).toMatch(/не помечен как сгенерированный/);

    // Случай 2: честно указано curated, но достоверность завышена.
    const claimedVerified = validateKnowledgeSources(
      [source({ provenance: 'curated' })],
      () => CURATED_HEADER
    );
    expect(claimedVerified.join('\n')).toMatch(/требует provenance=generated/);
  });

  test('curated + inferred проходит, но curated + verified — нет', () => {
    const inferred = source({ confidence: 'inferred', provenance: 'curated' });
    expect(validateKnowledgeSources([inferred], () => CURATED_HEADER)).toEqual([]);

    const claimed = source({ confidence: 'verified', provenance: 'curated' });
    expect(validateKnowledgeSources([claimed], () => CURATED_HEADER).length).toBeGreaterThan(0);
  });

  test('сгенерированный файл не должен оставаться inferred', () => {
    const problems = validateKnowledgeSources(
      [source({ confidence: 'inferred', provenance: 'generated' })],
      () => GENERATED_HEADER
    );
    expect(problems.join('\n')).toMatch(/можно объявить verified/);
  });

  test('отсутствующий файл и дубликаты id сообщаются', () => {
    const problems = validateKnowledgeSources(
      [source(), source({ runtime_file: 'src/data/missing.ts' })],
      file => (file.endsWith('missing.ts') ? null : GENERATED_HEADER)
    );
    expect(problems.join('\n')).toMatch(/дублирующийся id/);
    expect(problems.join('\n')).toMatch(/файл не найден/);
  });

  test('сводка считает уровни и домены', () => {
    const summary = summarizeKnowledgeSources([
      source({ id: 'a', confidence: 'verified', provenance: 'generated' }),
      source({ id: 'b', confidence: 'inferred', provenance: 'curated', domain: 'schemas' }),
      source({ id: 'c', confidence: 'inferred', provenance: 'curated', domain: 'hooks' }),
      source({ id: 'd', confidence: 'legacy', provenance: 'curated' }),
    ]);

    expect(summary).toEqual({
      total: 4,
      verified: 1,
      inferred: 2,
      legacy: 1,
      inferred_domains: ['hooks', 'schemas'],
    });
  });

  test('каталог проекта согласован', () => {
    // Реальный каталог проверяется в knowledge:build; здесь фиксируем,
    // что schema.ts остаётся рукописным и не выдаёт себя за проверенный.
    const { knowledgeCatalog, knowledgeSummary } = require('../generated/knowledge-meta.js') as {
      knowledgeCatalog: { sources: CatalogSource[] };
      knowledgeSummary: { verified: number; inferred: number };
    };

    const schemas = knowledgeCatalog.sources.find(item => item.id === 'runtime-schemas');
    expect(schemas).toMatchObject({ confidence: 'inferred', provenance: 'curated' });
    expect(knowledgeSummary.verified).toBeGreaterThan(0);
    expect(knowledgeSummary.inferred).toBeGreaterThan(0);
  });
});
