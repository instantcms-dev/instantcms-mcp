export interface PageOptions {
  cursor?: string;
  limit?: number;
}

export function paginate<T>(items: T[], options: PageOptions = {}) {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = decodeCursor(options.cursor);
  const page = items.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  return {
    items: page,
    page: {
      limit,
      returned: page.length,
      total: items.length,
      next_cursor: nextOffset < items.length ? encodeCursor(nextOffset) : null,
    },
  };
}

function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), 'utf8').toString('base64url');
}

function decodeCursor(cursor?: string): number {
  if (!cursor) return 0;
  const value = Number(Buffer.from(cursor, 'base64url').toString('utf8'));
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
