export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function quoteIni(value: string): string {
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/\"/g, '\\"')
    .replace(/[\r\n]+/g, ' ')}"`;
}

export function quotePhp(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Serialize data only; raw PHP expressions are deliberately unsupported. */
export function phpValue(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return quotePhp(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) return `[${value.map(phpValue).join(', ')}]`;
  if (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return `[${Object.entries(value)
      .map(([key, item]) => `${quotePhp(key)} => ${phpValue(item)}`)
      .join(', ')}]`;
  }
  throw new TypeError('Unsupported PHP data value');
}

/** A JSON string is also a valid YAML double-quoted scalar. */
export function quoteYaml(value: string | number): string {
  return JSON.stringify(String(value));
}
