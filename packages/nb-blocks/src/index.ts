import { Readable } from 'stream';

import { GetObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

import { createKnex, Knex, KnexConfig } from 'nb-knex';
import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

export type BlockStreamConfig = {
  dbConfig: KnexConfig | string;
  limit?: number;
  s3Bucket: string;
  s3Config: S3ClientConfig;
  start: number;
};

const retries = 5;
const retryConfig: S3ClientConfig = {
  logger: {
    debug: () => {},
    error: console.error,
    info: () => {},
    warn: console.warn,
  },
  maxAttempts: 1,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5_000,
    logger: {
      debug: () => {},
      error: console.error,
      info: () => {},
      warn: console.warn,
    },
    requestTimeout: 30_000,
  }),
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

      return blocks;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

const fetchJson = async (s3: S3Client, bucket: string, block: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: `${block}.json` }),
      { abortSignal: controller.signal },
    );

    if (!response.Body) throw Error(`empty response: block: ${block}`);

    return await response.Body.transformToString('utf8');
  } finally {
    clearTimeout(timer);
  }
};

export const streamBlock = (config: BlockStreamConfig) => {
  const knex: Knex = createKnex(config.dbConfig);
  const s3 = new S3Client({ ...config.s3Config, ...retryConfig });
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
            fetchJson(s3, config.s3Bucket, block.block_height),
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
