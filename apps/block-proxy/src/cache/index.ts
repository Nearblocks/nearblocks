import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { logger } from 'nb-logger';

import type { Config } from '#config';
import * as metrics from '#metrics';
import type { StatsCollector } from '#stats';

import { blockHeightToPath } from './path.js';

/**
 * Every filesystem call in this process shares one libuv worker pool, four
 * wide by default, and none of them can be cancelled. A volume that stops
 * responding parks a worker per call, permanently. Reads, background writes
 * and the eviction sweep all draw on that pool, so a hung mount drains it
 * within seconds and stops all file and DNS work process-wide — taking the
 * proxy down entirely, not just the cache.
 *
 * So watch for calls that never finish and, after a few, stop touching the
 * disk. The proxy then serves from upstream: slower, but serving.
 *
 * Suspension is temporary, because upstream is billed per query and the cache
 * carries most of the load during catch-up. A single read is let through after
 * a backoff to see whether the volume recovered. Each probe that stalls costs
 * another worker for good, so the total is capped: past that the cache stays
 * off and only a restart brings it back.
 */
const OP_TIMEOUT_MS = 5_000;
const TIMEOUTS_BEFORE_SUSPEND = 3;
const RETRY_BASE_MS = 60_000;
const RETRY_MAX_MS = 900_000;

/** Workers we are willing to lose proving the volume is broken. */
const MAX_ABANDONED_OPS = 4;

export class CacheStore {
  private abandoned = 0;
  private cacheDir: string;
  private cacheTtlMs: number;
  private compression: boolean;
  private disabled = false;
  private evicting = false;
  private probing = false;
  private retryAt = 0;
  private retryDelayMs = RETRY_BASE_MS;
  private timeouts = 0;

  constructor(config: Config) {
    this.cacheDir = config.cacheDir;
    this.cacheTtlMs = config.cacheTtlSecs * 1000;
    this.compression = config.cacheCompression;
  }

  /** Whether a disk call may be made, including a lone probe while suspended. */
  private canUseDisk(): boolean {
    if (!this.disabled) return true;
    if (this.probing || this.abandoned >= MAX_ABANDONED_OPS) return false;
    if (Date.now() < this.retryAt) return false;

    this.probing = true;

    return true;
  }

  private resume(): void {
    this.disabled = false;
    this.timeouts = 0;
    this.retryDelayMs = RETRY_BASE_MS;
    metrics.cacheDisabled.set(0);
    logger.warn({ abandoned_ops: this.abandoned }, 'cache resumed');
  }

  private suspend(): void {
    this.disabled = true;
    this.retryAt = Date.now() + this.retryDelayMs;
    metrics.cacheDisabled.set(1);

    const permanent = this.abandoned >= MAX_ABANDONED_OPS;

    logger.error(
      {
        abandoned_ops: this.abandoned,
        retry_in_ms: permanent ? null : this.retryDelayMs,
      },
      permanent
        ? 'cache off until restart: too many stalled operations; upstream cost will rise'
        : 'cache suspended after stalled operations; upstream cost will rise until it recovers',
    );

    this.retryDelayMs = Math.min(this.retryDelayMs * 2, RETRY_MAX_MS);
  }

  private async sweep(stats: StatsCollector): Promise<void> {
    const start = Date.now();
    let scanned = 0;
    let evicted = 0;

    const evictRecursive = async (dir: string): Promise<void> => {
      let entries: fs.Dirent[];
      try {
        entries = await fsp.readdir(dir, { withFileTypes: true });
      } catch (err) {
        logger.warn(
          { dir, error: String(err) },
          'failed to read cache directory during eviction',
        );
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await evictRecursive(fullPath);
          continue;
        }

        const filename = entry.name;
        if (!filename.endsWith('.json.zst') && !filename.endsWith('.json')) {
          continue;
        }

        scanned++;

        let stat: fs.Stats;
        try {
          stat = await fsp.stat(fullPath);
        } catch {
          continue;
        }

        const ageMs = Date.now() - stat.mtimeMs;
        if (ageMs > this.cacheTtlMs) {
          try {
            await fsp.unlink(fullPath);
            evicted++;
            logger.debug(
              { age_secs: Math.floor(ageMs / 1000), path: fullPath },
              'evicted cached block',
            );
          } catch (err) {
            logger.warn(
              { error: String(err), path: fullPath },
              'failed to evict cache file',
            );
          }
        }
      }
    };

    try {
      await evictRecursive(this.cacheDir);
    } catch (err) {
      logger.warn({ error: String(err) }, 'cache eviction failed');
    }

    if (evicted > 0) {
      metrics.cacheEvictions.inc(evicted);
      stats.cacheEvictions += evicted;
    }

    logger.info(
      { elapsed_ms: Date.now() - start, evicted, scanned },
      'cache eviction complete',
    );
  }

  /**
   * Abandon an operation that overruns, and count it. The call itself keeps
   * running and keeps its worker — that is exactly why they must be counted
   * rather than merely timed out.
   */
  private async withTimeout<T>(op: Promise<T>, what: string): Promise<T> {
    // We stop waiting, so claim any later rejection: index.ts exits on an
    // unhandled one.
    op.catch(() => {});

    let timedOut = false;
    let timer: NodeJS.Timeout | undefined;

    const expiry = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        timedOut = true;
        reject(new Error(`cache ${what} did not finish in ${OP_TIMEOUT_MS}ms`));
      }, OP_TIMEOUT_MS);
    });

    try {
      return await Promise.race([op, expiry]);
    } finally {
      clearTimeout(timer);

      this.probing = false;

      if (timedOut) {
        this.abandoned += 1;
        this.timeouts += 1;
        metrics.cacheTimeouts.inc();

        if (this.timeouts >= TIMEOUTS_BEFORE_SUSPEND) this.suspend();
      } else {
        // The volume answered, even if with an error.
        this.timeouts = 0;

        if (this.disabled) this.resume();
      }
    }
  }

  /**
   * Create the cache directory at startup.
   */
  ensureDir(): void {
    fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  async read(height: number): Promise<Buffer | null> {
    // Reads are the cheapest call, so they carry the recovery probe. Writes
    // and sweeps stay off until a probe succeeds.
    if (!this.canUseDisk()) return null;

    const filePath = blockHeightToPath(this.cacheDir, height, this.compression);

    try {
      const data = await this.withTimeout(fsp.readFile(filePath), 'read');
      logger.debug({ bytes: data.length, height }, 'cache hit');
      return data;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.debug({ height }, 'cache miss');
        return null;
      }
      throw err;
    }
  }

  async runEviction(stats: StatsCollector): Promise<void> {
    // A sweep touches every cached file, so a hung one must never overlap with
    // the next: that would multiply the workers lost rather than cost one.
    if (this.disabled || this.evicting) return;

    this.evicting = true;

    try {
      await this.sweep(stats);
    } finally {
      // Left set only if the sweep never returns, which is the point: one
      // stuck worker, not one per minute.
      this.evicting = false;
    }
  }

  /**
   * Start the background eviction loop (every 60s).
   */
  startEvictionLoop(stats: StatsCollector): ReturnType<typeof setInterval> {
    return setInterval(() => {
      this.runEviction(stats).catch((err) => {
        logger.warn({ error: String(err) }, 'eviction loop error');
      });
    }, 60_000);
  }

  async write(height: number, jsonBytes: Buffer): Promise<void> {
    // Validate JSON structure and height match
    let parsed: { block?: { header?: { height?: number } } };
    try {
      parsed = JSON.parse(jsonBytes.toString('utf8'));
    } catch (err) {
      throw new Error(
        `cache write rejected for height ${height}: invalid block JSON: ${err}`,
      );
    }

    if (parsed?.block?.header?.height !== height) {
      throw new Error(
        `cache write rejected: requested height ${height} but block contains height ${parsed?.block?.header?.height}`,
      );
    }

    const filePath = blockHeightToPath(this.cacheDir, height, this.compression);
    const dir = path.dirname(filePath);
    await fsp.mkdir(dir, { recursive: true });

    // Atomic write: temp file in same directory, then rename
    const tmpPath = path.join(
      dir,
      `.tmp-block-${process.pid}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
    );

    try {
      await fsp.writeFile(tmpPath, new Uint8Array(jsonBytes));
      await fsp.rename(tmpPath, filePath);
      logger.debug({ bytes: jsonBytes.length, height }, 'cache write complete');
    } catch (err) {
      // Clean up temp file on failure
      try {
        await fsp.unlink(tmpPath);
      } catch {
        // ignore cleanup errors
      }
      throw err;
    }
  }

  writeBackground(height: number, jsonBytes: Buffer): void {
    if (this.disabled) return;

    // Three filesystem calls per block, fire-and-forget: the heaviest draw on
    // the pool, and the one nothing would otherwise notice stalling.
    this.withTimeout(this.write(height, jsonBytes), 'write').catch((err) => {
      logger.warn(
        { error: String(err), height },
        'background cache write failed',
      );
    });
  }

  get isDisabled(): boolean {
    return this.disabled;
  }
}

export { blockHeightToPath } from './path.js';
