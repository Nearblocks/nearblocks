import { logger } from 'nb-logger';

import { BlockFetchResult, BlockSource } from '#types/index.js';

import { BlockCache } from './cache.js';
import { MetricsService } from './metrics.js';
import { NeardataService } from './neardata.js';
import { S3Service } from './s3.js';

export class BlockFetcher {
  private cache: BlockCache;
  private inFlightRequests: Map<number, Promise<BlockFetchResult>>;
  private metrics: MetricsService;
  private neardata: NeardataService;
  private s3: S3Service;

  constructor(
    cache: BlockCache,
    s3: S3Service,
    neardata: NeardataService,
    metrics: MetricsService,
  ) {
    this.cache = cache;
    this.s3 = s3;
    this.neardata = neardata;
    this.inFlightRequests = new Map();
    this.metrics = metrics;

    logger.info('Block fetcher initialized');
  }

  private async fetchInternal(height: number): Promise<BlockFetchResult> {
    const startTime = Date.now();

    this.metrics.blockFetchTotal.inc();

    try {
      // 1. Try cache first
      const cached = this.cache.get(height);

      if (cached) {
        logger.info({ height, source: BlockSource.CACHE });
        this.metrics.blockFetchBySource.inc({ source: BlockSource.CACHE });
        this.metrics.blockFetchDuration
          .labels(BlockSource.CACHE)
          .observe((Date.now() - startTime) / 1000);

        return { block: cached, source: BlockSource.CACHE };
      }

      // 2. Try S3
      const fromS3 = await this.s3.fetchBlock(height);

      if (fromS3) {
        logger.info({ height, source: BlockSource.S3 });
        this.cache.set(height, fromS3);
        this.metrics.blockFetchBySource.inc({ source: BlockSource.S3 });
        this.metrics.blockFetchDuration
          .labels(BlockSource.S3)
          .observe((Date.now() - startTime) / 1000);

        return { block: fromS3, source: BlockSource.S3 };
      }

      // 3. Try neardata (fastnear)
      const fromNeardata = await this.neardata.fetchBlock(height);

      if (fromNeardata) {
        logger.info({ height, source: BlockSource.NEARDATA });
        this.cache.set(height, fromNeardata);
        this.metrics.blockFetchBySource.inc({ source: BlockSource.NEARDATA });
        this.metrics.blockFetchDuration
          .labels(BlockSource.NEARDATA)
          .observe((Date.now() - startTime) / 1000);

        return { block: fromNeardata, source: BlockSource.NEARDATA };
      }

      // All sources failed
      this.metrics.blockFetchErrors.inc({ source: 'all' });

      throw new Error(`Failed to fetch block ${height} from all sources`);
    } finally {
      this.metrics.cacheSize.set(this.cache.size());
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  async fetch(height: number): Promise<BlockFetchResult> {
    // Deduplicate concurrent requests for the same block
    if (this.inFlightRequests.has(height)) {
      logger.info({ height, message: 'Deduplicating concurrent request' });

      return this.inFlightRequests.get(height)!;
    }

    const promise = this.fetchInternal(height);

    this.inFlightRequests.set(height, promise);

    try {
      return await promise;
    } finally {
      this.inFlightRequests.delete(height);
    }
  }

  getCacheSize(): number {
    return this.cache.size();
  }
}
