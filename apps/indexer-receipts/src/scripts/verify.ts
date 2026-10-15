import { db } from '#scripts/db';

const confirmMarginNs = 7n * 86_400_000_000_000n;

const batches = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );

export const findDuplicates = async (ids: Map<string, string>) => {
  const sorted = [...ids].sort(([, a], [, b]) =>
    BigInt(a) < BigInt(b) ? -1 : 1,
  );
  const duplicates: string[] = [];

  for (const batch of batches(sorted, 500)) {
    const lo = BigInt(batch[0][1]) - confirmMarginNs;
    const hi = BigInt(batch[batch.length - 1][1]) + confirmMarginNs;
    const rows = await db('receipts')
      .whereIn(
        'receipt_id',
        batch.map(([id]) => id),
      )
      .where('included_in_block_timestamp', '>=', String(lo))
      .where('included_in_block_timestamp', '<', String(hi))
      .groupBy('receipt_id')
      .havingRaw('count(*) > 1')
      .select('receipt_id');

    rows.forEach((row) => duplicates.push(row.receipt_id as string));
  }

  return duplicates;
};

export const checkLanding = async (
  landing: string[],
  expectedByTs: Map<string, [string, string][]>,
) => {
  const absent: Record<string, number> = {};
  const samples: string[] = [];
  let expected = 0;
  let rowCount = 0;

  for (const batch of batches(landing, 200)) {
    const rows = await db('receipts')
      .whereIn('included_in_block_timestamp', batch)
      .select('included_in_block_timestamp', 'receipt_id');
    const byTs = new Map<string, Set<string>>();

    rows.forEach((row) => {
      const key = String(row.included_in_block_timestamp);

      if (!byTs.has(key)) byTs.set(key, new Set());

      byTs.get(key)?.add(row.receipt_id as string);
    });

    batch.forEach((timestamp) => {
      const have = byTs.get(timestamp) ?? new Set<string>();

      rowCount += have.size;

      (expectedByTs.get(timestamp) ?? []).forEach(([id, kind]) => {
        expected += 1;

        if (have.has(id)) return;

        absent[kind] = (absent[kind] ?? 0) + 1;

        if (samples.length < 5) samples.push(id);
      });
    });
  }

  return {
    absentAtLanding: absent,
    dbRows: rowCount,
    expected,
    landingBlocks: landing.length,
    samples,
  };
};
