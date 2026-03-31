import { logger } from 'nb-logger';
import { Message, streamBlock } from 'nb-neardata';

import config from '#config';
import { db } from '#libs/knex';
import metrics from '#libs/prom';
import sentry from '#libs/sentry';
import { storeExecutionOutcomes } from '#services/executionOutcome';

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
    limit: 50,
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

    await Promise.all([storeExecutionOutcomes(db, message)]);

    const dbTime = performance.now() - start;

    logger.info({
      block: blockHeight,
      db: `${dbTime} ms`,
    });

    await db('settings')
      .insert({
        key: indexerKey,
        value: { sync: blockHeight },
      })
      .onConflict('key')
      .merge();

    metrics.sync.blockHeight.set(blockHeight);
    metrics.perf.blocksProcessedTotal.inc();
    metrics.perf.blockProcessingSeconds.observe(
      (performance.now() - start) / 1000,
    );
    const pool = (db as any).client.pool;
    metrics.infra.dbPoolActive.set(pool.numUsed());
    metrics.infra.dbPoolIdle.set(pool.numFree());
    metrics.infra.dbPoolWaiting.set(pool.numPendingAcquires());
  } catch (error) {
    metrics.errors.errorsTotal.inc({ type: 'processing' });
    logger.error(`aborting... block ${message.block.header.height}`);
    logger.error(error);
    sentry.captureException(error);
    await sentry.close(2000);
    process.exit(1);
  }
};
