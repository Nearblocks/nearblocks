import { logger } from 'nb-logger';
import { fetchFinal, Message, streamBlock } from 'nb-neardata';
import { streamBlock as streamRawBlock } from 'nb-neardata-raw';

import config from '#config';
import { db } from '#libs/knex';
import metrics from '#libs/prom';
import sentry from '#libs/sentry';
import { storeFTState } from '#services/state';

const indexerKey = config.indexerKey;

export const syncData = async () => {
  const settings = await db('settings').where({ key: indexerKey }).first();
  const latestBlock = settings?.value?.sync;

  let block = latestBlock ? +latestBlock : config.startBlockHeight;

  for (;;) {
    const head = (await fetchFinal(config.network, config.neardataUrl)).block
      .header.height;
    const end = head - config.rawLag;

    if (end - block <= config.rawThreshold) break;

    logger.info(`backfilling from block: ${block} to block: ${end}`);

    const raw = streamRawBlock({
      apiKey: config.fastnearApiKey,
      end,
      network: config.network,
      start: block,
    });

    for await (const message of raw) {
      const height = (message as Message).block.header.height;

      if (height < block) continue;

      await onMessage(message as Message);
      block = height + 1;

      if (height >= end) break;
    }
  }

  logger.info(`syncing from block: ${block}`);

  const stream = streamBlock({
    concurrency: config.neardataConcurrency,
    network: config.network,
    start: block,
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

    await storeFTState(db, message);

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
    metrics.sync.lastBlockTimestamp.set(
      Number(message.block.header.timestampNanosec) / 1e9,
    );
    metrics.perf.blocksProcessedTotal.inc();
    metrics.perf.blockProcessingSeconds.observe(
      (performance.now() - start) / 1000,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pool = (db as any).client.pool;
    metrics.infra.dbPoolActive.set(pool.numUsed());
    metrics.infra.dbPoolIdle.set(pool.numFree());
    metrics.infra.dbPoolWaiting.set(pool.numPendingAcquires());
  } catch (error) {
    metrics.errors.errorsTotal.inc({ type: 'processing' });
    logger.error(`aborting... block ${message.block.header.height} `);
    logger.error(error);
    sentry.captureException(error);
    await sentry.close(2000);
    process.exit(1);
  }
};
