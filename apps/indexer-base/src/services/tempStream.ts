import { forEach } from 'hwp';

import { streamBlock } from 'nb-blocks';
import { logger } from 'nb-logger';
import { Message } from 'nb-neardata';

import config from '#config';
import { dbRead, dbWrite, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';
import { storeBlock } from '#services/block';
import { storeChunks } from '#services/chunk';
import { storeTransactions } from '#services/transaction';

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
  const block = await dbRead('blocks').orderBy('block_height', 'desc').first();
  const latestBlock = block?.block_height;
  let startBlockHeight = config.startBlockHeight && config.startBlockHeight - 1;

  if (!startBlockHeight && latestBlock) {
    logger.info(`last synced block: ${latestBlock}`);
    startBlockHeight = +latestBlock - 25;
  }

  const startBlock = startBlockHeight || 0;

  logger.info(`syncing from block: ${startBlock}`);

  const stream = streamBlock({
    dbConfig: streamConfig,
    limit: 25,
    s3Bucket: config.s3Bucket,
    s3Config,
    start: startBlock,
  });

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

    await Promise.all([
      storeBlock(dbWrite, message),
      storeChunks(dbWrite, message),
      storeTransactions(dbWrite, message),
      storeAccounts(dbWrite, message),
      storeAccessKeys(dbWrite, message),
    ]);
  } catch (error) {
    logger.error(`aborting... block ${message.block.header.height} `);
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
