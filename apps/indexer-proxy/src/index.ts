import * as Sentry from '@sentry/node';

import { logger } from 'nb-logger';

import { config } from '#config.js';
import { BlockCache } from '#services/cache.js';
import { BlockFetcher } from '#services/fetcher.js';
import { MetricsService } from '#services/metrics.js';
import { NeardataService } from '#services/neardata.js';
import { S3Service } from '#services/s3.js';
import { ProxyServer } from '#services/server.js';
import { UploadQueue } from '#services/uploadQueue.js';

// Initialize Sentry for error tracking
if (config.SENTRY_DSN) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NETWORK,
    tracesSampleRate: 0.1,
  });

  logger.info('Sentry initialized');
}

const main = async () => {
  try {
    logger.info({
      message: 'Starting indexer-proxy',
      network: config.NETWORK,
      port: config.PORT,
    });

    // Initialize services
    const metrics = new MetricsService();
    const cache = new BlockCache();
    const s3 = new S3Service();
    const neardata = new NeardataService();
    const uploadQueue = new UploadQueue(s3, metrics);
    const fetcher = new BlockFetcher(cache, s3, neardata, metrics);
    const server = new ProxyServer(fetcher, uploadQueue, metrics);

    // Start server
    server.start();

    logger.info('Indexer-proxy started successfully');
  } catch (error) {
    logger.error({ error, message: 'Failed to start indexer-proxy' });
    Sentry.captureException(error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error({ error, message: 'Uncaught exception' });
  Sentry.captureException(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ message: 'Unhandled rejection', promise, reason });
  Sentry.captureException(reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

void main();
