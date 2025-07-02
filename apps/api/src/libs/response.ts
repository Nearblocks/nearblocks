import config from '#config';
import cursors, { CursorObject } from '#libs/cursors';

export type RollingWindowQuery<T> = (
  start: string,
  end: string,
  limit?: number,
) => Promise<T[]>;

export type RollingWindowOptions = {
  end?: bigint;
  limit?: number;
  start?: bigint;
};

export type PaginatedResponse<T> = {
  data: null | T[];
  meta?: { cursor: string };
};

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
const WINDOW_SIZE = BigInt(60 * 60 * 24 * 30 * 12) * 1_000_000_000n; // 1yr in ns

export const rollingWindowList = async <T>(
  queryFn: RollingWindowQuery<T>,
  options: RollingWindowOptions = {},
): Promise<T[]> => {
  const {
    end = BigInt(Date.now()) * 1_000_000n,
    limit = 1,
    start = config.baseStart,
  } = options;
  const windowSize = WINDOW_SIZE;
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
  queryFn: (start: string, end: string) => Promise<null | T>,
  options: { start?: bigint } = {},
): Promise<null | T> => {
  const { start = config.baseStart } = options;
  const windowSize = WINDOW_SIZE;
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
