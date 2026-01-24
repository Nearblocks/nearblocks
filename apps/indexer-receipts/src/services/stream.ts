import { Message, streamBlock } from 'nb-blocks-minio';
import { logger } from 'nb-logger';

import config from '#config';
import { dbRead, dbWrite, streamConfig } from '#libs/knex';
import sentry from '#libs/sentry';
import { prepareCache } from '#services/cache';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';

const indexerKey = config.indexerKey;
const s3Config = {
  accessKey: config.s3AccessKey,
  endPoint: config.s3Host,
  port: config.s3Port,
  secretKey: config.s3SecretKey,
  useSSL: config.s3UseSsl,
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

  let messages: Message[] = [];

  for await (const message of stream as AsyncIterable<Message>) {
    // Temp batch processing
    const concurrency = message.block.header.height - startBlock > 100 ? 25 : 1;
    prepareCache(message);
    messages.push(message);

    if (messages.length >= concurrency) {
      await Promise.all(messages.map((msg) => onMessage(msg)));
      messages = [];
    }
  }

  if (messages.length > 0) {
    await Promise.all(messages.map((msg) => onMessage(msg)));
  }
};

export const onMessage = async (message: Message) => {
  try {
    const start = performance.now();

    await Promise.all([
      storeReceipts(dbWrite, message),
      storeExecutionOutcomes(dbWrite, message),
    ]);

    const time = performance.now() - start;

    logger.info({ block: message.block.header.height, db: `${time} ms` });

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
    // process.exit();
  }
};
