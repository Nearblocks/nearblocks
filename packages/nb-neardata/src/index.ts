import { Readable } from 'stream';

import axios from 'axios';

import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

interface BlockReadable extends Readable {
  block?: number;
}

interface CamelCaseObject {
  [key: string]: unknown;
}

const delay = 700;
const retries = 20;
const endpoint = 'https://mainnet.neardata.xyz/v0/block';

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

const fetch = async (block: number) => {
  return await retry(
    async () => {
      const response = await axios.get(`${endpoint}/${block}`, {
        timeout: 5000,
      });

      return response.data;
    },
    { delay, retries },
  );
};

export const streamBlock = (start: number, concurrency = 10) => {
  const highWaterMark = concurrency * 2;

  const readable = new Readable({
    highWaterMark,
    objectMode: true,
    async read(this: BlockReadable) {
      const block = this.block || start;
      const promises: Promise<Message>[] = [];

      for (let i = 0; i < concurrency; i++) {
        promises.push(fetch(block + i));
      }

      try {
        const results = await Promise.all(promises);

        for (const result of results) {
          if (result) {
            if (!this.push(camelCaseKeys(result))) {
              logger.warn(`paused: ${block}`);
              this.pause();
            }
          }
        }

        this.block = block + concurrency;
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
