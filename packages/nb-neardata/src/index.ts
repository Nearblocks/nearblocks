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
  network: Network;
  start: number;
};

interface CamelCaseObject {
  [key: string]: unknown;
}

const delay = 700;
const retries = 20;

const endpoint = (network: string) => {
  return network === Network.MAINNET
    ? 'https://mainnet.neardata.xyz/v0'
    : 'https://testnet.neardata.xyz/v0';
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

const fetch = async (network: string, block: number): Promise<Message> => {
  return await retry(
    async () => {
      const response = await axios.get(`${endpoint(network)}/block/${block}`, {
        timeout: 5000,
      });

      return response.data;
    },
    { delay, retries },
  );
};

const fetchFinal = async (network: string): Promise<Message> => {
  return await retry(
    async () => {
      const response = await axios.get(
        `${endpoint(network)}/last_block/final`,
        {
          timeout: 5000,
        },
      );

      return response.data;
    },
    { delay, retries },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const network = config.network;
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
            this.final = (await fetchFinal(network)).block.header.height;
            this.last = block;
          }

          const concurrency = hasFinal ? limit : 1;

          for (let i = 0; i < concurrency; i++) {
            promises.push(fetch(network, block + i));
          }

          const results = await Promise.all(promises);

          for (const result of results) {
            if (!result && concurrency === 1) {
              this.block = block + 1;
              continue whileLoop;
            }

            if (result) {
              if (!this.push(camelCaseKeys(result))) {
                logger.warn(`paused: ${block}`);
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
