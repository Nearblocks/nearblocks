import fs from 'node:fs/promises';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';

import { blockHeightToPath } from '../cache/path.js';
import { enrichBlock, ReceiptMap, ReceiptMapFullError } from './receipts.js';
import type { IndexerBlock } from './receipts.js';
import {
  NodeRpc,
  parseJsonPreservingUnsafeIntegers,
  rawJsonNumber,
  validateBlock,
} from './rpc.js';
import {
  durableRemove,
  durableWrite,
  ensureFreeSpace,
  pruneSkippedHeights,
  readCheckpoint,
  readSkippedHeights,
} from './storage.js';
import type { Checkpoint } from './storage.js';

export interface WorkerConfig {
  cacheDir: string;
  cacheTtlSecs: number;
  intervalMs: number;
  maxCatchupBlocks: number;
  maxPendingReceipts: number;
  minFreeBytes?: number;
  network: string;
  replayBlocks: number;
  rpcUrl: string;
  stateDir: string;
  timeoutMs: number;
}

const options = workerData as WorkerConfig;
class ReanchorRequiredError extends Error {}

const rpc = new NodeRpc(options.rpcUrl, options.timeoutMs);
const map = new ReceiptMap(options.maxPendingReceipts);
const checkpointFile = path.join(options.stateDir, 'checkpoint.json');
const skippedHeightsFile = path.join(options.stateDir, 'skipped-heights.json');
const skippedHeights = new Map<number, number>();
let stopping = false;
let initialized = false;
let checkpoint: Checkpoint | null = null;
let cursor: IndexerBlock['block'] | null = null;
let latestBytes: Buffer | null = null;
let chainId = '';
let genesisHash = '';
let reanchorAtCurrentHead = false;
let consecutiveFailures = 0;
let pollRequested = false;
let wakePoll: (() => void) | null = null;
let sleepWakesOnPoll = false;
let iterationStartedAt = 0;
const MIN_POLL_GAP_MS = 200;
parentPort!.on('message', (message) => {
  if (message === 'stop') {
    stopping = true;
    wakePoll?.();
  } else if (message === 'poll') {
    // Polls only shorten the normal interval. They never cut a failure
    // backoff short, and a loop iteration that just started is fresh enough.
    if (consecutiveFailures > 0) return;
    if (Date.now() - iterationStartedAt < MIN_POLL_GAP_MS) return;
    if (wakePoll) {
      if (sleepWakesOnPoll) wakePoll();
    } else pollRequested = true;
  }
});

const send = (message: unknown): void => {
  parentPort!.postMessage(message);
};
const sleep = (ms: number, wakeOnPoll: boolean): Promise<void> =>
  new Promise((resolve) => {
    if (stopping || (wakeOnPoll && pollRequested)) {
      pollRequested = false;
      resolve();
      return;
    }
    pollRequested = false;
    sleepWakesOnPoll = wakeOnPoll;
    const timer = setTimeout(() => {
      wakePoll = null;
      resolve();
    }, ms);
    wakePoll = () => {
      clearTimeout(timer);
      wakePoll = null;
      pollRequested = false;
      resolve();
    };
  });

/** Serialize the node response in the block proxy's public JSON shape. */
function serializeBlock(block: IndexerBlock): Buffer {
  const output = block as IndexerBlock & {
    block: IndexerBlock['block'] & {
      header: IndexerBlock['block']['header'] & { timestamp?: number | string };
    };
    tracked_shards?: number[];
  };
  delete output.tracked_shards;

  const omitNullProposedSplit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const entry of value) omitNullProposedSplit(entry);
    } else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      for (const [key, entry] of Object.entries(record)) {
        if (
          options.network === 'mainnet' &&
          key === 'proposed_split' &&
          entry === null
        )
          delete record[key];
        else omitNullProposedSplit(entry);
      }
    }
  };
  omitNullProposedSplit(output);

  // `timestamp` is lossy in JSON.parse; restore it from the exact RPC string.
  const timestamp = output.block.header.timestamp_nanosec;
  output.block.header.timestamp = rawJsonNumber(timestamp);
  return Buffer.from(JSON.stringify(output));
}

/** Resolve real canonical ancestry; skipped numerical heights need no special case. */
async function ancestry(
  head: IndexerBlock['block'],
  stopHash: null | string,
  minimumHeight: number,
  limit: number,
): Promise<IndexerBlock['block'][]> {
  const blocks: IndexerBlock['block'][] = [];
  let current = head;
  while (
    current.header.hash !== stopHash &&
    current.header.height >= minimumHeight
  ) {
    if (stopping) throw new Error('indexer stopping');
    if (blocks.length >= limit)
      throw new ReanchorRequiredError(
        'indexer catch-up limit exceeded; re-anchoring at current finalized head',
      );
    blocks.push(current);
    if (
      current.header.height === 0 ||
      current.header.prev_hash === '11111111111111111111111111111111'
    )
      break;
    const previous = await rpc.block({ block_id: current.header.prev_hash });
    if (
      previous.header.hash !== current.header.prev_hash ||
      previous.header.height >= current.header.height
    ) {
      throw new Error('invalid canonical block ancestry');
    }
    current = previous;
  }
  if (stopHash && current.header.hash !== stopHash)
    throw new Error('finalized checkpoint is not an ancestor');
  return blocks.reverse();
}

async function cached(
  block: IndexerBlock['block'],
): Promise<IndexerBlock | null> {
  try {
    const value = parseJsonPreservingUnsafeIntegers<IndexerBlock>(
      await fs.readFile(
        blockHeightToPath(options.cacheDir, block.header.height, false),
        'utf8',
      ),
    );
    validateBlock(value, block, false);
    if (
      value.shards.some((s) =>
        s.receipt_execution_outcomes.some(
          (r) => typeof r.tx_hash !== 'string' || !r.tx_hash,
        ),
      )
    )
      return null;
    return value;
  } catch {
    return null;
  }
}

async function processBlock(
  block: IndexerBlock['block'],
  warmup: boolean,
): Promise<void> {
  const height = block.header.height;
  if (!warmup) send({ height, type: 'processing' });
  try {
    const replay = warmup ? await cached(block) : null;
    const message = replay ?? (await rpc.indexer(block));
    const delta = enrichBlock(message, map.pending, !!replay);
    if (!warmup && delta.missing.length) {
      throw new ReanchorRequiredError(
        `missing transaction origins for ${delta.missing.length} receipts at ${height}`,
      );
    }
    map.check(delta);
    const skipped =
      cursor && height > cursor.header.height + 1
        ? Array.from(
            { length: height - cursor.header.height - 1 },
            (_, index) => cursor!.header.height + index + 1,
          )
        : [];
    const now = Date.now();
    const pruned = pruneSkippedHeights(
      skippedHeights,
      now,
      options.cacheTtlSecs,
    );
    for (const skippedHeight of pruned)
      send({ height: skippedHeight, type: 'unskipped' });
    if (skipped.length) {
      for (const skippedHeight of skipped)
        skippedHeights.set(skippedHeight, now);
    }
    if (skipped.length || pruned.length > 0) {
      const skippedBytes = Buffer.from(
        JSON.stringify(
          [...skippedHeights]
            .sort(([left], [right]) => left - right)
            .map(([height, recordedAtMs]) => ({ height, recordedAtMs })),
        ),
      );
      await ensureFreeSpace(
        options.stateDir,
        options.minFreeBytes ?? 0,
        skippedBytes.length,
      );
      await durableWrite(skippedHeightsFile, skippedBytes, options.stateDir);
      for (const skippedHeight of skipped)
        send({ height: skippedHeight, type: 'skipped' });
    }
    if (!warmup) {
      const bytes = serializeBlock(message);
      await ensureFreeSpace(
        options.cacheDir,
        options.minFreeBytes ?? 0,
        bytes.length,
      );
      await ensureFreeSpace(options.stateDir, options.minFreeBytes ?? 0, 4096);
      // Publish a complete finalized file first. A crash before the checkpoint
      // replays this block; no pending map is persisted independently of replay.
      await durableWrite(
        blockHeightToPath(options.cacheDir, height, false),
        bytes,
        options.cacheDir,
      );
      const next: Checkpoint = {
        chainId,
        genesisHash,
        hash: block.header.hash,
        height,
        version: 1,
      };
      await durableWrite(checkpointFile, Buffer.from(JSON.stringify(next)));
      checkpoint = next;
      latestBytes = bytes;
    }
    map.commit(height, delta);
    cursor = block;
    if (!warmup)
      send({
        bytes: latestBytes,
        hash: block.header.hash,
        height,
        pending: map.pending.size,
        timestamp: block.header.timestamp_nanosec,
        type: 'published',
      });
  } catch (error) {
    if (!warmup) send({ height, type: 'failed' });
    throw error;
  }
}

async function initialize(forceReanchor = false): Promise<void> {
  if (forceReanchor) {
    checkpoint = null;
    cursor = null;
    latestBytes = null;
  }
  const status = await rpc.call<{ chain_id: string; genesis_hash: string }>(
    'status',
    [],
  );
  chainId = status.chain_id;
  genesisHash = status.genesis_hash;
  skippedHeights.clear();
  const persistedSkippedHeights = await readSkippedHeights(skippedHeightsFile);
  for (const [height, recordedAtMs] of persistedSkippedHeights) {
    skippedHeights.set(height, recordedAtMs);
  }
  const pruned = pruneSkippedHeights(
    skippedHeights,
    Date.now(),
    options.cacheTtlSecs,
  );
  for (const height of pruned) send({ height, type: 'unskipped' });
  if (persistedSkippedHeights.size) {
    const skippedBytes = Buffer.from(
      JSON.stringify(
        [...skippedHeights]
          .sort(([left], [right]) => left - right)
          .map(([height, recordedAtMs]) => ({ height, recordedAtMs })),
      ),
    );
    await ensureFreeSpace(
      options.stateDir,
      options.minFreeBytes ?? 0,
      skippedBytes.length,
    );
    await durableWrite(skippedHeightsFile, skippedBytes, options.stateDir);
  }
  for (const height of skippedHeights.keys()) {
    send({ height, type: 'skipped' });
  }
  if (chainId !== options.network || !genesisHash)
    throw new Error('node chain identity mismatch');
  checkpoint = forceReanchor ? null : await readCheckpoint(checkpointFile);
  if (
    checkpoint &&
    (checkpoint.chainId !== chainId || checkpoint.genesisHash !== genesisHash)
  ) {
    throw new Error('checkpoint belongs to a different chain');
  }
  const anchor = checkpoint
    ? await rpc.block({ block_id: checkpoint.height })
    : await rpc.block({ finality: 'final' });
  if (checkpoint && anchor.header.hash !== checkpoint.hash)
    throw new Error('finalized checkpoint hash mismatch');
  const blocks = await ancestry(
    anchor,
    null,
    Math.max(0, anchor.header.height - options.replayBlocks + 1),
    options.replayBlocks,
  );
  for (const block of blocks) await processBlock(block, true);
  // Warm-up does not publish a new head. Only recover a previously complete file.
  if (checkpoint) {
    const value = await cached(anchor);
    if (
      value &&
      value.shards.every((s) =>
        s.receipt_execution_outcomes.every((r) => !!r.tx_hash),
      )
    ) {
      latestBytes = serializeBlock(value);
      send({
        bytes: latestBytes,
        hash: checkpoint.hash,
        height: checkpoint.height,
        pending: map.pending.size,
        timestamp: anchor.header.timestamp_nanosec,
        type: 'published',
      });
    }
  }
  if (forceReanchor) await durableRemove(checkpointFile);
  initialized = true;
  if (forceReanchor) send({ height: anchor.header.height, type: 'reanchored' });
}

async function run(): Promise<void> {
  while (!stopping) {
    iterationStartedAt = Date.now();
    try {
      if (!initialized) {
        // A failed warm-up must start from empty state rather than a partial cursor.
        map.clear();
        await initialize(reanchorAtCurrentHead);
        reanchorAtCurrentHead = false;
      }
      const head = await rpc.block({ finality: 'final' });
      send({
        height: head.header.height,
        timestamp: head.header.timestamp_nanosec,
        type: 'head',
      });
      if (!cursor) throw new Error('indexer cursor unavailable');
      if (head.header.height < cursor.header.height)
        throw new Error('node finalized head is behind cursor');
      const blocks = await ancestry(
        head,
        cursor.header.hash,
        cursor.header.height,
        options.maxCatchupBlocks,
      );
      for (const block of blocks) {
        if (stopping) break;
        await processBlock(block, false);
      }
      send({ pending: map.pending.size, type: 'healthy' });
      consecutiveFailures = 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // A full receipt map cannot recover on the same block: start over from
      // the current head with an empty map, like other re-anchor cases.
      if (
        error instanceof ReanchorRequiredError ||
        error instanceof ReceiptMapFullError
      ) {
        initialized = false;
        reanchorAtCurrentHead = true;
      }
      consecutiveFailures++;
      send({
        error: message,
        type: 'error',
      });
    }
    if (!stopping) {
      const retryDelay = Math.min(
        options.intervalMs * 2 ** Math.min(consecutiveFailures, 5),
        30_000,
      );
      await sleep(retryDelay, consecutiveFailures === 0);
    }
  }
  parentPort!.close();
}

void run();
