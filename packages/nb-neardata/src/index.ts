import { Readable } from 'stream';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { retry, sleep } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

export type BlockStreamConfig = {
  apiKey: string;
  limit?: number;
  network: string;
  start: number;
  url?: string;
};

interface CamelCaseObject {
  [key: string]: unknown;
}

const retries = 10;

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt });
};

const endpoint = (network: string) => {
  return network === Network.MAINNET
    ? 'https://mainnet.neardata.xyz'
    : 'https://testnet.neardata.xyz';
};

const camelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

export const camelCaseKeys = <T>(obj: T): T => {
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

const fetchBlock = async (
  apiKey: string,
  url: string,
  block: number,
): Promise<Message> => {
  return await retry(
    async () => {
      const response = await fetch(
        `${url}/v0/block/${block}?apiKey=${apiKey}`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(30000),
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          await sleep(100);
        }

        throw new Error(`status: ${response.status}`);
      }

      const data = await response.json();

      return data as Message;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

const fetchFinal = async (apiKey: string, url: string): Promise<Message> => {
  return await retry(
    async () => {
      const response = await fetch(
        `${url}/v0/last_block/final?apiKey=${apiKey}`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(30000),
        },
      );

      if (!response.ok) {
        throw new Error(`status: ${response.status}`);
      }

      const data = await response.json();

      return data as Message;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const apiKey = config.apiKey;
  const url = config.url ?? endpoint(config.network);
  const limit = config.limit ?? 10;
  let finalFetch = 0;
  let isFetching = false;
  let block = config.start;
  const highWaterMark = limit * 5;

  const readable = new Readable({
    highWaterMark,
    objectMode: true,
    read() {},
  });

  const fetchBlocks = async () => {
    if (isFetching) {
      logger.warn({ block, fetching: false });
      return;
    }

    isFetching = true;

    try {
      const remaining = highWaterMark - readable.readableLength;

      if (remaining < 5) {
        logger.warn({ block, remaining });
        return;
      }

      logger.warn({
        fetchingBlock: block,
        finalFetch,
        queueSize: readable.readableLength,
      });

      if ((!finalFetch || block - finalFetch >= 25) && remaining >= 10) {
        finalFetch = block;
        const final = (await fetchFinal(apiKey, url)).block.header.height;
        const promises: Promise<Message>[] = [];
        const concurrency = Math.min(limit, final - block, remaining - 5);

        logger.warn({ concurrency, finalBlock: final });

        if (concurrency > 0) {
          for (let i = 0; i < concurrency; i++) {
            promises.push(fetchBlock(apiKey, url, block + i));
          }

          const results = await Promise.all(promises);

          for (const result of results) {
            if (result) {
              const message: Message = camelCaseKeys(result);

              if (!readable.push(message)) {
                logger.warn({
                  block,
                  concurrency,
                  push: false,
                  results: results.length,
                });
                return;
              }

              block = message.block.header.height + 1;
            }
          }
        }
      }

      const result = await fetchBlock(apiKey, url, block);

      if (!result) {
        logger.warn({ block, result: false });
        block++;
        return;
      }

      if (!readable.push(camelCaseKeys(result))) {
        logger.warn({ block, push: false });
        return;
      }

      block++;
    } catch (error) {
      logger.warn({ block, destroy: true });
      readable.destroy(error as Error);
    } finally {
      logger.warn({ block, finally: false });
      isFetching = false;
    }
  };

  const interval = setInterval(fetchBlocks, 250);

  readable.on('close', () => clearInterval(interval));

  return readable;
};
