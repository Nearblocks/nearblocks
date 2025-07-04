import { forEach } from 'hwp';

import { streamBlock } from 'nb-blocks-minio';
import { logger } from 'nb-logger';
import { Message } from 'nb-neardata';

import config from '#config';
import { dbRead, dbWrite, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';
import { storeBlock } from '#services/block';
import { storeChunks } from '#services/chunk';
import { s3Config } from '#services/s3';
import { storeTransactions } from '#services/transaction';

const indexerKey = config.indexerKey;

export const syncData = async () => {
  const settings = await dbRead('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;
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
    s3Config: s3Config,
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

    await dbWrite('settings')
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
