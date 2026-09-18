/**
 * Опции генераторов, которые принимались, но нигде не использовались.
 *
 * Молчаливо проигнорированная опция хуже отсутствующей: вызывающая сторона
 * считает, что запросила поведение, и узнаёт об обратном только в рантайме.
 * Такие опции отклоняются с подсказкой, что делать вместо них.
 */

export type UnsupportedOptions = Record<string, string>;

/**
 * Бросает ошибку, если передана хотя бы одна неподдерживаемая опция.
 * Значения `false`, `undefined` и `null` не считаются запросом поведения.
 */
export function rejectUnsupportedOptions(
  tool: string,
  options: Record<string, unknown> | undefined,
  unsupported: UnsupportedOptions
): void {
  if (!options) return;

  const requested = Object.entries(unsupported).filter(([key]) => {
    const value = options[key];
    return value !== undefined && value !== null && value !== false;
  });

  if (!requested.length) return;

  const details = requested.map(([key, hint]) => `  - ${key}: ${hint}`).join('\n');

  throw new Error(
    `${tool}: эти опции пока не поддерживаются генератором:\n${details}\n` +
      'Уберите их или реализуйте соответствующую часть вручную.'
  );
}

/** Список реально поддержанных опций для отчёта в результате генерации. */
export function appliedOptions(
  options: Record<string, unknown> | undefined,
  supported: string[]
): Record<string, unknown> {
  const applied: Record<string, unknown> = {};
  for (const key of supported) {
    const value = options?.[key];
    if (value !== undefined) applied[key] = value;
  }
  return applied;
}
