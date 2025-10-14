// Temp batch processing
import { forEach } from 'hwp';

import { Message, streamBlock } from 'nb-blocks-minio';
import { logger } from 'nb-logger';

import config from '#config';
import { db, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeEvents } from '#services/events';

const indexerKey = config.indexerKey;
const s3Config = {
  accessKey: config.s3AccessKey,
  endPoint: config.s3Host,
  port: config.s3Port,
  secretKey: config.s3SecretKey,
  useSSL: config.s3UseSsl,
};

export const syncData = async () => {
  const settings = await db('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;
  let startBlockHeight = config.startBlockHeight && config.startBlockHeight - 1;

  if (!startBlockHeight && latestBlock) {
    logger.info(`last synced block: ${latestBlock}`);
    // startBlockHeight = +latestBlock;
    // Temp batch processing
    startBlockHeight = +latestBlock - 1000;
  }

  const startBlock = startBlockHeight || 0;

  logger.info(`syncing from block: ${startBlock}`);

  const stream = streamBlock({
    dbConfig: streamConfig,
    limit: 1000, // Temp batch processing
    s3Bucket: config.s3Bucket,
    s3Config,
    start: startBlock,
  });

  // for await (const message of stream) {
  //   await onMessage(message);
  // }
  // Temp batch processing
  await forEach(stream, onMessage, 1000);
};

export const onMessage = async (message: Message) => {
  try {
    logger.info(`syncing block: ${message.block.header.height}`);

    await storeEvents(db, message);

    await db('settings')
      .insert({
        key: indexerKey,
        value: {
          sync: message.block.header.height,
          timestamp: message.block.header.timestampNanosec,
        },
      })
      .onConflict('key')
      .merge();
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
