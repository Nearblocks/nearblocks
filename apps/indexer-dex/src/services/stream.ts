import { stream, types } from 'nb-lake';
import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { syncRefFinance } from '#services/contracts/v2.ref-finance.near';
import { DataSource } from '#types/enum';

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

const dexKey = 'dex';
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
  const settings = await knex('settings').where({ key: dexKey }).first();
  const latestBlock = settings?.value?.sync;
  let startBlockHeight = config.startBlockHeight;

  if (latestBlock) {
    const next = +latestBlock - config.delta;

    if (next > startBlockHeight) {
      logger.info(`last synced block: ${latestBlock}`);
      logger.info(`syncing from block: ${next}`);
      startBlockHeight = next;
      lakeConfig.startBlockHeight = next;
    }
  }

  if (config.dataSource === DataSource.FAST_NEAR) {
    const stream = streamBlock(startBlockHeight, config.preloadSize);

    stream.on('data', async (message: types.StreamerMessage) => {
      await onMessage(message);
    });

    stream.on('error', (error: Error) => {
      logger.error(error);
      process.exit();
    });
  } else {
    for await (const message of stream(lakeConfig)) {
      await onMessage(message);
    }
  }
};

export const onMessage = async (message: types.StreamerMessage) => {
  try {
    if (message.block.header.height % 1000 === 0) {
      logger.info(`syncing block: ${message.block.header.height}`);
    }

    await syncRefFinance(message);

    if (message.block.header.height % 100 === 0) {
      await knex('settings')
        .insert({
          key: dexKey,
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
