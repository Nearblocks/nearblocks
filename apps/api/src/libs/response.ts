import cursors from '#libs/cursors';

const DEFAULT_WINDOW = BigInt(60 * 60 * 24 * 30 * 12) * 1_000_000_000n; // 1yr in ns

export const rollingWindow = async <T>(
  start: bigint,
  queryFn: (start: string, end: string) => Promise<null | T>,
  windowSize = DEFAULT_WINDOW,
): Promise<null | T> => {
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

export const paginateData = <T, K extends keyof T>(
  items: T[],
  limit: number,
  columns: K[],
): { data: T[]; meta?: { cursor: string } } => {
  const hasMore = items.length > limit;

  if (!hasMore) return { data: items };

  const sliced = items.slice(0, limit);
  const lastItem = sliced[limit - 1];
  const cursor = columns.reduce(
    (obj, key) => {
      obj[key] = lastItem[key];

      return obj;
    },
    {} as Pick<T, K>,
  );
  const next = cursors.encode(cursor);

  return { data: sliced, meta: { cursor: next } };
};
