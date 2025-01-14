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
  const response = await fetch(file);

  const readable = new Readable({
    objectMode: true,
    async read(this) {
      try {
        const stream = new tar.Parser();

        stream.on('entry', (entry: tar.ReadEntry) => {
          if (entry.type === 'File' && entry.path.endsWith('.json')) {
            const chunks: Buffer[] = [];

            entry.on('data', (chunk: Buffer) => chunks.push(chunk));
            entry.on('end', () => {
              try {
                const json = Buffer.concat(chunks).toString();
                const parsed = JSON.parse(json);

                this.push(camelCaseKeys(parsed));
              } catch (error) {
                this.emit('error', error);
                this.push(null);
              }
            });
          } else {
            this.emit(
              'error',
              new Error('Unknown file received', {
                cause: { path: entry.path, type: entry.type },
              }),
            );
            this.push(null);
          }
        });

        stream.on('end', () => this.push(null));

        response.pipe(stream);
      } catch (error) {
        this.emit('error', error);
        this.push(null);
      }
    },
  });

  return readable;
};

export async function* streamBlock(config: BlockStreamConfig) {
  const url = config.url ?? endpoint(config.network);
  const startBlock = config.start;
  const start = Math.floor(startBlock / 10) * 10;
  const endBlock = config.end;
  const end = Math.floor(endBlock / 10) * 10;

  for (let block = start; block <= end; block += 10) {
    const base = String(block).padStart(12, '0');
    const folder = base.slice(0, 6);
    const subFolder = base.slice(6, 9);
    const file = `${url}/${folder}/${subFolder}/${base}.tgz`;

    const stream = await streamFiles(file);

    for await (const message of stream) {
      yield message;
    }
  }
}
