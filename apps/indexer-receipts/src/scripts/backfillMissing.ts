import { Readable } from 'node:stream';

import { logger } from 'nb-logger';
import { Message } from 'nb-neardata';
import { streamBlock as streamRawBlock } from 'nb-neardata-raw';
import { ActionReceiptAction, Receipt } from 'nb-types';

import config from '#config';
import {
  actionToInclusion,
  Candidate,
  detectMethod,
  ExistingRow,
  inclusionPositions,
  Method,
  Position,
  Resolved,
  resolveMethods,
  toInclusion,
} from '#scripts/backfillPlan';
import { db } from '#scripts/db';
import { buildOutcomeRows } from '#scripts/outcomeRows';
import { archiveConcurrency, lookbackBlocks } from '#scripts/range';

type Group = {
  actions: ActionReceiptAction[];
  inclusion: boolean;
  receipts: Receipt[];
};

const guardMarginNs = 7n * 86_400_000_000_000n;
const runGap = 50;

const batches = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );

const loadHeights = async (stamps: string[]) => {
  const heights = new Map<string, number>();

  for (const batch of batches(stamps, 1000)) {
    const rows = await db('blocks')
      .whereIn('block_timestamp', batch)
      .select('block_height', 'block_timestamp');

    rows.forEach((row) =>
      heights.set(String(row.block_timestamp), Number(row.block_height)),
    );
  }

  return heights;
};

const toRuns = (heights: number[]) => {
  const runs: [number, number][] = [];

  [...heights]
    .sort((a, b) => a - b)
    .forEach((height) => {
      const last = runs[runs.length - 1];

      if (last && height - last[1] <= runGap) last[1] = height;
      else runs.push([height, height]);
    });

  return runs;
};

const existingAt = (timestamp: string): Promise<ExistingRow[]> =>
  db('receipts')
    .where('included_in_block_timestamp', timestamp)
    .select('receipt_id', 'shard_id', 'index_in_chunk');

const existingIds = async (
  table: string,
  column: string,
  ids: string[],
  timestamp: string,
) => {
  const rows = await db(table)
    .whereIn('receipt_id', ids)
    .where(column, '>=', String(BigInt(timestamp) - guardMarginNs))
    .where(column, '<', String(BigInt(timestamp) + guardMarginNs))
    .distinct('receipt_id');

  return new Set(rows.map((row) => row.receipt_id as string));
};

const insertBatches = async (
  table: string,
  rows: (ActionReceiptAction | Receipt)[],
  conflict: string[],
) => {
  for (const batch of batches(rows, config.insertLimit)) {
    await db(table).insert(batch).onConflict(conflict).ignore();
  }
};

const openStream = (start: number, end: number): Readable =>
  streamRawBlock({
    apiKey: config.fastnearApiKey,
    concurrency: archiveConcurrency,
    end,
    network: config.network,
    start,
  });

const collect = async (ids: Map<string, string>, runs: [number, number][]) => {
  const candidates: Candidate[] = [];
  const inclusionById = new Map<string, Position>();
  const expectedByTs = new Map<string, [string, string][]>();
  const found = new Set<string>();
  const seen = new Set<number>();

  for (const [start, end] of runs) {
    const stream = openStream(start - lookbackBlocks, end);

    for await (const message of stream as AsyncIterable<Message>) {
      const height = message.block.header.height;

      if (height > end) break;

      const inclusion = inclusionPositions(message);

      inclusion.forEach((position, id) => {
        if (ids.has(id)) inclusionById.set(id, position);
      });

      if (seen.has(height)) continue;

      seen.add(height);

      const timestamp = message.block.header.timestampNanosec;

      expectedByTs.set(
        timestamp,
        [...inclusion].map(([id, position]): [string, string] => [
          id,
          position.kind,
        ]),
      );

      const built = message.shards.flatMap((shard) =>
        shard.chunk
          ? [
              buildOutcomeRows(
                shard.shardId,
                shard.chunk.header.chunkHash,
                message.block.header.hash,
                timestamp,
                shard.receiptExecutionOutcomes,
              ),
            ]
          : [],
      );
      const executed = built.flatMap((item) => item.receipts);
      const receipts = executed.filter((row) => ids.has(row.receipt_id));

      if (!receipts.length) continue;

      receipts.forEach((row) => found.add(row.receipt_id));

      const existing = await existingAt(timestamp);
      const outcomeById = new Map(
        executed.map((row): [string, Receipt] => [row.receipt_id, row]),
      );

      candidates.push({
        actions: built
          .flatMap((item) => item.actions)
          .filter((row) => ids.has(row.receipt_id)),
        detection: detectMethod(existing, inclusion, outcomeById),
        emptyBlock: existing.length === 0,
        height,
        receipts,
        timestamp,
      });

      if (candidates.length % 100 === 0) {
        logger.info({ blocks: candidates.length, height }, 'collecting');
      }
    }

    stream.destroy();
  }

  return { candidates, expectedByTs, found, inclusionById };
};

const buildGroups = (
  resolved: Resolved[],
  inclusionById: Map<string, Position>,
) => {
  const groups = new Map<string, Group>();
  const methodAt = new Map(
    resolved.map((item): [string, Method] => [
      item.candidate.timestamp,
      item.method,
    ]),
  );
  const stats = {
    delayed: 0,
    disagree: 0,
    inclusion: 0,
    maxDelay: 0,
    notPlaced: [] as string[],
    outcome: 0,
    samples: { inclusion: [] as Receipt[], outcome: [] as Receipt[] },
  };

  const groupOf = (timestamp: string) => {
    const group = groups.get(timestamp) ?? {
      actions: [],
      inclusion: false,
      receipts: [],
    };

    groups.set(timestamp, group);

    return group;
  };

  resolved.forEach(({ candidate, method }) => {
    candidate.receipts.forEach((row) => {
      if (method === 'outcome') {
        groupOf(candidate.timestamp).receipts.push(row);
        stats.outcome += 1;

        if (stats.samples.outcome.length < 3) stats.samples.outcome.push(row);

        return;
      }

      const position = inclusionById.get(row.receipt_id);

      if (!position) {
        stats.notPlaced.push(row.receipt_id);

        return;
      }

      const placed = toInclusion(row, position);
      const group = groupOf(position.blockTimestamp);

      group.inclusion = true;
      group.receipts.push(placed);
      stats.inclusion += 1;

      if (stats.samples.inclusion.length < 3) {
        stats.samples.inclusion.push(placed);
      }

      if (position.blockTimestamp !== candidate.timestamp) {
        stats.delayed += 1;
        stats.maxDelay = Math.max(
          stats.maxDelay,
          candidate.height - position.blockHeight,
        );

        const landing = methodAt.get(position.blockTimestamp);

        if (landing && landing !== 'inclusion') stats.disagree += 1;
      }
    });

    candidate.actions.forEach((row) => {
      if (method === 'outcome') {
        groupOf(candidate.timestamp).actions.push(row);

        return;
      }

      const position = inclusionById.get(row.receipt_id);

      if (position) {
        groupOf(position.blockTimestamp).actions.push(
          actionToInclusion(row, position),
        );
      }
    });
  });

  return { groups, stats };
};

const guard = async (timestamp: string, group: Group) => {
  const ids = [
    ...new Set(
      [...group.receipts, ...group.actions].map((row) => row.receipt_id),
    ),
  ];
  const haveReceipts = await existingIds(
    'receipts',
    'included_in_block_timestamp',
    ids,
    timestamp,
  );
  const haveActions = await existingIds(
    'action_receipt_actions',
    'receipt_included_in_block_timestamp',
    ids,
    timestamp,
  );

  return {
    actions: group.actions.filter((row) => !haveActions.has(row.receipt_id)),
    receipts: group.receipts.filter((row) => !haveReceipts.has(row.receipt_id)),
  };
};

const layoutOf = async (
  timestamp: string,
  receipts: Receipt[],
  inclusion: boolean,
) => {
  const used = new Map<string, string>();
  const added = new Set<string>();
  const crossStyle: string[] = [];
  let internal = 0;

  (await existingAt(timestamp)).forEach((row) =>
    used.set(`${row.shard_id}|${row.index_in_chunk}`, row.receipt_id),
  );

  receipts.forEach((row) => {
    const key = `${row.shard_id}|${row.index_in_chunk}`;
    const holder = used.get(key);

    if (holder && holder !== row.receipt_id) {
      if (added.has(key)) internal += 1;
      else crossStyle.push(`${timestamp}|${key}|${holder}|${row.receipt_id}`);
    }

    added.add(key);
    used.set(key, row.receipt_id);
  });

  if (!inclusion) return { crossStyle, holes: 0, internal };

  const maxByShard = new Map<number, number>();
  const countByShard = new Map<number, number>();

  used.forEach((_, key) => {
    const [shard, index] = key.split('|').map(Number);

    maxByShard.set(shard, Math.max(maxByShard.get(shard) ?? -1, index));
    countByShard.set(shard, (countByShard.get(shard) ?? 0) + 1);
  });

  let holes = 0;

  maxByShard.forEach((max, shard) => {
    holes += max + 1 - (countByShard.get(shard) ?? 0);
  });

  return { crossStyle, holes, internal };
};

export const runBackfill = async (ids: Map<string, string>) => {
  if (!ids.size) {
    return {
      expectedByTs: new Map<string, [string, string][]>(),
      landing: [] as string[],
    };
  }

  const heights = await loadHeights([...new Set(ids.values())]);
  const unknown = [...new Set(ids.values())].filter((ts) => !heights.has(ts));

  if (unknown.length) throw new Error(`no block for ts: ${unknown[0]}`);

  const runs = toRuns(
    [...new Set(ids.values())].map((ts) => heights.get(ts) as number),
  );

  logger.info({ ids: ids.size, lookback: lookbackBlocks, runs }, 'planning');

  const { candidates, expectedByTs, found, inclusionById } = await collect(
    ids,
    runs,
  );
  const resolved = resolveMethods(candidates);
  const { groups, stats } = buildGroups(resolved, inclusionById);
  const crossStyle: string[] = [];
  const totals = {
    actions: 0,
    holesAfter: 0,
    internalCollisions: 0,
    receipts: 0,
    skippedExisting: 0,
  };

  for (const [timestamp, group] of groups) {
    const kept = await guard(timestamp, group);
    const layout = await layoutOf(timestamp, kept.receipts, group.inclusion);

    totals.actions += kept.actions.length;
    crossStyle.push(...layout.crossStyle);
    totals.internalCollisions += layout.internal;
    totals.holesAfter += layout.holes;
    totals.receipts += kept.receipts.length;
    totals.skippedExisting += group.receipts.length - kept.receipts.length;
  }

  const notFound = [...ids.keys()].filter((id) => !found.has(id));

  logger.info(
    {
      blocksWithMissing: candidates.length,
      crossStyleCollisions: crossStyle.length,
      delayed: stats.delayed,
      disagree: stats.disagree,
      emptyBlocks: candidates.filter((item) => item.emptyBlock).length,
      expected: ids.size,
      inclusion: stats.inclusion,
      inheritedBlocks: resolved.filter((item) => item.inherited).length,
      maxDelayBlocks: stats.maxDelay,
      mixedBlocks: candidates.filter((item) => item.detection.mixed).length,
      notFound: notFound.length,
      notPlaced: stats.notPlaced.length,
      outcome: stats.outcome,
      ...totals,
    },
    'plan',
  );
  logger.info(
    { crossStyle: crossStyle.slice(0, 5), samples: stats.samples },
    'plan samples',
  );

  if (notFound.length || stats.notPlaced.length || totals.internalCollisions) {
    throw new Error(
      `validation failed: notFound=${notFound.slice(0, 3)} notPlaced=${stats.notPlaced.slice(0, 3)} internalCollisions=${totals.internalCollisions}`,
    );
  }

  for (const [timestamp, group] of groups) {
    const kept = await guard(timestamp, group);

    await insertBatches('receipts', kept.receipts, [
      'receipt_id',
      'included_in_block_timestamp',
    ]);
    await insertBatches('action_receipt_actions', kept.actions, [
      'receipt_id',
      'index_in_action_receipt',
      'receipt_included_in_block_timestamp',
    ]);
  }

  logger.info({ groups: groups.size }, 'applied');

  return { expectedByTs, landing: [...groups.keys()] };
};
