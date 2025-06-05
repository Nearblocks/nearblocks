import { Message, streamBlock } from 'nb-blocks';
import { logger } from 'nb-logger';

import config from '#config';
import { dbRead, dbWrite, streamConfig } from '#libs/knex';
import { cacheHistogram } from '#libs/prom';
import sentry from '#libs/sentry';
import { prepareCache } from '#services/cache';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';

const indexerKey = 'receipts';
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
    startBlockHeight = +latestBlock - config.delta;
  }

  const startBlock = startBlockHeight || 0;

  logger.info(`syncing from block: ${startBlock}`);

  const stream = streamBlock({
    dbConfig: streamConfig,
    s3Bucket: config.s3Bucket,
    s3Config,
    start: startBlock,
  });

  for await (const message of stream as AsyncIterable<Message>) {
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
    logger.error(`aborting... block ${message.block.header.height}`);
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
