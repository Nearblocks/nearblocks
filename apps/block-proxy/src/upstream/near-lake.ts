import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { logger } from 'nb-logger';

import type { Config } from '#config';

export class NearLakeUpstream {
  private bucket: string;
  private client: S3Client;
  private timeoutMs: number;

  constructor(config: Config) {
    this.bucket = config.nearLakeBucket;
    this.timeoutMs = config.upstreamTimeoutMs;

    // Uses default AWS credential chain (not MinIO credentials)
    this.client = new S3Client({
      region: config.nearLakeRegion,
    });
  }

  private async fetchAssembled(
    height: number,
    abortSignal?: AbortSignal,
  ): Promise<Buffer> {
    const padded = String(height).padStart(12, '0');

    // Fetch block.json
    const blockKey = `${padded}/block.json`;
    const blockBytes = await this.getObject(blockKey, abortSignal);
    const blockValue = JSON.parse(blockBytes.toString('utf8'));

    // Extract actual shard IDs from block.chunks[].shard_id
    const chunks = blockValue?.chunks;
    if (!Array.isArray(chunks)) {
      throw new Error(
        `NEAR Lake block.json missing chunks array for height ${height}`,
      );
    }

    const shardIds: number[] = chunks.map(
      (chunk: { shard_id?: number }, i: number) => {
        if (typeof chunk.shard_id !== 'number') {
          throw new Error(
            `NEAR Lake chunk ${i} missing shard_id for height ${height}`,
          );
        }
        return chunk.shard_id;
      },
    );

    // Fetch all shards concurrently
    const shardBuffers = await Promise.all(
      shardIds.map((id) =>
        this.getObject(`${padded}/shard_${id}.json`, abortSignal),
      ),
    );

    const shards = shardBuffers.map((buf, i) => {
      try {
        return JSON.parse(buf.toString('utf8'));
      } catch (err) {
        throw new Error(
          `NEAR Lake shard_${shardIds[i]}.json parse failed for height ${height}: ${err}`,
        );
      }
    });

    // Assemble into fastnear-compatible shape: {"block": ..., "shards": [...]}
    const assembled = { block: blockValue, shards };
    return Buffer.from(JSON.stringify(assembled));
  }

  private async getObject(
    key: string,
    abortSignal?: AbortSignal,
  ): Promise<Buffer> {
    let output;
    try {
      output = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
          RequestPayer: 'requester',
        }),
        abortSignal ? { abortSignal } : undefined,
      );
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === 'NoSuchKey') {
        const notFoundErr = new Error(
          `NEAR Lake object not found: ${key}`,
        ) as Error & { notFound: boolean };
        notFoundErr.notFound = true;
        throw notFoundErr;
      }
      throw new Error(`NEAR Lake get_object failed for key ${key}: ${err}`);
    }

    if (!output.Body) {
      throw new Error(`NEAR Lake empty body for key ${key}`);
    }

    const bytes = await output.Body.transformToByteArray();
    if (bytes.length > 100 * 1024 * 1024) {
      throw new Error(
        `NEAR Lake response too large for key ${key}: ${bytes.length} bytes`,
      );
    }

    return Buffer.from(bytes);
  }

  async fetch(height: number): Promise<Buffer> {
    const start = Date.now();
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), this.timeoutMs);

    let result: Buffer;
    try {
      result = await this.fetchAssembled(height, abort.signal);
    } catch (err) {
      clearTimeout(timer);
      if (abort.signal.aborted) {
        throw new Error(
          `NEAR Lake fetch timed out for block ${height} after ${this.timeoutMs}ms`,
        );
      }
      throw err;
    }
    clearTimeout(timer);

    const elapsed = Date.now() - start;
    logger.debug(
      { bytes: result.length, height, latency_ms: elapsed },
      'NEAR Lake upstream fetch complete',
    );

    return result;
  }
}
