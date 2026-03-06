import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import { dbRead, dbWrite } from '#libs/knex';
import sentry from '#libs/sentry';
import { storeEvents } from '#services/events';

const indexerKey = config.indexerKey;

export const syncData = async () => {
  const settings = await dbRead('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;
  let startBlockHeight = config.startBlockHeight;

  if (!startBlockHeight && latestBlock) {
    startBlockHeight = +latestBlock;
  }

  logger.info(`syncing from block: ${startBlockHeight}`);

  const stream = streamBlock({
    network: config.network,
    start: startBlockHeight || config.genesisHeight,
    url: config.neardataUrl,
  });

  for await (const message of stream) {
    await onMessage(message);
  }
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
