import { Readable } from 'stream';

import { logger } from 'nb-logger';
import { Network } from 'nb-types';
import { retry, sleep } from 'nb-utils';

import { Message } from './type.js';

export * from './type.js';

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
        if (response.status === 404) {
          await sleep(700);
        }

        throw new Error(`status: ${response.status}`);
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
      let finalBlockUrl = `${url}/v0/last_block/final`;

      // TEMPORARY FIX: For testnet, fetch latest block from RPC since fastnear's final block endpoint
      // is currently broken and always redirects to a fixed old block
      if (url.includes('testnet')) {
        const rpcResponse = await fetch('https://rpc.testnet.near.org', {
          body: JSON.stringify({
            id: 'dontcare',
            jsonrpc: '2.0',
            method: 'status',
            params: [],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          signal: AbortSignal.timeout(30000),
        });

        if (!rpcResponse.ok) {
          throw new Error(`RPC status: ${rpcResponse.status}`);
        }

        const rpcData = (await rpcResponse.json());
        const latestBlock = rpcData.result.sync_info.latest_block_height;
        finalBlockUrl = `${url}/v0/block/${latestBlock}`;
      }

      const response = await fetch(finalBlockUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(30000),
      });

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
  const url = config.url ?? endpoint(config.network);
  const limit = config.limit ?? 10;
  let isFetching = false;
  let block = config.start;
  const highWaterMark = limit * 2;

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

      if (block % 10 === 0 && remaining >= 5) {
        const final = (await fetchFinal(url)).block.header.height;

        const promises: Promise<Message>[] = [];
        const concurrency = Math.min(limit, final - block, remaining);

        for (let i = 0; i < concurrency; i++) {
          promises.push(fetchBlock(url, block + i));
        }

        const results = await Promise.all(promises);

        for (const result of results) {
          if (result && !readable.push(camelCaseKeys(result))) {
            return;
          }
        }

        block += concurrency;
        return;
      }

      const result = await fetchBlock(url, block);

      if (!result) {
        block++;
        return;
      }

      if (!readable.push(camelCaseKeys(result))) {
        return;
      }

      block++;
    } catch (error) {
      readable.destroy(error as Error);
    } finally {
      isFetching = false;
    }
  };

  const interval = setInterval(fetchBlocks, 500);

  readable.on('close', () => clearInterval(interval));

  return readable;
};
