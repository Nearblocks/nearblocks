import { logger } from 'nb-logger';
import { camelCaseKeys } from 'nb-neardata';
import { retry, sleep } from 'nb-utils';

import { config } from '#config.js';
import { Message } from '#types/index.js';

const retries = 10;

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt, service: 'neardata' });
};

export class NeardataService {
  private url: string;

  constructor() {
    this.url = config.NEARDATA_URL;
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
            if (response.status === 404) {
              await sleep(100);
            }

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
