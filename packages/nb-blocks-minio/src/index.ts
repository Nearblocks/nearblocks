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

const withTimeout = <T>(promise: Promise<T>, timeout: number) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Promise timed out after ${timeout} ms`)),
        timeout,
      ),
    ),
  ]);

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
      const objectName = `${block}.json`;
      const stream = await minioClient.getObject(bucket, objectName);

      return new Promise<string>((resolve, reject) => {
        const chunks: Uint8Array[] = [];

        stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        stream.on('error', (error) => reject(error));
        stream.on('end', () => {
          const data = Buffer.concat(chunks).toString('utf8');

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
  const knex: Knex = createKnex(config.dbConfig);
  const minioClient = new Minio.Client(config.s3Config);

  const limit = config.limit ?? 10;
  const highWaterMark = limit * 100;

  async function* iterator() {
    let start = config.start;

    try {
      while (true) {
        const blocks = await withTimeout(
          fetchBlocks(knex, start, limit),
          10_000,
        );

        if (blocks.length === 0) {
          await sleep(100);
          continue;
        }

        const jsons = await Promise.all(
          blocks.map((block) =>
            withTimeout(
              fetchJson(minioClient, config.s3Bucket, block.block_height),
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

  readable.on('end', () => process.exit());
  readable.on('error', (error) => {
    logger.error(error);
    process.exit();
  });
  readable.on('close', () => process.exit());

  return readable;
};
