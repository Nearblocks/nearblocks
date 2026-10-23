import { Knex } from 'nb-knex';

export type CheckName = 'A' | 'A2' | 'C';

export type Row = {
  empties?: null | string;
  empty?: boolean;
  receipt_id: string;
  ts: string;
};

type Check = { column: string; sql: string; table: null | string };

const hour = 3_600_000_000_000n;
const lookbackNs = 900_000_000_000n;
const confirmMarginNs = 7n * 86_400_000_000_000n;
const minWindowNs = 1_000_000_000n;
const timeoutSeconds = 25;
const emptyReceiptGas = 108_059_500_000;

const checks: Record<CheckName, Check> = {
  A: {
    column: 'included_in_block_timestamp',
    sql: `select eo.receipt_id, eo.executed_in_block_timestamp as ts
      from execution_outcomes eo
      left join receipts r on r.receipt_id = eo.receipt_id
        and r.included_in_block_timestamp >= :lb
        and r.included_in_block_timestamp < :t1
      where eo.executed_in_block_timestamp >= :t0
        and eo.executed_in_block_timestamp < :t1
        and r.receipt_id is null`,
    table: 'receipts',
  },
  A2: {
    column: 'receipt_included_in_block_timestamp',
    sql: `with c as materialized (
        select eo.receipt_id, eo.executed_in_block_timestamp as ts,
          eo.gas_burnt = ${emptyReceiptGas}
            and eo.status in ('SUCCESS_VALUE', 'SUCCESS_RECEIPT_ID') as empty
        from execution_outcomes eo
        left join action_receipt_actions x on x.receipt_id = eo.receipt_id
          and x.receipt_included_in_block_timestamp >= :lb
          and x.receipt_included_in_block_timestamp < :t1
        where eo.executed_in_block_timestamp >= :t0
          and eo.executed_in_block_timestamp < :t1
          and x.receipt_id is null
      )
      select receipt_id, ts, empty, null::bigint as empties
      from c where not empty
      union all
      select receipt_id, ts, empty, (select count(*) from c where empty) as empties
      from (select receipt_id, ts, empty from c where empty order by ts limit 1) s`,
    table: 'action_receipt_actions',
  },
  C: {
    column: 'receipt_included_in_block_timestamp',
    sql: `select receipt_id, min(receipt_included_in_block_timestamp) as ts
      from action_receipt_actions
      where receipt_included_in_block_timestamp >= :t0
        and receipt_included_in_block_timestamp < :t1
      group by receipt_id
      having count(*) <> max(index_in_action_receipt) + 1
        or min(index_in_action_receipt) <> 0`,
    table: null,
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const errorInfo = (error: unknown) =>
  error as { code?: string; message?: string };

const isTimeout = (error: unknown) => {
  const { code, message } = errorInfo(error);

  return (
    code === '57014' || /query timeout|statement timeout/i.test(message ?? '')
  );
};

const isTransient = (error: unknown) => {
  const { code, message } = errorInfo(error);

  return (
    ['08003', '08006', '40001', '40P01', '57P01'].includes(code ?? '') ||
    /conflict with recovery|terminating connection|connection terminated/i.test(
      message ?? '',
    )
  );
};

const withRetry = async <T>(run: () => Promise<T>): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      if (isTimeout(error) || !isTransient(error) || attempt >= 5) throw error;

      await sleep(2000 * 2 ** attempt);
    }
  }
};

const query = (client: Knex, name: CheckName, t0: bigint, t1: bigint) =>
  withRetry(() =>
    client.transaction(async (trx) => {
      await trx.raw(`set local statement_timeout = '${timeoutSeconds}s'`);
      await trx.raw('set local enable_nestloop = off');

      const result = await trx.raw(checks[name].sql, {
        lb: String(t0 - lookbackNs),
        t0: String(t0),
        t1: String(t1),
      });

      return result.rows as Row[];
    }),
  );

export const findPresent = async (
  client: Knex,
  table: string,
  column: string,
  rows: Row[],
) => {
  const sorted = [...rows].sort((a, b) =>
    BigInt(a.ts) < BigInt(b.ts) ? -1 : 1,
  );
  const found = new Set<string>();

  for (let i = 0; i < sorted.length; i += 500) {
    const batch = sorted.slice(i, i + 500);
    const lo = BigInt(batch[0].ts) - confirmMarginNs;
    const hi = BigInt(batch[batch.length - 1].ts) + confirmMarginNs;
    const ids = [...new Set(batch.map((row) => row.receipt_id))];
    const present = await withRetry(() =>
      client.transaction(async (trx) => {
        await trx.raw(`set local statement_timeout = '${timeoutSeconds}s'`);

        const result = await trx(table)
          .whereIn('receipt_id', ids)
          .where(column, '>=', String(lo))
          .where(column, '<', String(hi))
          .distinct('receipt_id');

        return result as { receipt_id: string }[];
      }),
    );

    present.forEach((row) => found.add(row.receipt_id));
  }

  return found;
};

const confirm = async (client: Knex, name: CheckName, rows: Row[]) => {
  const { column, table } = checks[name];
  const probe = rows.filter((row) => !row.empty);

  if (!table || !probe.length) return rows;

  const found = await findPresent(client, table, column, probe);

  return rows.filter((row) => row.empty || !found.has(row.receipt_id));
};

export const scanWindow = async (
  client: Knex,
  name: CheckName,
  t0: bigint,
  t1: bigint,
  out: Map<string, Row>,
): Promise<void> => {
  let rows: null | Row[] = null;

  try {
    rows = await query(client, name, t0, t1);
  } catch (error) {
    if (!isTimeout(error)) throw error;
  }

  if (!rows) {
    const width = t1 - t0;

    if (width <= minWindowNs) {
      throw new Error(`cannot narrow window for ${name} at ${t0}`);
    }

    const mid = t0 + width / 2n;

    await scanWindow(client, name, t0, mid, out);
    await scanWindow(client, name, mid, t1, out);

    return;
  }

  (await confirm(client, name, rows)).forEach((row) =>
    out.set(row.receipt_id, row),
  );
};

export const findMissing = async (client: Knex, from: bigint, to: bigint) => {
  const rows = new Map<string, Row>();

  for (let t0 = from; t0 < to; t0 += hour) {
    const t1 = t0 + hour < to ? t0 + hour : to;

    for (const name of ['A', 'A2'] as CheckName[]) {
      await scanWindow(client, name, t0, t1, rows);
    }
  }

  return new Map(
    [...rows].filter(([, row]) => !row.empty).map(([id, row]) => [id, row.ts]),
  );
};
