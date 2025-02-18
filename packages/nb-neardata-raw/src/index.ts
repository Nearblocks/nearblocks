import { EventEmitter } from 'events';
import { Readable } from 'stream';

import axios from 'axios';
import * as tar from 'tar';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { retry } from 'nb-utils';

import { camelCaseKeys } from './utils.js';

export type BlockStreamConfig = {
  end: number;
  network: string;
  start: number;
  url?: string;
};

const retries = 5;
EventEmitter.defaultMaxListeners = 20;

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt });
};

const endpoint = (network: string) => {
  return network === Network.MAINNET
    ? 'https://mainnet.neardata.xyz/raw'
    : 'https://testnet.neardata.xyz/raw';
};

const fetch = async (url: string) => {
  return await retry(
    async () => {
      const response = await axios.get(url, {
        responseType: 'stream',
      });

      return response.data as Readable;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

export const streamFiles = async (file: string) => {
  return await retry(
    async () => {
      const response = await fetch(file);

      return new Promise<Readable>((resolve, reject) => {
        const readable = new Readable({
          objectMode: true,
          read() {},
        });

        const stream = new tar.Parser();

        stream.on('error', (err) => {
          reject(err);
        });

        response.on('error', (err) => {
          reject(err);
        });

        stream.on('entry', (entry: tar.ReadEntry) => {
          if (entry.type === 'File' && entry.path.endsWith('.json')) {
            const chunks: Buffer[] = [];
            entry.on('data', (chunk: Buffer) => chunks.push(chunk));
            entry.on('end', () => {
              try {
                const json = Buffer.concat(chunks).toString();
                const parsed = JSON.parse(json);
                readable.push(camelCaseKeys(parsed));
              } catch (error) {
                readable.emit('error', error);
                readable.push(null);
              }
            });
          } else {
            readable.emit(
              'error',
              new Error('Unknown file received', {
                cause: { path: entry.path, type: entry.type },
              }),
            );
            readable.push(null);
          }
        });

        stream.on('end', () => {
          readable.push(null);
          resolve(readable);
        });

        response.pipe(stream);
      });
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const url = config.url ?? endpoint(config.network);
  const startBlock = config.start;
  const endBlock = config.end;

  let isFetching = false;
  let next = 0;
  const limit = 10;
  const highWaterMark = limit * 20;
  const blocks: number[] = [];
  const start = Math.floor(startBlock / 10) * 10;
  const end = Math.floor(endBlock / 10) * 10;

  for (let i = start; i <= end; i += limit) {
    blocks.push(i);
  }

  const readable = new Readable({
    highWaterMark,
    objectMode: true,
    read() {},
  });

  const fetchBlocks = async () => {
    if (isFetching) return;

    isFetching = true;

    try {
      const remaining = highWaterMark - readable.readableLength;

      if (remaining > 10) {
        const promises: Promise<Readable>[] = [];
        const concurrency = Math.min(limit, blocks.length - next, remaining);

        for (let i = next; i < next + concurrency; i++) {
          const block = blocks[i];
          const base = String(block).padStart(12, '0');
          const folder = base.slice(0, 6);
          const subFolder = base.slice(6, 9);
          const file = `${url}/${folder}/${subFolder}/${base}.tgz`;

          promises.push(streamFiles(file));
        }

        const streams = await Promise.all(promises);

        for (const stream of streams) {
          for await (const message of stream) {
            if (message && !readable.push(message)) {
              return;
            }
          }

          next++;
        }
      }
    } catch (error) {
      readable.destroy(error as Error);
    } finally {
      isFetching = false;
    }
  };

  const interval = setInterval(fetchBlocks, 10);

  readable.on('close', () => clearInterval(interval));

  return readable;
};
