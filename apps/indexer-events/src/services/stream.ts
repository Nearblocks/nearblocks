import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import { db } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeEvents } from '#services/events';

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
