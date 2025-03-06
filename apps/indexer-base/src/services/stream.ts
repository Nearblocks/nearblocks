import { stream, types } from '@near-lake/framework';

import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import knex from '#libs/knex';
import sentry from '#libs/sentry';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';
import { storeBlock } from '#services/block';
import { prepareCache } from '#services/cache';
import { storeChunks } from '#services/chunk';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';
import { uploadJson } from '#services/s3';
import { storeTransactions } from '#services/transaction';
import { DataSource } from '#types/enum';

let source = config.dataSource;
const lakeConfig: types.LakeConfig = {
  blocksPreloadPoolSize: config.preloadSize,
  credentials: () =>
    Promise.resolve({
      accessKeyId: config.nearlakeAccessKey,
      secretAccessKey: config.nearlakeSecretKey,
    }),
  s3BucketName: config.nearlakeBucketName,
  s3RegionName: config.nearlakeRegionName,
  startBlockHeight: config.startBlockHeight,
};

if (config.nearlakeEndpoint) {
  lakeConfig.s3ForcePathStyle = true;
  lakeConfig.s3Endpoint = config.nearlakeEndpoint;
}

export const syncData = async (switchSource = false) => {
  try {
    if (switchSource) {
      source =
        source === DataSource.FAST_NEAR
          ? DataSource.NEAR_LAKE
          : DataSource.FAST_NEAR;
    }

    logger.info({ data_source: source, switch_source: switchSource });

    const block = await knex('blocks').orderBy('block_height', 'desc').first();

    if (source === DataSource.FAST_NEAR) {
      let startBlockHeight = config.startBlockHeight;

      if (!startBlockHeight && block) {
        const next = +block.block_height - config.delta;
        startBlockHeight = next;
        logger.info(`last synced block: ${block.block_height}`);
        logger.info(`syncing from block: ${next}`);
      }

      const stream = streamBlock({
        limit: 50,
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
        throw error;
      });
    } else {
      if (!lakeConfig.startBlockHeight && block) {
        const next = +block.block_height - config.delta;
        lakeConfig.startBlockHeight = next;
        logger.info(`last synced block: ${block.block_height}`);
        logger.info(`syncing from block: ${next}`);
      }

      for await (const message of stream(lakeConfig)) {
        await onMessage(message as unknown as Message);
      }
    }
  } catch (error) {
    await syncData(true);
  }
};

export const onMessage = async (message: Message) => {
  try {
    let start = performance.now();

    await prepareCache(message);

    const cache = performance.now() - start;
    start = performance.now();

    await Promise.race([
      Promise.all([
        storeBlock(knex, message),
        storeChunks(knex, message),
        storeTransactions(knex, message),
        storeReceipts(knex, message),
        storeExecutionOutcomes(knex, message),
        storeAccounts(knex, message),
        storeAccessKeys(knex, message),
        uploadJson(message),
      ]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Block processing timed out after 10s')),
          10_000,
        ),
      ),
    ]);

    logger.info({
      block: message.block.header.height,
      cache: `${cache} ms`,
      db: `${performance.now() - start} ms`,
    });
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    throw error;
  }
};
