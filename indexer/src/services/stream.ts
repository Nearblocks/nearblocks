import { stream, types } from 'near-lake-framework';

import log from '#libs/log';
import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBlock } from '#services/block';
import { storeChunks } from '#services/chunk';
import { storeEvents } from '#services/events';
import { prepareCache } from '#services/cache';
import { storeReceipts } from '#services/receipt';
import { storeAccounts } from '#services/account';
import { storeAccessKeys } from '#services/accessKey';
import { storeTransactions } from '#services/transaction';
import { storeExecutionOutcomes } from '#services/executionOutcome';

const lakeConfig: types.LakeConfig = {
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: config.genesisHeight,
  blocksPreloadPoolSize: config.preloadSize,
};

export const syncData = async () => {
  const block = await knex('blocks').orderBy('block_height', 'desc').first();

  if (block) {
    const next = +block.block_height - config.delta;

    if (next > lakeConfig.startBlockHeight) {
      log.info(`last synced block: ${block.block_height}`);
      log.info(`syncing from block: ${next}`);
      lakeConfig.startBlockHeight = next;
    }
  }

  for await (const message of stream(lakeConfig)) {
    await onMessage(message);
  }
};

export const onMessage = async (message: types.StreamerMessage) => {
  try {
    if (message.block.header.height % 1000 === 0)
      log.info(`syncing block: ${message.block.header.height}`);
    await prepareCache(message);
    await storeBlock(knex, message.block);
    await storeChunks(knex, message.block.header.hash, message.shards);
    await storeTransactions(knex, message);
    await storeReceipts(knex, message);
    await Promise.all([
      storeExecutionOutcomes(knex, message),
      storeAccounts(knex, message),
      storeAccessKeys(knex, message),
      storeEvents(knex, message),
    ]);
  } catch (error) {
    log.error('aborting...');
    log.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
