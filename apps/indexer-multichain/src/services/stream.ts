import { stream, types } from 'nb-lake';
import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeMultichainData } from '#services/multichain';
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

const indexerKey = 'multichain';
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
  const settings = await knex('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;

  if (config.dataSource === DataSource.FAST_NEAR) {
    let startBlockHeight = config.startBlockHeight;

    if (!startBlockHeight && latestBlock) {
      const next = +latestBlock - config.delta / 2;
      startBlockHeight = next;
      logger.info(`last synced block: ${latestBlock}`);
      logger.info(`syncing from block: ${next}`);
    }

    const stream = streamBlock({
      limit: config.preloadSize / 2,
      network: config.network,
      start: startBlockHeight || config.genesisHeight,
      url: config.fastnearEndpoint,
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
      process.exit();
    });
  } else {
    if (!lakeConfig.startBlockHeight && latestBlock) {
      const next = +latestBlock - config.delta;
      lakeConfig.startBlockHeight = next;
      logger.info(`last synced block: ${latestBlock}`);
      logger.info(`syncing from block: ${next}`);
    }

    for await (const message of stream(lakeConfig)) {
      await onMessage(message);
    }
  }
};

export const onMessage = async (message: types.StreamerMessage) => {
  try {
    if (message.block.header.height % 1000 === 0)
      logger.info(`syncing block: ${message.block.header.height}`);

    storeMultichainData(message);

    if (message.block.header.height % 100 === 0) {
      await knex('settings')
        .insert({
          key: indexerKey,
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
