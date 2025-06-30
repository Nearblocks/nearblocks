import config from '#config';
import cursors, { CursorObject } from '#libs/cursors';

export type PaginatedResponse<T> = {
  data: null | T[];
  meta?: { cursor: string };
};

export type RollingWindowQuery<T> = (
  start: string,
  end: string,
  limit?: number,
) => Promise<null | T | T[]>;

export type RollingWindowOptions = {
  end?: bigint;
  limit?: number;
  start?: bigint;
  windowSize?: bigint;
};

const DEFAULT_WINDOW = BigInt(60 * 60 * 24 * 30 * 12) * 1_000_000_000n; // 1yr in ns

export const rollingWindowList = async <T>(
  queryFn: RollingWindowQuery<T>,
  options: RollingWindowOptions = {},
): Promise<T[]> => {
  const {
    end = BigInt(Date.now()) * 1_000_000n,
    limit = 1,
    start = config.baseStart,
    windowSize = DEFAULT_WINDOW,
  } = options;
  const results: T[] = [];
  let endNs = end;

  while (endNs > start && results.length < limit) {
    const windowStart = endNs - windowSize > start ? endNs - windowSize : start;
    const remaining = limit - results.length;

    const batch = await queryFn(
      windowStart.toString(),
      endNs.toString(),
      remaining,
    );

    if (batch) {
      const items = Array.isArray(batch) ? batch : [batch];
      results.push(...items.slice(0, remaining));
    }

    endNs = windowStart;
  }

  return results;
};

export const rollingWindow = async <T>(
  queryFn: (start: string, end: string) => Promise<null | T>,
  options: { start?: bigint; windowSize?: bigint } = {},
): Promise<null | T> => {
  const { start = config.baseStart, windowSize = DEFAULT_WINDOW } = options;
  let endNs = BigInt(Date.now()) * 1_000_000n;

  while (endNs > start) {
    const startNs = endNs - windowSize;
    const windowStart = startNs > start ? startNs : start;

    const result = await queryFn(windowStart.toString(), endNs.toString());

    if (result) {
      return result;
    }

    endNs = windowStart;
  }

  return null;
};

export const paginateData = <T, C extends CursorObject>(
  items: null | T[],
  limit: number,
  cursorExtractor: (item: T) => C,
): PaginatedResponse<T> => {
  if (!items) return { data: [] };

  const hasMore = items.length > limit;

  if (!hasMore) return { data: items };

  const sliced = items.slice(0, limit);
  const lastItem = sliced[limit - 1];
  const cursor = cursorExtractor(lastItem);
  const next = cursors.encode(cursor);

  return { data: sliced, meta: { cursor: next } };
};
