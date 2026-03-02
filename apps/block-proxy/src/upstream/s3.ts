import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { logger } from 'nb-logger';

import type { Config } from '#config';
import { snakeCaseKeys } from '#utils';

export class S3Upstream {
  private bucket: string;
  private client: S3Client;
  private timeoutMs: number;

  constructor(config: Config) {
    this.bucket = config.s3Bucket;
    this.timeoutMs = config.upstreamTimeoutMs;

    this.client = new S3Client({
      credentials: {
        accessKeyId: config.s3AccessKey,
        secretAccessKey: config.s3SecretKey,
      },
      endpoint: config.s3Endpoint,
      forcePathStyle: true,
      region: config.s3Region,
    });
  }

  static create(config: Config): null | S3Upstream {
    if (
      !config.s3Endpoint ||
      !config.s3Bucket ||
      !config.s3AccessKey ||
      !config.s3SecretKey
    ) {
      return null;
    }
    return new S3Upstream(config);
  }

  private async getObject(
    key: string,
    height: number,
    abortSignal?: AbortSignal,
  ): Promise<Buffer> {
    let output;
    try {
      output = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        abortSignal ? { abortSignal } : undefined,
      );
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === 'NoSuchKey') {
        const notFoundErr = new Error(
          `block ${height} not found in S3`,
        ) as Error & { notFound: boolean };
        notFoundErr.notFound = true;
        throw notFoundErr;
      }
      throw new Error(`S3 get_object failed for key ${key}: ${err}`);
    }

    if (!output.Body) {
      throw new Error(`S3 empty body for key ${key}`);
    }

    const bytes = await output.Body.transformToByteArray();
    if (bytes.length > 100 * 1024 * 1024) {
      throw new Error(
        `S3 response too large for block ${height}: ${bytes.length} bytes`,
      );
    }

    return Buffer.from(bytes);
  }

  async fetch(height: number): Promise<Buffer> {
    const key = `${height}.json`;
    const start = Date.now();
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), this.timeoutMs);

    let result: Buffer;
    try {
      result = await this.getObject(key, height, abort.signal);
    } catch (err) {
      clearTimeout(timer);
      if (abort.signal.aborted) {
        throw new Error(
          `S3 fetch timed out for block ${height} after ${this.timeoutMs}ms`,
        );
      }
      throw err;
    }
    clearTimeout(timer);

    // S3 stores camelCase JSON (uploaded by indexer-base); normalize to snake_case
    const parsed = JSON.parse(result.toString('utf8'));
    const normalized = Buffer.from(JSON.stringify(snakeCaseKeys(parsed)));

    const elapsed = Date.now() - start;
    logger.debug(
      { bytes: normalized.length, height, latency_ms: elapsed },
      'S3 upstream fetch complete',
    );

    return normalized;
  }
}
