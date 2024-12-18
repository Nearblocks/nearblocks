import { Readable } from 'stream';

import axios from 'axios';

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

const fetch = async (url: string, block: number): Promise<Message> => {
  return await retry(
    async () => {
      const response = await axios.get(`${url}/v0/block/${block}`, {
        timeout: 5000,
      });

      return response.data;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

const fetchFinal = async (url: string): Promise<Message> => {
  return await retry(
    async () => {
      const response = await axios.get(`${url}/v0/last_block/final`, {
        timeout: 5000,
      });

      return response.data;
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
          const promises: Promise<Message>[] = [];
          const hasLast = !this.last || block - this.last > 1000;
          const hasFinal = !this.final || this.final - block > limit + 1;

          if (hasLast && hasFinal) {
            this.final = (await fetchFinal(url)).block.header.height;
            this.last = block;
          }

          const concurrency = hasFinal ? limit : 1;

          for (let i = 0; i < concurrency; i++) {
            promises.push(fetch(url, block + i));
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
