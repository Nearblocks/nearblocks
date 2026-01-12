import cursors, { CursorObject } from '#libs/cursors';

export type WindowListQuery<T> = (
  start: string,
  end: string,
  limit?: number,
  direction?: 'asc' | 'desc',
) => Promise<T[]>;

export type WindowQuery<T> = (start: string, end: string) => Promise<null | T>;

export type WindowListOptions = {
  direction?: 'asc' | 'desc';
  end?: bigint;
  limit?: number;
  start: bigint;
};

export type WindowOptions = {
  start: bigint;
};

export type PaginatedResponse<T> = {
  data: null | T[];
  meta?: { next_page?: string; prev_page?: string };
};

const WINDOW_SIZE = BigInt(60 * 60 * 24 * 30 * 12) * 1_000_000_000n; // 1yr in ns

/**
 * Collects results by repeatedly querying over rolling time windows, moving backwards in time.
 * Continues querying until the specified limit of results is reached or the start boundary is hit.
 * Each query receives the current window's start and end timestamps and the remaining number of results needed.
 * Results from each window are concatenated in order.
 *
 * @param queryFn - An async function that takes (start, end, limit) and returns an array of results.
 * @param options - Optional settings, including start time, end time, and result limit.
 * @returns An array of results up to the specified limit.
 */
export const rollingWindowList = async <T>(
  queryFn: WindowListQuery<T>,
  options: WindowListOptions,
): Promise<T[]> => {
  const NOW = BigInt(Date.now()) * 1_000_000n; // Current time in ns
  const { direction = 'desc', end = NOW, limit = 1, start } = options;
  const windowSize = WINDOW_SIZE;
  const results: T[] = [];
  let startNs = start;
  let endNs = end;

  if (direction === 'asc') {
    while (startNs < end && results.length < limit) {
      const windowEnd = startNs + windowSize < end ? startNs + windowSize : end;
      const remaining = limit - results.length;

      const batch = await queryFn(
        startNs.toString(),
        windowEnd.toString(),
        remaining,
        direction,
      );

      if (batch?.length) {
        results.push(...batch.slice(0, remaining));
      }

      if (batch?.length < remaining) break;

      startNs = windowEnd;
    }

    return results;
  }

  while (endNs > start && results.length < limit) {
    const windowStart = endNs - windowSize > start ? endNs - windowSize : start;
    const remaining = limit - results.length;

    const batch = await queryFn(
      windowStart.toString(),
      endNs.toString(),
      remaining,
      direction,
    );

    if (batch?.length) {
      results.push(...batch.slice(0, remaining));
    }

    endNs = windowStart;
  }

  return results;
};

/**
 * Searches for a single result by repeatedly querying over rolling time windows, moving backwards in time.
 * Calls the provided query function with each window's start and end timestamps.
 * Returns the first non-null result found, or null if no result is found within the range.
 *
 * @param queryFn - An async function that takes (start, end) and returns a result or null.
 * @param options - Optional settings, including the earliest start time for the search.
 * @returns The first found result, or null if none is found.
 */
export const rollingWindow = async <T>(
  queryFn: WindowQuery<T>,
  options: WindowOptions,
): Promise<null | T> => {
  const { start } = options;
  const windowSize = WINDOW_SIZE;
  let endNs = BigInt(Date.now()) * 1_000_000n; // Current time in ns

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

/**
 * Computes the rolling window start boundary for window-paginated queries.
 *
 * For "prev" paging we query in ascending order (newer results), so we set the window start
 * to the cursor timestamp to avoid scanning earlier time windows that cannot contain results.
 *
 * @param start - The configured earliest timestamp (ns) to search from.
 * @param timestamp - Cursor timestamp (ns) when paging.
 * @param direction - Sort direction used by the underlying query.
 * @returns A start timestamp (ns) to use for the rolling window search.
 */
export const windowStart = (
  start: bigint,
  timestamp?: string,
  direction: 'asc' | 'desc' = 'desc',
) => {
  const cursorTs = timestamp ? BigInt(timestamp) : undefined;

  if (direction !== 'asc' || !cursorTs) return start;

  return cursorTs > start ? cursorTs : start;
};

/**
 * Computes the rolling window end boundary for window-paginated queries.
 *
 * For "next" paging we query in descending order (older results), so we clamp the end to the
 * minimum of the cursor timestamp and `before_ts` (exclusive).
 *
 * For "prev" paging we query in ascending order (newer results), so clamping the end to the
 * cursor would produce an empty result set (since the cursor predicate is `>`). In that case,
 * only `before_ts` (exclusive) is applied.
 *
 * @param timestamp - Cursor timestamp (ns) when paging.
 * @param before - Optional upper bound timestamp (ns), treated as exclusive.
 * @param direction - Sort direction used by the underlying query.
 * @returns An end timestamp (ns) to use for the rolling window search.
 */
export const windowEnd = (
  timestamp?: string,
  before?: string,
  direction: 'asc' | 'desc' = 'desc',
) => {
  const cursorTs = timestamp ? BigInt(timestamp) : undefined;
  const beforeTs = before ? BigInt(before) - 1n : undefined;

  if (direction === 'asc') return beforeTs;
  if (!cursorTs) return beforeTs;
  if (!beforeTs) return cursorTs;

  return cursorTs < beforeTs ? cursorTs : beforeTs;
};

/**
 * Paginates an array of items using cursor-based pagination.
 * Expects the input array to contain up to limit+1 items, where the extra item is used to determine if there is a next page.
 * If more items than the limit are present, returns a cursor for fetching the next page.
 *
 * @param items - The array of items to paginate (should be up to limit+1 in length).
 * @param limit - The maximum number of items to return in the current page.
 * @param cursorExtractor - A function to extract a cursor object from the last item of the current page.
 * @returns A paginated response containing the data and, if applicable, a cursor for the next page.
 */
export const paginateData = <T, C extends CursorObject>(
  items: null | T[],
  limit: number,
  direction: 'asc' | 'desc',
  cursorExtractor: (item: T) => C,
  hasCursor: boolean,
): PaginatedResponse<T> => {
  if (!items || items.length === 0) return { data: [] };

  const hasMore = items.length > limit;
  const ordered = direction === 'asc' ? [...items].reverse() : items;
  const data = hasMore ? ordered.slice(0, limit) : ordered;

  const meta: Record<string, string> = {};

  if (data.length > 0) {
    const first = data[0];
    const last = data[data.length - 1];

    if (direction === 'desc') {
      if (hasMore) meta.next_page = cursors.encode(cursorExtractor(last));
      if (hasCursor) meta.prev_page = cursors.encode(cursorExtractor(first));
    } else {
      if (hasMore) meta.prev_page = cursors.encode(cursorExtractor(first));
      meta.next_page = cursors.encode(cursorExtractor(last));
    }
  }

  return Object.keys(meta).length > 0 ? { data, meta } : { data };
};
