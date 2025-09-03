import { Readable } from 'stream';

import * as Minio from 'minio';

import { createKnex, Knex, KnexConfig } from 'nb-knex';
import { logger } from 'nb-logger';
import { retry, sleep } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

export type BlockStreamConfig = {
  dbConfig: KnexConfig | string;
  limit?: number;
  s3Bucket: string;
  s3Config: Minio.ClientOptions;
  start: number;
};

const withTimeout = async <T>(
  promiseFactory: (signal: AbortSignal) => Promise<T>,
  timeout: number,
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    try {
      return await promiseFactory(controller.signal);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Promise timed out after ${timeout} ms`);
    }

    throw error;
  }
};

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt });
};

const fetchBlocks = (knex: Knex, start: number, limit: number) => {
  return retry(
    async () => {
      const blocks = await knex('blocks')
        .select('block_height')
        .where('block_height', '>', start)
        .orderBy('block_height')
        .limit(limit);

      blocks.pop();

      return blocks;
    },
    { exponential: true, logger: retryLogger, retries: 5 },
  );
};

const fetchJson = async (
  minioClient: Minio.Client,
  bucket: string,
  block: number,
  signal?: AbortSignal,
) => {
  return retry(
    async () => {
      if (signal?.aborted) {
        throw new Error('Operation aborted');
      }

      const objectName = `${block}.json`;
      const stream = await minioClient.getObject(bucket, objectName);

      return new Promise<string>((resolve, reject) => {
        const chunks: Uint8Array[] = [];

        const cleanup = () => {
          stream.destroy();
          chunks.length = 0;
        };

        const abortHandler = () => {
          cleanup();
          reject(new Error('Operation aborted'));
        };

        if (signal) {
          signal.addEventListener('abort', abortHandler);
        }

        stream.on('data', (chunk: Uint8Array) => {
          if (signal?.aborted) {
            cleanup();
            return;
          }
          chunks.push(chunk);
        });
        stream.on('error', (error) => {
          if (signal) {
            signal.removeEventListener('abort', abortHandler);
          }
          cleanup();
          reject(error);
        });
        stream.on('end', () => {
          if (signal) {
            signal.removeEventListener('abort', abortHandler);
          }

          const data = Buffer.concat(chunks).toString('utf8');
          chunks.length = 0;

          if (!data) {
            reject(new Error(`Empty response: block: ${block}`));
          }

          resolve(data);
        });
      });
    },
    { exponential: true, logger: retryLogger, retries: 3 },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const limit = config.limit ?? 10;
  const highWaterMark = limit * 10;
  let isDestroyed = false;

  async function* iterator() {
    const knex: Knex = createKnex(config.dbConfig);
    const minioClient = new Minio.Client(config.s3Config);

    let start = config.start;

    try {
      while (!isDestroyed) {
        const blocks = await withTimeout(
          () => fetchBlocks(knex, start, limit),
          10_000,
        );

        if (blocks.length === 0) {
          await sleep(100);
          continue;
        }

        const jsons = await Promise.all(
          blocks.map((block) =>
            withTimeout(
              (signal) =>
                fetchJson(
                  minioClient,
                  config.s3Bucket,
                  block.block_height,
                  signal,
                ),
              60_000,
            ),
          ),
        );

        for (const json of jsons) {
          const parsed: Message = JSON.parse(json);

          yield parsed;
          start = parsed.block.header.height;
        }
      }
    } finally {
      await knex.destroy();
    }
  }

  const readable = Readable.from(iterator(), {
    emitClose: true,
    highWaterMark,
    objectMode: true,
  });

  const cleanup = () => {
    isDestroyed = true;

    if (!readable.destroyed) {
      readable.destroy();
    }

    process.exit();
  };

  readable.on('end', cleanup);
  readable.on('close', cleanup);
  readable.on('error', (error) => {
    logger.error(error);
    process.exit();
  });

  return readable;
};
