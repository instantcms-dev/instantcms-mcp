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

/** A JSON string is also a valid YAML double-quoted scalar. */
export function quoteYaml(value: string | number): string {
  return JSON.stringify(String(value));
}
