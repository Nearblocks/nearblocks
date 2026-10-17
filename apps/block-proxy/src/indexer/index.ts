import { Worker } from 'node:worker_threads';

import { logger } from 'nb-logger';

import type { Config } from '#config';
import * as metrics from '#metrics';

/** Heights past the last published block that are worth waiting for. */
export const MAX_WAIT_AHEAD_BLOCKS = 3;

export interface LocalBlockResult {
  bytes: Buffer;
  source: string;
}

interface InFlight {
  promise: Promise<LocalBlockResult | null>;
  resolve: (result: LocalBlockResult | null) => void;
}

export class LocalIndexer {
  readonly status = {
    error: null as null | string,
    head: 0,
    pending: 0,
    published: 0,
  };

  private headTimestampMs = 0;
  private headUpdatedAt = 0;
  private healthy = false;
  private inFlight = new Map<number, InFlight>();
  private lastBlock: { bytes: Buffer; timestampMs: number } | null = null;
  private skippedHeights = new Set<number>();
  private stopping = false;
  private waiting = new Map<
    number,
    Set<(result: LocalBlockResult | null) => void>
  >();
  private worker: Worker;
  private workerErrorReported = false;

  constructor(private readonly config: Config) {
    this.worker = new Worker(new URL('./worker.js', import.meta.url), {
      resourceLimits: { maxOldGenerationSizeMb: config.indexerWorkerMemoryMb },
      workerData: {
        cacheDir: config.cacheDir,
        cacheTtlSecs: config.cacheTtlSecs,
        intervalMs: config.indexerIntervalMs,
        maxCatchupBlocks: config.indexerMaxCatchupBlocks,
        maxPendingReceipts: config.indexerMaxPendingReceipts,
        minFreeBytes: config.cacheMinFreeBytes,
        network: config.network,
        replayBlocks: config.indexerReplayBlocks,
        rpcUrl: config.nodeRpcUrl,
        stateDir: config.indexerStateDir,
        timeoutMs: config.upstreamTimeoutMs,
      },
    });
    this.worker.on('message', (message) => {
      switch (message.type) {
        case 'processing': {
          // A retry of the same height keeps the existing entry, so requests
          // already waiting on it are resolved by the eventual outcome.
          if (this.inFlight.has(message.height)) break;
          let resolve!: InFlight['resolve'];
          const promise = new Promise<LocalBlockResult | null>((done) => {
            resolve = done;
          });
          this.inFlight.set(message.height, { promise, resolve });
          break;
        }
        case 'published': {
          const bytes = Buffer.from(message.bytes);
          this.lastBlock = {
            bytes,
            timestampMs: Number(BigInt(message.timestamp) / 1_000_000n),
          };
          this.status.published = message.height;
          this.status.pending = message.pending;
          metrics.indexerPublished.set(message.height);
          metrics.indexerPublishedTimestamp.set(
            this.lastBlock.timestampMs / 1000,
          );
          metrics.indexerPending.set(message.pending);
          this.inFlight.get(message.height)?.resolve({ bytes, source: 'node' });
          this.inFlight.delete(message.height);
          this.resolveWaiting(message.height, { bytes, source: 'node' });
          break;
        }
        case 'reanchored':
          this.lastBlock = null;
          this.status.published = 0;
          this.resolveAllWaiting(null);
          break;
        case 'skipped':
          this.skippedHeights.add(message.height);
          this.resolveWaiting(message.height, {
            bytes: Buffer.from('null'),
            source: 'node',
          });
          break;
        case 'unskipped':
          this.skippedHeights.delete(message.height);
          break;
        case 'failed':
          this.inFlight.get(message.height)?.resolve(null);
          this.inFlight.delete(message.height);
          this.resolveWaiting(message.height, null);
          break;
        case 'head':
          this.status.head = message.height;
          this.headUpdatedAt = Date.now();
          this.headTimestampMs = Number(BigInt(message.timestamp) / 1_000_000n);
          for (const height of this.waiting.keys())
            if (height > message.height) this.resolveWaiting(height, null);
          metrics.indexerHead.set(message.height);
          metrics.indexerHeadTimestamp.set(
            Number(BigInt(message.timestamp) / 1_000_000_000n),
          );
          metrics.indexerHeadAge.set(
            Math.max(
              0,
              Date.now() / 1000 -
                Number(BigInt(message.timestamp) / 1_000_000_000n),
            ),
          );
          this.updateSyncMetric();
          break;
        case 'healthy':
          this.healthy = true;
          this.status.error = null;
          this.status.pending = message.pending;
          metrics.indexerPending.set(message.pending);
          metrics.indexerHealthy.set(1);
          this.updateSyncMetric();
          break;
        case 'error':
          this.fail(message.error);
          break;
      }
    });
    this.worker.on('error', (error) => {
      this.workerErrorReported = true;
      this.fail(error.message);
    });
    this.worker.on('exit', (code) => {
      if (!this.workerErrorReported)
        this.fail(`indexer worker exited (${code})`);
      for (const entry of this.inFlight.values()) entry.resolve(null);
      this.inFlight.clear();
      this.resolveAllWaiting(null);
      if (!this.stopping && this.config.exitOnWorkerFailure) {
        logger.fatal(
          { code },
          'indexer worker exited; stopping proxy for orchestrator restart',
        );
        process.exit(1);
      }
    });
  }

  /**
   * Highest height this indexer has published. The node head can run ahead of
   * it while catching up, and those heights cannot be served yet. Still gated
   * on {@link isInSync}.
   */
  currentFinalizedHeight(): null | number {
    if (!this.status.published || !this.isInSync()) return null;
    // The node can be current while the follower still works through a
    // backlog (after a restart or re-anchor). Its published height is then a
    // stale head: report none so a multi-source proxy uses the next source.
    if (
      !this.lastBlock ||
      Date.now() - this.lastBlock.timestampMs >
        this.config.nodeMaxLagSecs * 1000
    )
      return null;
    return this.status.published;
  }

  finalBlock(): Buffer | null {
    if (
      !this.healthy ||
      !this.lastBlock ||
      Date.now() - this.lastBlock.timestampMs >
        this.config.indexerMaxHeadAgeSecs * 1000
    )
      return null;
    return this.lastBlock.bytes;
  }

  /**
   * Whether the node can be trusted for fresh data: the follower is healthy, a
   * head poll arrived recently, and that head block is no older than
   * `nodeMaxLagSecs`. A node that answers polls but trails the chain is not in
   * sync.
   */
  isInSync(): boolean {
    if (
      !this.healthy ||
      Date.now() - this.headUpdatedAt > this.config.indexerMaxHeadAgeSecs * 1000
    )
      return false;
    const lag = this.lagSecs();
    return lag !== null && lag <= this.config.nodeMaxLagSecs;
  }

  /**
   * Whether the node itself is current, regardless of the follower's health:
   * the last head it reported is no older than `nodeMaxLagSecs`. If polls stop,
   * the lag keeps growing, so this turns false on its own. Used for `/rpc`,
   * which serves the node's state, not the follower's.
   */
  isNodeCurrent(): boolean {
    const lag = this.lagSecs();
    return lag !== null && lag <= this.config.nodeMaxLagSecs;
  }

  isSkippedHeight(height: number): boolean {
    return this.skippedHeights.has(height);
  }

  /** Age in seconds of the node's last observed finalized head block. */
  lagSecs(): null | number {
    if (!this.headTimestampMs) return null;
    return Math.max(0, (Date.now() - this.headTimestampMs) / 1000);
  }

  async stop(): Promise<void> {
    this.stopping = true;
    this.worker.postMessage('stop');
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        void this.worker.terminate().then(() => resolve());
      }, 10_000);
      this.worker.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  async waitForBlock(height: number): Promise<LocalBlockResult | null> {
    if (height <= this.status.published) return null;
    // Nothing new will be published while the node is behind or unhealthy.
    if (!this.isInSync()) return null;
    const entry = this.inFlight.get(height);
    if (entry) return this.waitWithTimeout(entry.promise);
    // While catching up, heights further ahead are better served by the next
    // source now than after a wait per block.
    if (height > this.status.published + MAX_WAIT_AHEAD_BLOCKS) return null;
    let resolve!: (result: LocalBlockResult | null) => void;
    const promise = new Promise<LocalBlockResult | null>((done) => {
      resolve = done;
    });
    const waiters = this.waiting.get(height) ?? new Set();
    waiters.add(resolve);
    this.waiting.set(height, waiters);
    this.worker.postMessage('poll');
    try {
      return await this.waitWithTimeout(promise);
    } finally {
      const pending = this.waiting.get(height);
      pending?.delete(resolve);
      if (pending?.size === 0) this.waiting.delete(height);
    }
  }

  private fail(error: string): void {
    this.healthy = false;
    this.status.error = error;
    metrics.indexerHealthy.set(0);
    metrics.indexerErrors.inc();
    this.updateSyncMetric();
    this.resolveAllWaiting(null);
    logger.warn(
      { error },
      'local indexer degraded; remote fallback remains available',
    );
  }

  private resolveAllWaiting(result: LocalBlockResult | null): void {
    for (const height of this.waiting.keys())
      this.resolveWaiting(height, result);
  }

  private resolveWaiting(
    height: number,
    result: LocalBlockResult | null,
  ): void {
    const waiters = this.waiting.get(height);
    if (!waiters) return;
    this.waiting.delete(height);
    for (const resolve of waiters) resolve(result);
  }

  private updateSyncMetric(): void {
    metrics.nodeInSync.set(this.isInSync() ? 1 : 0);
  }

  private waitWithTimeout(
    promise: Promise<LocalBlockResult | null>,
  ): Promise<LocalBlockResult | null> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), this.config.indexerWaitMs);
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }
}
