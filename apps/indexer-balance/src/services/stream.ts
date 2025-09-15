import { Message, streamBlock } from 'nb-blocks-minio';
import { logger } from 'nb-logger';

import config from '#config';
import { db, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBalance } from '#services/balance';

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
    startBlockHeight = +latestBlock;
  }

  const startBlock = startBlockHeight || 0;

  logger.info(`syncing from block: ${startBlock}`);

  const stream = streamBlock({
    dbConfig: streamConfig,
    s3Bucket: config.s3Bucket,
    s3Config,
    start: startBlock,
  });

  for await (const message of stream) {
    await onMessage(message);
  }
};

export const onMessage = async (message: Message) => {
  try {
    logger.info(`syncing block: ${message.block.header.height}`);

    await storeBalance(db, message);

    await db('settings')
      .insert({
        key: indexerKey,
        value: { sync: message.block.header.height },
      })
      .onConflict('key')
      .merge();
  } catch (error) {
    logger.error(`aborting... block ${message.block.header.height} `);
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
