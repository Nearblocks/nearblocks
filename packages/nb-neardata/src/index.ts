import { Readable } from 'stream';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { retry } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

interface BlockReadable extends Readable {
  block?: number;
  final?: number;
  last?: number;
}

export type BlockStreamConfig = {
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

const fetchBlock = async (url: string, block: number): Promise<Message> => {
  return await retry(
    async () => {
      const response = await fetch(`${url}/v0/block/${block}`, {
        method: 'GET',
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      return data as Message;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

const fetchFinal = async (url: string): Promise<Message> => {
  return await retry(
    async () => {
      const response = await fetch(`${url}/v0/last_block/final`, {
        method: 'GET',
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      return data as Message;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const url = config.url ?? endpoint(config.network);
  const start = config.start;
  const limit = config.limit ?? 10;

  const readable = new Readable({
    highWaterMark: limit * 2 + 1,
    objectMode: true,
    async read(this: BlockReadable) {
      try {
        // eslint-disable-next-line no-constant-condition
        whileLoop: while (true) {
          const block = this.block || start;
          const hasLast = !this.last || block - this.last > 10;

          if (!this.final || hasLast || this.final < block) {
            this.final = (await fetchFinal(url)).block.header.height;
            this.last = block;
          }

          if (this.final < block) {
            continue;
          }

          const diff = this.final - block;
          const concurrency = diff >= limit ? limit : diff > 0 ? diff : 1;
          const promises: Promise<Message>[] = [];

          for (let i = 0; i < concurrency; i++) {
            promises.push(fetchBlock(url, block + i));
          }

          const results = await Promise.all(promises);

          for (const result of results) {
            if (!result && concurrency === 1) {
              this.block = block + 1;
              continue whileLoop;
            }

            if (result) {
              if (!this.push(camelCaseKeys(result))) {
                this.pause();
              }
            }
          }

          this.block = block + concurrency;
          break whileLoop;
        }
      } catch (error) {
        this.emit('error', error);
        this.push(null);
      }
    },
  });

  readable.on('drain', () => {
    readable.resume();
  });

  return readable;
};
