import { stream, types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata';
import { Block } from 'nb-types';

import config from '#config';
import { pgp, pool } from '#libs/pgp';
import sentry from '#libs/sentry';
import { storeAccessKeys } from '#services/accessKey';
import { storeAccounts } from '#services/account';
import { storeBlock } from '#services/block';
import { prepareCache } from '#services/cache';
import { storeChunks } from '#services/chunk';
import { storeExecutionOutcomes } from '#services/executionOutcome';
import { storeReceipts } from '#services/receipt';
import { storeTransactions } from '#services/transaction';
import { DataSource } from '#types/enum';
import { PgpClient, PgpQuery } from '#types/types';

const lakeConfig: types.LakeConfig = {
  blocksPreloadPoolSize: config.preloadSize,
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: config.startBlockHeight,
};

if (config.s3Endpoint) {
  lakeConfig.s3ForcePathStyle = true;
  lakeConfig.s3Endpoint = config.s3Endpoint;
}

export const syncData = async () => {
  const resp = await pool.query<Block[]>(
    `SELECT * FROM blocks ORDER BY block_height DESC LIMIT 1`,
  );
  const block = resp[0];

  if (config.dataSource === DataSource.FAST_NEAR) {
    let startBlockHeight = config.startBlockHeight;

    if (!startBlockHeight && block) {
      const next = +block.block_height - 10;
      startBlockHeight = next;
      logger.info(`last synced block: ${block.block_height}`);
      logger.info(`syncing from block: ${next}`);
    }

    const stream = streamBlock({
      limit: 50,
      network: config.network,
      start: startBlockHeight || config.genesisHeight,
      url: config.fastnearEndpoint,
    });

    for await (const message of stream) {
      await onMessage(pool, message);
    }

    stream.on('end', () => {
      logger.error('stream ended');
      process.exit();
    });
    stream.on('error', (error: Error) => {
      logger.error(error);
      process.exit();
    });
  } else {
    if (!lakeConfig.startBlockHeight && block) {
      const next = +block.block_height - config.delta;
      lakeConfig.startBlockHeight = next;
      logger.info(`last synced block: ${block.block_height}`);
      logger.info(`syncing from block: ${next}`);
    }

    for await (const message of stream(lakeConfig)) {
      await onMessage(pool, message);
    }
  }
};

export const onMessage = async (
  pool: PgpClient,
  message: types.StreamerMessage,
) => {
  try {
    if (message.block.header.height % 1000 === 0)
      logger.info(`syncing block: ${message.block.header.height}`);

    let start = performance.now();

    await prepareCache(message);

    const cache = performance.now() - start;
    start = performance.now();

    const queries: PgpQuery[][] = await Promise.all([
      storeBlock(message),
      storeChunks(message),
      storeTransactions(message),
      storeReceipts(pool, message),
      storeExecutionOutcomes(message),
      storeAccounts(message),
      storeAccessKeys(message),
    ]);

    await pool.none(pgp.helpers.concat(queries.flat()));

    logger.info({
      block: message.block.header.height,
      cache: `${cache} ms`,
      db: `${performance.now() - start} ms`,
    });
  } catch (error) {
    logger.error(
      `aborting... block ${message.block.header.height} ${message.block.header.hash}`,
    );
    logger.error(error);
    sentry.captureException(error);
    process.exit();
  }
};
