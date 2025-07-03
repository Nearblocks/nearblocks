import { Readable } from 'stream';

import * as Minio from 'minio';

import { createKnex, Knex, KnexConfig } from 'nb-knex';
import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

export type BlockStreamConfig = {
  dbConfig: KnexConfig | string;
  limit?: number;
  s3Bucket: string;
  s3Config: Minio.ClientOptions;
  start: number;
};

const retries = 5;

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
    { exponential: true, logger: retryLogger, retries },
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

      try {
        const stream = await minioClient.getObject(bucket, objectName);

        return new Promise<string>((resolve, reject) => {
          const chunks: Uint8Array[] = [];
          const timer: NodeJS.Timeout = setTimeout(() => {
            cleanup();
            stream.destroy();
            reject(new Error(`Timeout fetching block: ${block}`));
          }, 60_000);

          const cleanup = () => {
            if (timer) clearTimeout(timer);
          };

          stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));

          stream.on('end', () => {
            cleanup();
            const data = Buffer.concat(chunks).toString('utf8');
            if (!data) {
              reject(new Error(`Empty response: block: ${block}`));
            } else {
              resolve(data);
            }
          });

          stream.on('error', (error) => {
            cleanup();
            reject(error);
          });
        });
      } catch (error) {
        throw new Error(`Failed to fetch block ${block}: ${error}`);
      }
    },
    { exponential: true, logger: retryLogger, retries: 1 },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const knex: Knex = createKnex(config.dbConfig);
  const minioClient = new Minio.Client(config.s3Config);

  let start = config.start;
  let isFetching = false;
  const limit = config.limit ?? 10;
  const highWaterMark = limit * 100;

  knex.on('error', (error) => {
    throw error;
  });

  const readable = new Readable({
    highWaterMark,
    objectMode: true,
    read() {},
  });

  const getBlocks = async () => {
    if (isFetching) return;

    isFetching = true;

    try {
      const remaining = highWaterMark - readable.readableLength;

      if (remaining > limit) {
        const blocks = await fetchBlocks(knex, start, limit);

        blocks.pop();

        const jsons = await Promise.all(
          blocks.map((block) =>
            fetchJson(minioClient, config.s3Bucket, block.block_height),
          ),
        );

        for (const json of jsons) {
          const parsed: Message = JSON.parse(json);

          if (!readable.push(parsed)) {
            return;
          }

          start = parsed.block.header.height;
        }
      }
    } catch (error) {
      readable.destroy(error as Error);
    } finally {
      isFetching = false;
    }
  };

  const interval = setInterval(getBlocks, 100);

  readable.on('close', () => clearInterval(interval));

  return readable;
};
