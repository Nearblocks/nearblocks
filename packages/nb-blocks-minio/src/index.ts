import { Readable } from 'stream';
import { text } from 'stream/consumers';

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
  promise: Promise<T>,
  timeout: number,
  onTimeout?: () => void,
): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      if (onTimeout) {
        try {
          onTimeout();
        } catch (error) {
          logger.error(error);
        }
      }
      reject(new Error(`Promise timed out after ${timeout} ms`));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
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
        .limit(limit)
        .timeout(10_000, { cancel: true });

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
) => {
  return retry(
    async () => {
      const stream = await minioClient.getObject(bucket, `${block}.json`);

      return withTimeout(text(stream), 60_000, () => {
        stream.destroy(new Error(`fetch timed out: block:${block}`));
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

    while (!isDestroyed) {
      const blocks = await withTimeout(fetchBlocks(knex, start, limit), 10_000);

      if (blocks.length === 0) {
        await sleep(100);
        continue;
      }

      const jsons = await Promise.all(
        blocks.map((block) =>
          fetchJson(minioClient, config.s3Bucket, block.block_height),
        ),
      );

      for (const json of jsons) {
        const parsed: Message = JSON.parse(json);

        yield parsed;
        start = parsed.block.header.height;
      }
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
