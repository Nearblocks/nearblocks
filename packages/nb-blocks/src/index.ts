import { Agent } from 'https';
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
  proxyUrl?: string;
  s3Bucket?: string;
  s3Config?: S3ClientConfig;
  start: number;
};

const retries = 5;
const agent = new Agent({ keepAlive: true, timeout: 5_000 });
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
    httpAgent: agent,
    httpsAgent: agent,
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
  const timer = setTimeout(() => controller.abort(), 60_000);

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

const fetchJsonFromProxy = async (proxyUrl: string, block: number) => {
  return await retry(
    async () => {
      const response = await fetch(`${proxyUrl}/block/${block}`, {
        method: 'GET',
        signal: AbortSignal.timeout(60000),
      });

      if (!response.ok) {
        throw new Error(`Proxy returned status: ${response.status}`);
      }

      const data = (await response.json()) as { block: Message };

      return JSON.stringify(data.block);
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  // Validate config: must have either proxyUrl OR (s3Bucket + s3Config)
  if (!config.proxyUrl && (!config.s3Bucket || !config.s3Config)) {
    throw new Error(
      'BlockStreamConfig must have either proxyUrl OR both s3Bucket and s3Config',
    );
  }

  const knex: Knex = createKnex(config.dbConfig);
  // Only create S3 client if not using proxy
  const s3 = config.proxyUrl
    ? null
    : new S3Client({ ...config.s3Config, ...retryConfig });
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
            config.proxyUrl
              ? fetchJsonFromProxy(config.proxyUrl, block.block_height)
              : fetchJson(s3!, config.s3Bucket!, block.block_height),
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
