import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import { db } from '#libs/knex';
import metrics from '#libs/prom';
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
    const start = performance.now();
    const blockHeight = message.block.header.height;

    logger.info(`syncing block: ${blockHeight}`);

    await storeEvents(db, message);

    await db('settings')
      .insert({
        key: indexerKey,
        value: {
          sync: blockHeight,
          timestamp: message.block.header.timestampNanosec,
        },
      })
      .onConflict('key')
      .merge();

    metrics.sync.blockHeight.set(blockHeight);
    metrics.perf.blocksProcessedTotal.inc();
    metrics.perf.blockProcessingSeconds.observe(
      (performance.now() - start) / 1000,
    );
  } catch (error) {
    metrics.errors.errorsTotal.inc({ type: 'processing' });
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    setTimeout(() => process.exit(1), 2000);
  }
};
