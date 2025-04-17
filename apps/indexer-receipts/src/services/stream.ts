import { Message, streamBlock } from 'nb-blocks';
import { logger } from 'nb-logger';

import config from '#config';
import { dbRead, dbWrite, streamConfig } from '#libs/knex';
import { lru } from '#libs/lru';
import { cacheHistogram } from '#libs/prom';
import sentry from '#libs/sentry';
import { getBatchSize } from '#libs/utils';
import { prepareCache } from '#services/cache';
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

  let blocks: Message[] = [];

  for await (const message of stream as AsyncIterable<Message>) {
    blocks.push(message);
    const size = getBatchSize(message.block.header.timestampNanosec);

    if (blocks.length >= size) {
      await onMessage(blocks);
      blocks = [];
    }
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

export const onMessage = async (messages: Message[]) => {
  try {
    let start = performance.now();

    prepareCache(messages);

    const cache = performance.now() - start;
    cacheHistogram.labels(config.network).observe(cache);
    start = performance.now();

    await storeReceipts(dbWrite, messages);

    const time = performance.now() - start;

    logger.info({
      block: `${messages[0].block.header.height} - ${
        messages[messages.length - 1].block.header.height
      }`,
      cache: `${cache} ms`,
      db: `${time} ms`,
    });

    await dbWrite('settings')
      .insert({
        key: indexerKey,
        value: { sync: messages[messages.length - 1].block.header.height },
      })
      .onConflict('key')
      .merge();
  } catch (error) {
    logger.warn([...lru.entries()]);
    logger.error(
      `aborting... block ${messages[messages.length - 1].block.header.height} ${
        messages[messages.length - 1].block.header.hash
      }`,
    );
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
