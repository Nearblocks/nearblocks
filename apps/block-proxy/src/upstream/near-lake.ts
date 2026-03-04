import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { logger } from 'nb-logger';

import type { Config } from '#config';

const NEAR_LAKE_LAG_DEPTH = 10;
const POLL_INTERVAL_MS = 1000;

export class NearLakeUpstream {
  private bucket: string;
  private client: S3Client;
  private timeoutMs: number;

  private constructor(config: Config) {
    this.bucket = config.nearLakeBucket;
    this.timeoutMs = config.upstreamTimeoutMs;

    this.client = new S3Client({
      credentials: {
        accessKeyId: config.nearLakeAccessKey,
        secretAccessKey: config.nearLakeSecretKey,
      },
      region: config.nearLakeRegion,
    });
  }

  static create(config: Config): NearLakeUpstream | null {
    if (!config.nearLakeAccessKey || !config.nearLakeSecretKey) {
      return null;
    }
    return new NearLakeUpstream(config);
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

  async fetch(
    height: number,
    getTipHeight: () => number = () => 0,
  ): Promise<Buffer> {
    const start = Date.now();
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), this.timeoutMs);

    try {
      try {
        const result = await this.fetchAssembled(height, abort.signal);
        logger.debug(
          { bytes: result.length, height, latency_ms: Date.now() - start },
          'NEAR Lake upstream fetch complete',
        );
        return result;
      } catch (firstErr) {
        if (!(firstErr as Error & { notFound?: boolean }).notFound) {
          throw firstErr;
        }
      }

      const tipHeight = getTipHeight();

      // Height too far ahead of known tip
      if (tipHeight > 0 && height > tipHeight + NEAR_LAKE_LAG_DEPTH) {
        const err = new Error(
          `NEAR Lake block ${height} is too far ahead of tip ${tipHeight}`,
        ) as Error & { notFound: boolean };
        err.notFound = true;
        throw err;
      }

      // Height at or below known tip — block is finalized but absent from S3 (skipped)
      if (tipHeight > 0 && height <= tipHeight) {
        logger.debug(
          { height, tipHeight },
          'NEAR Lake block missing below tip, treating as skipped block',
        );
        return Buffer.from('null');
      }

      // Height near-future block — wait proportional to gap, then retry once
      const gapSeconds =
        tipHeight > 0
          ? Math.min(height - tipHeight, NEAR_LAKE_LAG_DEPTH)
          : NEAR_LAKE_LAG_DEPTH;
      const waitMs = gapSeconds * POLL_INTERVAL_MS;

      logger.debug(
        {
          gapSeconds,
          height,
          latency_ms: Date.now() - start,
          tipHeight,
          waitMs,
        },
        'NEAR Lake block ahead of tip, waiting before retry',
      );

      await Promise.race([
        new Promise<void>((resolve) => setTimeout(resolve, waitMs)),
        new Promise<void>((resolve) =>
          abort.signal.addEventListener('abort', () => resolve(), {
            once: true,
          }),
        ),
      ]);

      if (abort.signal.aborted) {
        throw new Error(
          `NEAR Lake fetch timed out for block ${height} after ${this.timeoutMs}ms`,
        );
      }

      try {
        const result = await this.fetchAssembled(height, abort.signal);
        logger.debug(
          { bytes: result.length, height, latency_ms: Date.now() - start },
          'NEAR Lake upstream fetch complete on retry',
        );
        return result;
      } catch (retryErr) {
        if (!(retryErr as Error & { notFound?: boolean }).notFound) {
          throw retryErr;
        }
        logger.debug(
          { gapSeconds, height, tipHeight },
          'NEAR Lake block not found after wait, treating as skipped block',
        );
        return Buffer.from('null');
      }
    } finally {
      clearTimeout(timer);
    }
  }
}
