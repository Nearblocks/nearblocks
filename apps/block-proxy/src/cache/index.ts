import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { logger } from 'nb-logger';

import type { Config } from '#config';
import * as metrics from '#metrics';
import type { StatsCollector } from '#stats';

import { blockHeightToPath } from './path.js';

export class CacheStore {
  private cacheDir: string;
  private cacheTtlMs: number;
  private compression: boolean;

  constructor(config: Config) {
    this.cacheDir = config.cacheDir;
    this.cacheTtlMs = config.cacheTtlSecs * 1000;
    this.compression = config.cacheCompression;
  }

  /**
   * Create the cache directory at startup.
   */
  ensureDir(): void {
    fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  async read(height: number): Promise<Buffer | null> {
    const filePath = blockHeightToPath(this.cacheDir, height, this.compression);

    try {
      const data = await fsp.readFile(filePath);
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
      await fsp.writeFile(tmpPath, jsonBytes);
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
    this.write(height, jsonBytes).catch((err) => {
      logger.warn(
        { error: String(err), height },
        'background cache write failed',
      );
    });
  }
}

export { blockHeightToPath } from './path.js';
