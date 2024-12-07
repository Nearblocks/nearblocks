import { types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata-raw';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBlock } from '#services/block';
import { prepareCache } from '#services/cache';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';

export const syncData = async () => {
  const settings = await knex('settings')
    .where({ key: config.indexerKey })
    .first();
  const block = settings?.value?.sync;

  let startBlockHeight = config.startBlockHeight;

  if (!startBlockHeight && block) {
    startBlockHeight = +block + 1;
  }

  logger.info(`syncing from block: ${startBlockHeight}`);

  const stream = streamBlock({
    end: config.endBlockHeight,
    network: 'mainnet',
    start: startBlockHeight || config.genesisHeight,
    url: config.fastnearRawEndpoint,
  });

  for await (const message of stream) {
    await onMessage(message);
  }
};

export const onMessage = async (message: types.StreamerMessage) => {
  try {
    if (config.endBlockHeight <= message.block.header.height) {
      logger.info(`finished syncing blocks: ${message.block.header.height}`);
      process.exit();
    }

    if (message.block.header.height % 10 === 0)
      logger.info(`syncing block: ${message.block.header.height}`);

    await prepareCache(message);
    await storeBlock(knex, message);
    await storeReceipts(knex, message);
    await storeExecutionOutcomes(knex, message);

    if (message.block.header.height % 100 === 0) {
      await knex('settings')
        .insert({
          key: config.indexerKey,
          value: { sync: message.block.header.height },
        })
        .onConflict('key')
        .merge();
    }
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
