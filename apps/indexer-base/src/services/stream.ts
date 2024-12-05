import { stream, types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBlock } from '#services/block';
import { prepareCache } from '#services/cache';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';
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
  const settings = await knex('settings')
    .where({ key: config.indexerKey })
    .first();
  const block = settings?.value?.sync;

  if (config.dataSource === DataSource.FAST_NEAR) {
    let startBlockHeight = config.startBlockHeight;

    if (!startBlockHeight && block) {
      const next = +block - config.delta / 2;
      startBlockHeight = next;
      logger.info(`last synced block: ${block}`);
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
    if (!lakeConfig.startBlockHeight && block) {
      const next = +block - config.delta;
      lakeConfig.startBlockHeight = next;
      logger.info(`last synced block: ${block}`);
      logger.info(`syncing from block: ${next}`);
    }

    for await (const message of stream(lakeConfig)) {
      await onMessage(message);
    }
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
