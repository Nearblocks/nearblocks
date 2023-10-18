import { stream, types } from 'near-lake-framework';

import log from '#libs/log';
import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBalance } from '#services/balance';

const balanceKey = 'balance';
const lakeConfig: types.LakeConfig = {
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: config.genesisHeight,
  blocksPreloadPoolSize: config.preloadSize,
};

export const syncData = async () => {
  const settings = await knex('settings').where({ key: balanceKey }).first();
  const latestBlock = settings?.value?.sync;

  log.warn({ latestBlock });

  if (latestBlock) {
    const next = +latestBlock - config.delta;

    if (next > lakeConfig.startBlockHeight) {
      log.info(`last synced block: ${latestBlock}`);
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
    if (message.block.header.height % 1000 === 0) {
      log.info(`syncing block: ${message.block.header.height}`);
    }

    await storeBalance(knex, message);

    if (message.block.header.height % 100 === 0) {
      await knex('settings')
        .insert({
          key: balanceKey,
          value: { sync: message.block.header.height },
        })
        .onConflict('key')
        .merge();
    }
  } catch (error) {
    log.error('aborting...');
    log.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
