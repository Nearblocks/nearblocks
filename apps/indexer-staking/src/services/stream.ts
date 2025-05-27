// Temp batch processing
import { forEach } from 'hwp';

import { Message, streamBlock } from 'nb-blocks';
import { logger } from 'nb-logger';

import config from '#config';
import { db, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeStakingData } from '#services/staking';

const indexerKey = 'staking';
const s3Config = {
  credentials: {
    accessKeyId: config.s3AccessKey,
    secretAccessKey: config.s3SecretKey,
  },
  endpoint: config.s3Endpoint,
  forcePathStyle: true,
  region: config.s3Region,
};

export const syncData = async () => {
  const settings = await db('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;
  let startBlockHeight = config.startBlockHeight && config.startBlockHeight - 1;

  if (!startBlockHeight && latestBlock) {
    logger.info(`last synced block: ${latestBlock}`);
    // startBlockHeight = +latestBlock;
    // Temp batch processing
    startBlockHeight = +latestBlock - 25;
  }

  const startBlock = startBlockHeight || 0;

  logger.info(`syncing from block: ${startBlock}`);

  const stream = streamBlock({
    dbConfig: streamConfig,
    limit: 25, // Temp batch processing
    s3Bucket: config.s3Bucket,
    s3Config,
    start: startBlock,
  });

  // for await (const message of stream) {
  //   await onMessage(message);
  // }
  // Temp batch processing
  await forEach(stream, onMessage, 25);

  stream.on('end', () => {
    logger.error('stream ended');
    process.exit();
  });
  stream.on('error', (error: Error) => {
    logger.error(error);
    process.exit();
  });
};

export const onMessage = async (message: Message) => {
  try {
    logger.info(`syncing block: ${message.block.header.height}`);

    await storeStakingData(db, message);

    await db('settings')
      .insert({
        key: indexerKey,
        value: { sync: message.block.header.height },
      })
      .onConflict('key')
      .merge();
  } catch (error) {
    logger.error(`aborting... block ${message.block.header.height}`);
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
