import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import knex from '#libs/knex';
import { blockGauge, blocksHistogram } from '#libs/prom';
import sentry from '#libs/sentry';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';
import { storeBlock } from '#services/block';
import { storeChunks } from '#services/chunk';
import { storeTransactions } from '#services/transaction';

export const syncData = async () => {
  let startBlockHeight = config.startBlockHeight;
  const block = await knex('blocks').orderBy('block_height', 'desc').first();

  if (!startBlockHeight && block) {
    const next = +block.block_height;
    startBlockHeight = next;
    logger.info(`last synced block: ${block.block_height}`);
    logger.info(`syncing from block: ${next}`);
  }

  const stream = streamBlock({
    network: config.network,
    start: startBlockHeight || config.genesisHeight,
    url: config.neardataUrl,
  });

  for await (const message of stream) {
    await onMessage(message);
  }

  stream.on('end', () => {
    logger.error('stream ended');
    process.exit();
  });
  stream.on('error', (error: Error) => {
    logger.error(error);
    throw error;
  });
};

export const onMessage = async (message: Message) => {
  try {
    const start = performance.now();

    await Promise.race([
      Promise.all([
        storeBlock(knex, message),
        storeChunks(knex, message),
        storeTransactions(knex, message),
        storeAccounts(knex, message),
        storeAccessKeys(knex, message),
      ]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Block processing timed out after 20s')),
          20_000,
        ),
      ),
    ]);

    const time = performance.now() - start;
    blockGauge.labels(config.network).set(message.block.header.height);
    blocksHistogram.labels(config.network).observe(time);

    logger.info({ block: message.block.header.height, db: `${time} ms` });
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    throw error;
  }
};
