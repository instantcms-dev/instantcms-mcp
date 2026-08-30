/**
 * Matching логика для find_tool: token-based matching с ранжированием.
 *
 * Приоритет:
 *   1. exact match ключевого слова (category.keywords.includes(query.normalized))
 *   2. prefix match (keyword.startsWith(queryToken) || queryToken.startsWith(keyword))
 *   3. substring match (keyword.includes(queryToken) || queryToken.includes(keyword))
 *
 * Запрос токенизируется по Unicode-словным границам; multi-word запросы
 * матчатся, если ВСЕ токены попадают в keywords одной категории.
 * Возвращает категории, отсортированные по score desc, плюс дополнительные
 * метрики.
 */

export interface ToolCategory {
  category: string;
  keywords: string[];
  tools: string[];
}

export interface FindResult {
  category: string;
  tools: string[];
  score: number;
  matchedTokens: string[];
}

const MAX_TOKEN_LENGTH = 64;

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function tokenize(s: string): string[] {
  const norm = normalize(s);
  // Unicode-словные границы, фильтр пустых и длинных токенов.
  return norm
    .split(/[\s,.!?;:"'()[\]{}<>|/\\\-_+=]+/u)
    .filter(t => t.length > 0 && t.length <= MAX_TOKEN_LENGTH);
}

function scoreCategory(
  queryTokens: string[],
  category: ToolCategory
): {
  score: number;
  matched: string[];
} {
  if (queryTokens.length === 0 || category.keywords.length === 0) {
    return { score: 0, matched: [] };
  }

  const keywords = category.keywords.map(normalize);
  const matched: string[] = [];
  let totalScore = 0;

  for (const token of queryTokens) {
    let bestScore = 0;
    let matchedKeyword: string | null = null;

    for (const keyword of keywords) {
      let s = 0;
      if (keyword === token) {
        s = 100;
      } else if (keyword.startsWith(token) || token.startsWith(keyword)) {
        s = 60;
      } else if (keyword.includes(token) || token.includes(keyword)) {
        s = 30;
      }

      if (s > bestScore) {
        bestScore = s;
        matchedKeyword = keyword;
      }
    }

    if (bestScore > 0) {
      totalScore += bestScore;
      if (matchedKeyword) matched.push(matchedKeyword);
    }
  }

  // Multi-word: matched at least once per token.
  if (matched.length < queryTokens.length) {
    // Partial match: даём меньший score, чтобы категории с полным совпадением
    // были выше.
    totalScore = Math.floor(totalScore * 0.5);
  }

  return { score: totalScore, matched };
}

/**
 * Ранжирует категории по релевантности запросу. Возвращает не более maxResults,
 * отсортированных по score desc. Категории с score=0 НЕ включаются.
 */
export function rankToolCategories<T extends ToolCategory>(
  query: string,
  categories: T[],
  maxResults = 5
): FindResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return categories
    .map(category => {
      const { score, matched } = scoreCategory(tokens, category);
      return { category: category.category, tools: category.tools, score, matchedTokens: matched };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Удобная обёртка: вернуть список объектов ToolCategory в исходном формате,
 * отсортированных по релевантности. Пустой результат → полный каталог.
 */
export function findToolCategories<T extends ToolCategory>(
  query: string,
  categories: T[],
  fallbackAll = true
): { matches: T[]; ranked: FindResult[] } {
  const ranked = rankToolCategories(query, categories);
  const matches = categories.filter(c => ranked.some(r => r.category === c.category));

  if (matches.length === 0 && fallbackAll) {
    return { matches: categories, ranked: [] };
  }
  return { matches, ranked };
}
