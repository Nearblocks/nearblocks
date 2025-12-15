import express, { Request, Response } from 'express';

import { logger } from 'nb-logger';

import { config } from '#config.js';

import { BlockFetcher } from './fetcher.js';
import { MetricsService } from './metrics.js';
import { UploadQueue } from './uploadQueue.js';

export class ProxyServer {
  private app: express.Application;
  private fetcher: BlockFetcher;
  private metrics: MetricsService;
  private uploadQueue: UploadQueue;

  constructor(
    fetcher: BlockFetcher,
    uploadQueue: UploadQueue,
    metrics: MetricsService,
  ) {
    this.app = express();
    this.fetcher = fetcher;
    this.uploadQueue = uploadQueue;
    this.metrics = metrics;

    this.setupMiddleware();
    this.setupRoutes();

    logger.info('Proxy server initialized');
  }

  private setupMiddleware(): void {
    this.app.use(express.json());

    // Request logging
    this.app.use((req, _res, next) => {
      logger.info({
        method: req.method,
        path: req.path,
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        cacheSize: this.fetcher.getCacheSize(),
        queueSize: this.uploadQueue.getQueueSize(),
        status: 'ok',
        uploadedCount: this.uploadQueue.getUploadedCount(),
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', async (_req: Request, res: Response) => {
      try {
        res.set('Content-Type', this.metrics.registry.contentType);
        res.end(await this.metrics.getMetrics());
      } catch (error) {
        logger.error({ error, message: 'Error fetching metrics' });

        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });

    // Fetch single block
    this.app.get('/block/:height', async (req: Request, res: Response) => {
      try {
        const height = parseInt(req.params.height, 10);

        if (isNaN(height) || height < 0) {
          res.status(400).json({ error: 'Invalid block height' });

          return;
        }

        const result = await this.fetcher.fetch(height);

        // If block came from neardata or lake, queue it for S3 upload
        if (result.source === 'neardata' || result.source === 'near_lake') {
          this.uploadQueue.enqueue(height, result.block);
        }

        res.json({
          block: result.block,
          source: result.source,
        });
      } catch (error) {
        const height = parseInt(req.params.height, 10);

        logger.error({ error, height, message: 'Error fetching block' });

        if (
          error instanceof Error &&
          error.message.includes('Failed to fetch block')
        ) {
          res.status(404).json({ error: `Block ${height} not found` });
        } else if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Unknown error' });
        }
      }
    });

    // Batch fetch blocks
    this.app.post('/blocks', async (req: Request, res: Response) => {
      try {
        const { heights } = req.body as { heights: number[] };

        if (!Array.isArray(heights) || heights.length === 0) {
          res.status(400).json({ error: 'Invalid heights array' });

          return;
        }

        if (heights.length > 100) {
          res.status(400).json({ error: 'Maximum 100 blocks per request' });

          return;
        }

        // Validate each height
        const MAX_BLOCK_HEIGHT = 10_000_000_000;
        const invalidHeight = heights.find(
          (h) =>
            typeof h !== 'number' ||
            !Number.isInteger(h) ||
            h <= 0 ||
            h > MAX_BLOCK_HEIGHT,
        );

        if (invalidHeight !== undefined) {
          res.status(400).json({
            error: `Invalid block height: ${invalidHeight}`,
          });

          return;
        }

        const results = await Promise.all(
          heights.map(async (height) => {
            try {
              const result = await this.fetcher.fetch(height);

              // Queue for S3 upload if needed
              if (
                result.source === 'neardata' ||
                result.source === 'near_lake'
              ) {
                this.uploadQueue.enqueue(height, result.block);
              }

              return {
                block: result.block,
                error: null,
                height,
                source: result.source,
              };
            } catch (error) {
              return {
                block: null,
                error: error instanceof Error ? error.message : 'Unknown error',
                height,
                source: null,
              };
            }
          }),
        );

        res.json({ blocks: results });
      } catch (error) {
        logger.error({ error, message: 'Error fetching blocks' });

        if (error instanceof Error) {
          res.status(500).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Unknown error' });
        }
      }
    });

    // Clear cache (for debugging)
    this.app.post('/cache/clear', (_req: Request, res: Response) => {
      this.fetcher.clearCache();
      res.json({ message: 'Cache cleared' });
    });
  }

  start(): void {
    this.app.listen(config.PORT, () => {
      logger.info({ message: 'Proxy server started', port: config.PORT });
    });
  }
}
