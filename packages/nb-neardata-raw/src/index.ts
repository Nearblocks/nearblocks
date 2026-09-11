import { EventEmitter } from 'events';
import { Readable } from 'stream';

import axios from 'axios';
import * as tar from 'tar';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { retry } from 'nb-utils';

import { camelCaseKeys } from './utils.js';

export type StreamStats = {
  bufferLength: number;
  fetchSeconds: number;
  inFlight: number;
};

export type BlockStreamConfig = {
  apiKey?: string;
  bufferMultiplier?: number;
  concurrency?: number;
  end: number;
  network: string;
  onStats?: (stats: StreamStats) => void;
  project?: (message: unknown) => unknown;
  start: number;
  url?: string;
};

const retries = 5;
const requestTimeoutMs = 30_000;
const idleTimeoutMs = 30_000;
EventEmitter.defaultMaxListeners = 20;

export const BLOCKS_PER_ARCHIVE = 10;

const MAINNET_ARCHIVE_BOUNDARIES = [122_000_000, 142_000_000, 177_000_000];

const endpoint = (network: string, blockHeight: number) => {
  if (network === Network.MAINNET) {
    const position = MAINNET_ARCHIVE_BOUNDARIES.findIndex(
      (boundary) => blockHeight < boundary,
    );
    const shard =
      position === -1 ? MAINNET_ARCHIVE_BOUNDARIES.length : position;

    return `https://a${shard}.mainnet.neardata.xyz/raw`;
  }

  return 'https://testnet.neardata.xyz/raw';
};

const fetch = async (url: string, apiKey?: string) => {
  const response = await axios.get(url, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    responseType: 'stream',
    timeout: requestTimeoutMs,
    validateStatus: (status) => status === 200 || status === 404,
  });

  if (response.status === 404) {
    (response.data as Readable).destroy();

    return null;
  }

  return response.data as Readable;
};

export const streamFiles = async (
  file: string,
  apiKey?: string,
  project?: (message: unknown) => unknown,
) => {
  return await retry(
    async () => {
      const response = await fetch(file, apiKey);

      if (!response) return null;

      return new Promise<Readable>((resolve, reject) => {
        const readable = new Readable({
          objectMode: true,
          read() {},
        });

        const stream = new tar.Parser();

        let idleTimer: NodeJS.Timeout;
        const resetIdleTimer = () => {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            response.destroy(new Error(`idle timeout fetching ${file}`));
          }, idleTimeoutMs);
        };
        const clearIdleTimer = () => clearTimeout(idleTimer);

        stream.on('error', (err) => {
          clearIdleTimer();
          reject(err);
        });

        response.on('error', (err) => {
          clearIdleTimer();
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
                const message = camelCaseKeys(parsed);
                readable.push(project ? project(message) : message);
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
          clearIdleTimer();
          readable.push(null);
          resolve(readable);
        });

        response.pipe(stream);
        resetIdleTimer();
        response.on('data', resetIdleTimer);
      });
    },
    {
      exponential: true,
      logger: (attempt, error) => {
        logger.warn(
          {
            attempt,
            error: error instanceof Error ? error.message : error,
            file,
          },
          'retrying archive fetch',
        );
      },
      retries,
    },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const limit = config.concurrency ?? 20;
  const bufferMultiplier = config.bufferMultiplier ?? 2;
  const highWaterMark = limit * BLOCKS_PER_ARCHIVE * bufferMultiplier;

  const start =
    Math.floor(config.start / BLOCKS_PER_ARCHIVE) * BLOCKS_PER_ARCHIVE;
  const end = Math.floor(config.end / BLOCKS_PER_ARCHIVE) * BLOCKS_PER_ARCHIVE;

  const archives: number[] = [];
  for (let i = start; i <= end; i += BLOCKS_PER_ARCHIVE) {
    archives.push(i);
  }

  let nextToFetch = 0;
  let nextToEmit = 0;
  let inFlight = 0;
  let draining = false;
  let closed = false;

  const pending = new Map<number, Promise<null | Readable>>();
  const iterators = new Map<number, AsyncIterator<unknown>>();

  const archiveUrl = (index: number) => {
    const block = archives[index];
    const url = config.url ?? endpoint(config.network, block);
    const base = String(block).padStart(12, '0');
    const folder = base.slice(0, 6);
    const subFolder = base.slice(6, 9);

    return `${url}/${folder}/${subFolder}/${base}.tgz`;
  };

  const readable = new Readable({
    highWaterMark,
    objectMode: true,
    read() {
      pump();
    },
  });

  const fill = () => {
    if (closed) return;

    while (
      nextToFetch < archives.length &&
      nextToFetch - nextToEmit < limit &&
      inFlight * BLOCKS_PER_ARCHIVE + readable.readableLength <= highWaterMark
    ) {
      const index = nextToFetch;
      nextToFetch++;
      inFlight++;

      const startedAt = performance.now();
      const promise = streamFiles(
        archiveUrl(index),
        config.apiKey,
        config.project,
      );

      pending.set(index, promise);

      promise
        .then(() => {
          inFlight--;

          try {
            config.onStats?.({
              bufferLength: readable.readableLength,
              fetchSeconds: (performance.now() - startedAt) / 1000,
              inFlight,
            });
          } catch (error) {
            logger.warn(error, 'onStats callback threw');
          }

          drain();
        })
        .catch((error) => {
          inFlight--;
          readable.destroy(error as Error);
        });
    }
  };

  const drain = async () => {
    if (draining || closed) return;

    draining = true;

    try {
      while (nextToEmit < archives.length) {
        const promise = pending.get(nextToEmit);

        if (!promise) break;

        let iterator = iterators.get(nextToEmit);

        if (!iterator) {
          const stream = await promise;

          if (!stream) {
            logger.warn({ block: archives[nextToEmit] }, 'missing raw archive');
            pending.delete(nextToEmit);
            nextToEmit++;
            fill();
            continue;
          }

          iterator = stream[Symbol.asyncIterator]();
          iterators.set(nextToEmit, iterator);
        }

        let result = await iterator.next();

        while (!result.done) {
          if (!readable.push(result.value)) {
            return;
          }

          result = await iterator.next();
        }

        pending.delete(nextToEmit);
        iterators.delete(nextToEmit);
        nextToEmit++;
        fill();
      }

      if (nextToEmit >= archives.length) {
        readable.push(null);
      }
    } catch (error) {
      readable.destroy(error as Error);
    } finally {
      draining = false;
    }
  };

  const pump = () => {
    fill();
    drain();
  };

  const safetyInterval = setInterval(pump, 250);

  readable.on('close', () => {
    closed = true;
    clearInterval(safetyInterval);
  });

  pump();

  return readable;
};
