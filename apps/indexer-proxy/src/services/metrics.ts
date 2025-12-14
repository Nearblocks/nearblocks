import { Counter, Gauge, Histogram, Registry } from 'prom-client';

import { logger } from 'nb-logger';

import { config } from '#config.js';

export class MetricsService {
  public blockFetchBySource: Counter;

  public blockFetchDuration: Histogram;
  public blockFetchErrors: Counter;
  // Block fetch metrics
  public blockFetchTotal: Counter;
  public cacheHitRate: Gauge;

  // Cache metrics
  public cacheSize: Gauge;
  public registry: Registry;

  public s3UploadDuration: Histogram;
  public s3UploadFailure: Counter;
  // S3 upload metrics
  public s3UploadQueueSize: Gauge;
  public s3UploadRetries: Counter;
  public s3UploadSuccess: Counter;

  constructor() {
    this.registry = new Registry();

    // Block fetch metrics
    this.blockFetchTotal = new Counter({
      help: 'Total number of block fetch requests',
      name: 'proxy_block_fetch_total',
      registers: [this.registry],
    });

    this.blockFetchDuration = new Histogram({
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      help: 'Block fetch duration in seconds',
      labelNames: ['source'],
      name: 'proxy_block_fetch_duration_seconds',
      registers: [this.registry],
    });

    this.blockFetchBySource = new Counter({
      help: 'Block fetches by source',
      labelNames: ['source'],
      name: 'proxy_block_fetch_by_source_total',
      registers: [this.registry],
    });

    this.blockFetchErrors = new Counter({
      help: 'Block fetch errors',
      labelNames: ['source'],
      name: 'proxy_block_fetch_errors_total',
      registers: [this.registry],
    });

    // Cache metrics
    this.cacheSize = new Gauge({
      help: 'Current cache size in blocks',
      name: 'proxy_cache_size',
      registers: [this.registry],
    });

    this.cacheHitRate = new Gauge({
      help: 'Cache hit rate (0-1)',
      name: 'proxy_cache_hit_rate',
      registers: [this.registry],
    });

    // S3 upload metrics
    this.s3UploadQueueSize = new Gauge({
      help: 'S3 upload queue size',
      name: 'proxy_s3_upload_queue_size',
      registers: [this.registry],
    });

    this.s3UploadSuccess = new Counter({
      help: 'Successful S3 uploads',
      name: 'proxy_s3_upload_success_total',
      registers: [this.registry],
    });

    this.s3UploadFailure = new Counter({
      help: 'Failed S3 uploads',
      name: 'proxy_s3_upload_failure_total',
      registers: [this.registry],
    });

    this.s3UploadDuration = new Histogram({
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      help: 'S3 upload duration in seconds',
      name: 'proxy_s3_upload_duration_seconds',
      registers: [this.registry],
    });

    this.s3UploadRetries = new Counter({
      help: 'S3 upload retries',
      name: 'proxy_s3_upload_retries_total',
      registers: [this.registry],
    });

    // Set default labels
    this.registry.setDefaultLabels({
      network: config.NETWORK,
    });

    logger.info('Metrics service initialized');
  }

  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}
