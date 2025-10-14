import { stream, types } from '@near-lake/framework';

import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import knex from '#libs/knex';
import { blockGauge, blocksHistogram, dataSourceGauge } from '#libs/prom';
import sentry from '#libs/sentry';
import { checkFastnear } from '#libs/utils';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';
import { storeBlock } from '#services/block';
import { storeChunks } from '#services/chunk';
import { uploadJson } from '#services/s3';
import { storeTransactions } from '#services/transaction';
import { DataSource } from '#types/enum';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
let source = config.dataSource;
let shouldSwitchSource = false;
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

if (!config.disableAutoSwitch) {
  setInterval(async () => {
    if (source === DataSource.NEAR_LAKE) {
      try {
        await checkFastnear();
        shouldSwitchSource = true;
      } catch (error) {
        logger.error(error);
      }
    }
  }, ONE_HOUR_IN_MS);
}

export const syncData = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      dataSourceGauge
        .labels(config.network)
        .set(source === DataSource.FAST_NEAR ? 1 : 0);
      logger.info({ data_source: source });

      let startBlockHeight = config.startBlockHeight;
      const block = await knex('blocks')
        .orderBy('block_height', 'desc')
        .first();

      if (source === DataSource.FAST_NEAR) {
        if (!startBlockHeight && block) {
          const next = +block.block_height - config.delta;
          startBlockHeight = next;
          logger.info(`last synced block: ${block.block_height}`);
          logger.info(`syncing from block: ${next}`);
        }

        const stream = streamBlock({
          apiKey: config.fastnearApiKey,
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
        if (!startBlockHeight && block) {
          const next = +block.block_height - config.delta;
          lakeConfig.startBlockHeight = next;
          logger.info(`last synced block: ${block.block_height}`);
          logger.info(`syncing from block: ${next}`);
        }

        for await (const message of stream(lakeConfig)) {
          await onMessage(message as unknown as Message);

          if (shouldSwitchSource) {
            shouldSwitchSource = false;
            throw new Error('Trigger to switch to fastnear');
          }
        }
      }
    } catch (error) {
      logger.error(error);

      if (!config.disableAutoSwitch) {
        source =
          source === DataSource.FAST_NEAR
            ? DataSource.NEAR_LAKE
            : DataSource.FAST_NEAR;
      }
    }
  }
};

export const onMessage = async (message: Message) => {
  try {
    const start = performance.now();

    await Promise.race([
      Promise.all([
        storeBlock(knex, message),
        storeChunks(knex, message),
        storeTransactions(knex, message),
        storeAccounts(knex, message),
        storeAccessKeys(knex, message),
        uploadJson(message),
      ]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Block processing timed out after 20s')),
          20_000,
        ),
      ),
    ]);

    const time = performance.now() - start;
    blockGauge.labels(config.network).set(message.block.header.height);
    blocksHistogram.labels(config.network).observe(time);

    logger.info({ block: message.block.header.height, db: `${time} ms` });
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    throw error;
  }
};
