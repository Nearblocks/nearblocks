import { logger } from 'nb-logger';

import { db, dbRead } from '#scripts/db';
import { CheckName, scanWindow } from '#scripts/findMissing';
import { checkConcurrency } from '#scripts/range';

type Found = Record<CheckName, Map<string, string>>;

type Finding = {
  actions: number;
  blocks: [number, number] | null;
  brokenActions: number;
  day: string;
  receipts: number;
  sample: null | string;
};

type Cursor = { findings: Finding[]; sync: string };

const cursorKey = 'receipts-check';
const maxFindings = 3000;
const minute = 60_000_000_000n;
const hour = 60n * minute;
const day = 24n * hour;
const checks: CheckName[] = ['A', 'A2', 'C'];

const dayLabel = (timestamp: bigint) =>
  new Date(Number(timestamp / 1_000_000n)).toISOString().slice(0, 10);

const larger = (a: bigint, b: bigint) => (a > b ? a : b);

const smaller = (a: bigint, b: bigint) => (a < b ? a : b);

export const advance = (done: Set<number>, index: number) => {
  let next = index;

  while (done.has(next)) next += 1;

  return next;
};

const firstTimestamp = async () => {
  const row = await dbRead('execution_outcomes')
    .orderBy('executed_in_block_timestamp', 'asc')
    .first('executed_in_block_timestamp');

  if (!row) throw new Error('execution_outcomes is empty');

  return BigInt(row.executed_in_block_timestamp);
};

const loadCursor = async (): Promise<Cursor | null> => {
  const row = await db('settings').where({ key: cursorKey }).first();

  return row?.value?.sync ? (row.value as Cursor) : null;
};

const saveCursor = (cursor: Cursor) =>
  db('settings')
    .insert({ key: cursorKey, value: cursor })
    .onConflict('key')
    .merge();

export const checkDay = async (
  from: bigint,
  to: bigint,
  state: { slice: bigint },
) => {
  const found: Found = { A: new Map(), A2: new Map(), C: new Map() };

  for (let t0 = from; t0 < to;) {
    const t1 = smaller(t0 + state.slice, to);
    const started = Date.now();

    for (const name of checks) {
      await scanWindow(dbRead, name, t0, t1, found[name]);
    }

    const seconds = (Date.now() - started) / 1000;

    if (seconds < 3) state.slice = smaller(state.slice * 2n, day);
    else if (seconds > 15 && state.slice > 10n * minute) state.slice /= 2n;

    t0 = t1;
  }

  return found;
};

const blockRange = async (
  stamps: string[],
): Promise<[number, number] | null> => {
  const times = stamps.map((stamp) => BigInt(stamp));
  const low = await dbRead('blocks')
    .where('block_timestamp', '>=', String(times.reduce(smaller)))
    .orderBy('block_timestamp', 'asc')
    .first('block_height');
  const high = await dbRead('blocks')
    .where('block_timestamp', '<=', String(times.reduce(larger)))
    .orderBy('block_timestamp', 'desc')
    .first('block_height');

  return low && high
    ? [Number(low.block_height), Number(high.block_height)]
    : null;
};

const summarize = async (
  label: string,
  found: Found,
): Promise<Finding | null> => {
  const stamps = new Set([
    ...found.A.values(),
    ...found.A2.values(),
    ...found.C.values(),
  ]);

  if (!stamps.size) return null;

  return {
    actions: found.A2.size,
    blocks: await blockRange([...stamps]),
    brokenActions: found.C.size,
    day: label,
    receipts: found.A.size,
    sample:
      [...found.A.keys(), ...found.A2.keys(), ...found.C.keys()][0] ?? null,
  };
};

export const runReceiptsCheck = async () => {
  const to = BigInt(Math.floor(Date.now() / 86_400_000)) * day;
  const cursor = await loadCursor();
  const first = await firstTimestamp();
  const from = cursor ? larger(BigInt(cursor.sync), first) : first;
  const resumeDay = dayLabel(from);
  const findings = (cursor?.findings ?? []).filter(
    (finding) => finding.day < resumeDay,
  );
  const days: bigint[] = [];

  for (let d = (from / day) * day; d < to; d += day) days.push(d);

  logger.info(
    {
      concurrency: checkConcurrency,
      days: days.length,
      from: resumeDay,
      resumed: Boolean(cursor),
      to: dayLabel(to),
    },
    'receipts check starting',
  );

  const done = new Set<number>();
  let next = 0;
  let cursorIndex = 0;
  let saving: Promise<unknown> = Promise.resolve();

  const persist = () => {
    const sync = cursorIndex < days.length ? days[cursorIndex] : to;

    saving = saving.then(() =>
      saveCursor({
        findings: findings.slice(0, maxFindings),
        sync: String(larger(sync, from)),
      }),
    );

    return saving;
  };

  const worker = async () => {
    const state = { slice: hour };

    for (;;) {
      const index = next++;

      if (index >= days.length) return;

      const label = dayLabel(days[index]);
      const started = Date.now();
      const found = await checkDay(
        larger(days[index], from),
        smaller(days[index] + day, to),
        state,
      );
      const finding = await summarize(label, found);

      if (finding) {
        if (findings.length < maxFindings) findings.push(finding);

        logger.warn(finding, 'receipts check found problems');
      }

      done.add(index);
      cursorIndex = advance(done, cursorIndex);
      await persist();

      logger.info(
        {
          day: label,
          remaining: days.length - cursorIndex,
          seconds: (Date.now() - started) / 1000,
        },
        'day checked',
      );
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(checkConcurrency, days.length) }, worker),
  );
  await persist();

  const sorted = [...findings].sort((a, b) => a.day.localeCompare(b.day));
  const sum = (key: 'actions' | 'brokenActions' | 'receipts') =>
    sorted.reduce((total, finding) => total + finding[key], 0);

  logger.info(
    {
      brokenActions: sum('brokenActions'),
      damagedDays: sorted.length,
      missingActions: sum('actions'),
      missingReceipts: sum('receipts'),
    },
    'receipts check completed',
  );

  if (sorted.length) {
    logger.warn({ findings: sorted }, 'receipts check findings');
  }
};
