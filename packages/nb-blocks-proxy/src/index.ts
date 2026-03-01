import { Readable } from 'stream';

import { createKnex, Knex, KnexConfig } from 'nb-knex';
import { logger } from 'nb-logger';
import { retry, sleep } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

export type BlockStreamConfig = {
  dbConfig: KnexConfig | string;
  limit?: number;
  proxyUrl: string;
  start: number;
};

interface CamelCaseObject {
  [key: string]: unknown;
}

const camelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const camelCaseKeys = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys) as T;
  }

  const newObj: CamelCaseObject = {};

  for (const [key, value] of Object.entries(obj)) {
    newObj[camelCase(key)] = camelCaseKeys(value);
  }

  return newObj as T;
};

const withTimeout = async <T>(
  promise: Promise<T>,
  timeout: number,
): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
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

const fetchJson = async (proxyUrl: string, block: number) => {
  return retry(
    async () => {
      const response = await fetch(`${proxyUrl}/v0/block/${block}`, {
        method: 'GET',
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`block ${block}: status ${response.status}`);
      }

      return response.json();
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

    let start = config.start;

    while (!isDestroyed) {
      const blocks = await withTimeout(fetchBlocks(knex, start, limit), 10_000);

      if (blocks.length === 0) {
        await sleep(100);
        continue;
      }

      const jsons = await Promise.all(
        blocks.map((block) => fetchJson(config.proxyUrl, block.block_height)),
      );

      for (const json of jsons) {
        const parsed = camelCaseKeys(json as Message);

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
