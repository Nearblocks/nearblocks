import { stream, types } from 'near-lake-framework';

import { logger } from 'nb-logger';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBalance } from '#services/balance';

const balanceKey = 'balance';
const lakeConfig: types.LakeConfig = {
  blocksPreloadPoolSize: config.preloadSize,
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: config.startBlockHeight,
};

if (config.s3Endpoint) {
  lakeConfig.s3Endpoint = config.s3Endpoint;
}

export const syncData = async () => {
  const settings = await knex('settings').where({ key: balanceKey }).first();
  const latestBlock = settings?.value?.sync;

  if (latestBlock) {
    const next = +latestBlock - config.delta;

    if (next > lakeConfig.startBlockHeight) {
      logger.info(`last synced block: ${latestBlock}`);
      logger.info(`syncing from block: ${next}`);
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
      logger.info(`syncing block: ${message.block.header.height}`);
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
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
