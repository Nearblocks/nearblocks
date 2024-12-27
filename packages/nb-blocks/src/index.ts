import { Readable } from 'stream';

import { createKnex, Knex, KnexConfig } from 'nb-knex';
import { logger } from 'nb-logger';
import { retry, sleep } from 'nb-utils';

export * from './type.js';

interface BlockReadable extends Readable {
  block?: number;
  final?: number;
}

export type BlockStreamConfig = {
  dbConfig: KnexConfig | string;
  start: number;
};

const retries = 5;

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt });
};

const fetch = async (knex: Knex, block: number, limit: number) => {
  return await retry(
    async () => {
      const blocks = await knex('blocks')
        .select('block_json', 'block_bytea')
        .whereBetween('block_height', [block, block + limit - 1]);

      return blocks;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

const fetchFinal = async (knex: Knex) => {
  return await retry(
    async () => {
      const block = await knex('blocks')
        .select('block_height')
        .orderBy('block_height', 'desc')
        .first();

      return block?.block_height;
    },
    { exponential: true, logger: retryLogger, retries },
  );
};

export const streamBlock = (config: BlockStreamConfig) => {
  const knex: Knex = createKnex(config.dbConfig);
  const start = config.start;
  const limit = 20;

  const readable = new Readable({
    highWaterMark: limit * 2 + 1,
    objectMode: true,
    async read(this: BlockReadable) {
      try {
        // eslint-disable-next-line no-constant-condition
        whileLoop: while (true) {
          const block = this.block || start;
          const shouldFetch = !this.final || block >= this.final - limit * 5;
          const isInLimit = !this.final || this.final - block > limit + 1;

          if (shouldFetch) {
            this.final = await fetchFinal(knex);
          }

          const concurrency = isInLimit ? limit : 1;
          const shouldWait = this.final && block >= this.final;

          if (shouldWait) {
            await sleep(1000);
            continue whileLoop;
          }

          const responses = await fetch(knex, block, concurrency);

          if (!responses.length) {
            if (concurrency !== 1) {
              throw Error('missing blocks');
            }

            this.block = block + concurrency;
            continue whileLoop;
          }

          for (const response of responses) {
            if (!response.block_json && !response.block_bytea) {
              throw Error('missing block json');
            }

            const blockData =
              response.block_json ||
              JSON.parse(response.block_bytea.toString());

            if (!this.push(blockData)) {
              this.pause();
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
