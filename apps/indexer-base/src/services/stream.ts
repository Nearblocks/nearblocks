import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata';
import { Message } from 'nb-neardata';

import config from '#config';
import { db } from '#libs/knex';
import metrics from '#libs/prom';
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
    const start = performance.now();
    const blockHeight = message.block.header.height;

    logger.info(`syncing block: ${blockHeight}`);

    await Promise.all([
      storeBlock(db, message),
      storeChunks(db, message),
      storeTransactions(db, message),
    ]);

    await db('settings')
      .insert({
        key: indexerKey,
        value: { sync: blockHeight },
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
