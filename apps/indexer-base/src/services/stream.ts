import { stream, types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata-raw';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBlock } from '#services/block';
import { DataSource } from '#types/enum';

const lakeConfig: types.LakeConfig = {
  blocksPreloadPoolSize: config.preloadSize,
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: config.startBlockHeight,
};

if (config.s3Endpoint) {
  lakeConfig.s3ForcePathStyle = true;
  lakeConfig.s3Endpoint = config.s3Endpoint;
}

export const syncData = async () => {
  const block = await knex('blocks').orderBy('block_height', 'desc').first();

  if (config.dataSource === DataSource.FAST_NEAR) {
    let startBlockHeight = config.startBlockHeight;

    if (!startBlockHeight && block) {
      const next = +block.block_height - 10;
      startBlockHeight = next;
      logger.info(`last synced block: ${block.block_height}`);
      logger.info(`syncing from block: ${next}`);
    }

    const stream = streamBlock({
      end: config.endBlockHeight,
      network: config.network,
      start: startBlockHeight || config.genesisHeight,
      url: config.fastnearEndpoint,
    });

    for await (const message of stream) {
      await onMessage(message);
    }
  } else {
    if (!lakeConfig.startBlockHeight && block) {
      const next = +block.block_height - config.delta;
      lakeConfig.startBlockHeight = next;
      logger.info(`last synced block: ${block.block_height}`);
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

    const start = performance.now();

    await storeBlock(knex, message);

    logger.info({
      block: message.block.header.height,
      time: `${performance.now() - start} ms`,
    });
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
