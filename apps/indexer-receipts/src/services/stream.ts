import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import { dbRead, dbWrite } from '#libs/knex';
import { lru } from '#libs/lru';
import { cacheHistogram } from '#libs/prom';
import sentry from '#libs/sentry';
import { prepareCache } from '#services/cache';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';

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
    let start = performance.now();

    prepareCache(message);

    const cache = performance.now() - start;
    cacheHistogram.labels(config.network).observe(cache);
    start = performance.now();

    await Promise.all([
      storeReceipts(dbWrite, message),
      storeExecutionOutcomes(dbWrite, message),
    ]);

    const time = performance.now() - start;

    logger.info({
      block: message.block.header.height,
      cache: `${cache} ms`,
      db: `${time} ms`,
    });

    await dbWrite('settings')
      .insert({
        key: indexerKey,
        value: { sync: message.block.header.height },
      })
      .onConflict('key')
      .merge();
  } catch (error) {
    logger.warn([...lru.entries()]);
    logger.error(`aborting... block ${message.block.header.height}`);
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
