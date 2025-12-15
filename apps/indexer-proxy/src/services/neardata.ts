import { logger } from 'nb-logger';
import { camelCaseKeys } from 'nb-neardata';
import { retry } from 'nb-utils';

import { config } from '#config.js';
import { Message } from '#types/index.js';

const retries = 10;

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt, service: 'neardata' });
};

const endpoint = (network: string) => {
  return network === 'mainnet'
    ? 'https://mainnet.neardata.xyz'
    : 'https://testnet.neardata.xyz';
};

export class NeardataService {
  private url: string;

  constructor() {
    this.url = endpoint(config.NETWORK);
    logger.info({ message: 'Neardata service initialized', url: this.url });
  }

  async fetchBlock(height: number): Promise<Message | null> {
    try {
      return await retry(
        async () => {
          const response = await fetch(`${this.url}/v0/block/${height}`, {
            method: 'GET',
            signal: AbortSignal.timeout(30000),
          });

          if (!response.ok) {
            throw new Error(`status: ${response.status}`);
          }

          const data = await response.json();

          return camelCaseKeys(data) as Message;
        },
        { exponential: true, logger: retryLogger, retries },
      );
    } catch (error) {
      logger.warn({ error, height, message: 'Neardata fetch failed' });

      return null;
    }
  }
}
