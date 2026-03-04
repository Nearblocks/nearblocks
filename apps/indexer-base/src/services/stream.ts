import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata';
import { Message } from 'nb-neardata';

import config from '#config';
import { db } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeBlock } from '#services/block';
import { storeChunks } from '#services/chunk';
import { storeTransactions } from '#services/transaction';

const indexerKey = config.indexerKey;

export const syncData = async () => {
  const settings = await db('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;
  let startBlock = config.startBlockHeight;

  if (!startBlock && latestBlock) {
    startBlock = +latestBlock;
  }

  logger.info(`syncing from block: ${startBlock}`);

  const stream = streamBlock({
    network: config.network,
    start: startBlock || config.genesisHeight,
    url: config.neardataUrl,
  });

  for await (const message of stream) {
    await onMessage(message);
  }
};

export const onMessage = async (message: Message) => {
  try {
    logger.info(`syncing block: ${message.block.header.height}`);

    await Promise.all([
      storeBlock(db, message),
      storeChunks(db, message),
      storeTransactions(db, message),
    ]);

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
