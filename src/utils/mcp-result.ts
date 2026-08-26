export function successResult(data: Record<string, unknown>, summary?: string) {
  return {
    content: [{ type: 'text' as const, text: summary ?? JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

export function errorResult(code: string, message: string, details: Record<string, unknown> = {}) {
  const data = { code, message, ...details };
  return {
    isError: true,
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
