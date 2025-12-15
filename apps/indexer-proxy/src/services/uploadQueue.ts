import { logger } from 'nb-logger';

import { config } from '#config.js';
import { Message, UploadTask } from '#types/index.js';

import { MetricsService } from './metrics.js';
import { S3Service } from './s3.js';

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 60000;
const MAX_UPLOADED_BLOCKS_TRACKING = 10000;
const UPLOADED_BLOCKS_TRIM_SIZE = 5000;

export class UploadQueue {
  private metrics: MetricsService;
  private processing: boolean;
  private queue: UploadTask[];
  private s3: S3Service;
  private uploadedBlocks: Set<number>;

  constructor(s3: S3Service, metrics: MetricsService) {
    this.s3 = s3;
    this.queue = [];
    this.processing = false;
    this.uploadedBlocks = new Set();
    this.metrics = metrics;

    logger.info('Upload queue initialized');
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();

      // Sort by nextRetry time and height
      this.queue.sort((a, b) => {
        if (a.nextRetry !== b.nextRetry) {
          return a.nextRetry - b.nextRetry;
        }

        return a.height - b.height;
      });

      // Get tasks ready to process
      const readyTasks = this.queue.filter((task) => task.nextRetry <= now);

      if (readyTasks.length === 0) {
        // Wait for the next retry time
        const nextRetry = Math.min(...this.queue.map((t) => t.nextRetry));
        const waitTime = Math.min(nextRetry - now, 5000);

        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // Process in batches
      const batch = readyTasks.slice(0, config.S3_UPLOAD_BATCH_SIZE);

      await Promise.all(
        batch.map(async (task) => {
          const startTime = Date.now();
          const success = await this.s3.uploadBlock(task.height, task.block);

          this.metrics.s3UploadDuration.observe(
            (Date.now() - startTime) / 1000,
          );

          if (success) {
            // Remove from queue and mark as uploaded
            this.queue = this.queue.filter((t) => t.height !== task.height);
            this.uploadedBlocks.add(task.height);
            this.metrics.s3UploadSuccess.inc();
            this.metrics.s3UploadQueueSize.set(this.queue.length);

            // Prevent set from growing indefinitely
            if (this.uploadedBlocks.size > MAX_UPLOADED_BLOCKS_TRACKING) {
              const sortedHeights = Array.from(this.uploadedBlocks).sort(
                (a, b) => a - b,
              );
              const toRemove = sortedHeights.slice(0, UPLOADED_BLOCKS_TRIM_SIZE);

              toRemove.forEach((h) => this.uploadedBlocks.delete(h));
            }
          } else {
            // Retry with exponential backoff
            task.attempts++;

            if (task.attempts >= config.S3_UPLOAD_MAX_RETRIES) {
              logger.error({
                height: task.height,
                message: 'Max retries exceeded, dropping task',
              });
              this.queue = this.queue.filter((t) => t.height !== task.height);
              this.metrics.s3UploadFailure.inc();
              this.metrics.s3UploadQueueSize.set(this.queue.length);
            } else {
              const delay = Math.min(
                INITIAL_RETRY_DELAY_MS * Math.pow(2, task.attempts - 1),
                MAX_RETRY_DELAY_MS,
              );

              task.nextRetry = Date.now() + delay;
              this.metrics.s3UploadRetries.inc();

              logger.warn({
                attempts: task.attempts,
                delay,
                height: task.height,
                message: 'Retrying S3 upload',
              });
            }
          }
        }),
      );
    }

    this.processing = false;
  }

  enqueue(height: number, block: Message): void {
    // Don't queue if S3 uploads are disabled
    if (!config.ENABLE_S3_UPLOAD) {
      return;
    }

    // Don't queue if already uploaded
    if (this.uploadedBlocks.has(height)) {
      return;
    }

    // Don't queue duplicates
    if (this.queue.some((task) => task.height === height)) {
      return;
    }

    this.queue.push({
      attempts: 0,
      block,
      height,
      nextRetry: Date.now(),
    });

    logger.info({
      height,
      message: 'Enqueued block for S3 upload',
      queueSize: this.queue.length,
    });
    this.metrics.s3UploadQueueSize.set(this.queue.length);

    // Start processing if not already running
    if (!this.processing) {
      void this.processQueue();
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getUploadedCount(): number {
    return this.uploadedBlocks.size;
  }
}
