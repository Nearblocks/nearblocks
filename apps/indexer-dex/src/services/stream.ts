import { Message, streamBlock } from 'nb-blocks';
import { logger } from 'nb-logger';

import config from '#config';
import { dbRead, dbWrite, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { syncRefFinance } from '#services/contracts/v2.ref-finance.near';

const indexerKey = 'dex';

export const syncData = async () => {
  const settings = await dbRead('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;
  let startBlockHeight = config.startBlockHeight;

  if (!startBlockHeight && latestBlock) {
    startBlockHeight = +latestBlock + 1;
  }

  logger.info(`syncing from block: ${startBlockHeight}`);

  const stream = streamBlock({
    dbConfig: streamConfig,
    start: startBlockHeight,
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
    if (message.block.header.height % 100 === 0) {
      logger.info(`syncing block: ${message.block.header.height}`);
    }

    const start = performance.now();

    await syncRefFinance(message);

    logger.info({
      block: message.block.header.height,
      time: `${performance.now() - start} ms`,
    });

    if (message.block.header.height % 10 === 0) {
      await dbWrite('settings')
        .insert({
          key: indexerKey,
          value: { sync: message.block.header.height },
        })
        .onConflict('key')
        .merge();
    }
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
