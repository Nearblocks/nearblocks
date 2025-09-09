import { Message, streamBlock } from 'nb-blocks';
import { logger } from 'nb-logger';

import config from '#config';
import { dbRead, dbWrite, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeEvents } from '#services/events';

const indexerKey = config.indexerKey;
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
  const settings = await dbRead('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;

  let startBlockHeight = config.startBlockHeight;

  if (!startBlockHeight && latestBlock) {
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

    await storeEvents(dbWrite, message);

    await dbWrite('settings')
      .insert({
        key: indexerKey,
        value: { sync: message.block.header.height },
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
