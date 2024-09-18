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
const retries = 100;
const endpoint = 'https://mainnet.neardata.xyz/v0/block';

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

const fetch = async (height: number) => {
  return await retry(
    async () => {
      const response = await axios.get(`${endpoint}/${height}`);
      const data: Message = response.data;

      const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
      logger.info({ block: height, size: `${(size / 1024).toFixed(2)}KB` });

      return data;
    },
    { delay, retries },
  );
};

export const streamBlock = (start: number) => {
  const highWaterMark = 10;

  const readable = new Readable({
    highWaterMark,
    objectMode: true,
    async read(this: BlockReadable) {
      const block = this.block || start;

      try {
        const data = await fetch(block);

        if (!this.push(camelCaseKeys(data))) {
          this.pause();
        }

        this.block = block + 1;
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
