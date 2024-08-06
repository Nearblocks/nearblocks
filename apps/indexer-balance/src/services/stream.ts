import { stream, types } from 'nb-lake';
import { logger } from 'nb-logger';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBalance } from '#services/balance';

const fetchBlocks = async (block: number, limit: number) => {
  try {
    const blocks = await knex('blocks')
      .select('block_height')
      .where('block_height', '>=', block)
      .orderBy('block_height', 'asc')
      .limit(limit);

    return blocks.map((block) => block.block_height);
  } catch (error) {
    logger.error(error);
    sentry.captureException(error);
    return [];
  }
};

const balanceKey = 'balance';
const lakeConfig: types.LakeConfig = {
  blocksPreloadPoolSize: config.preloadSize,
  fetchBlocks,
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: config.startBlockHeight,
};

if (config.s3Endpoint) {
  lakeConfig.s3ForcePathStyle = true;
  lakeConfig.s3Endpoint = config.s3Endpoint;
}

export const syncData = async () => {
  const settings = await knex('settings').where({ key: balanceKey }).first();
  const latestBlock = settings?.value?.sync;

  if (!lakeConfig.startBlockHeight && latestBlock) {
    const next = +latestBlock - config.delta;

    logger.info(`last synced block: ${latestBlock}`);
    logger.info(`syncing from block: ${next}`);
    lakeConfig.startBlockHeight = next;
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

    const start = performance.now();

    await storeBalance(knex, message);

    logger.info({
      block: message.block.header.height,
      time: `${performance.now() - start} ms`,
    });

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
