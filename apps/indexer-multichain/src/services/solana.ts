import { base58 } from '@scure/base';

import { logger } from 'nb-logger';
import { MultichainTransaction } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import { NotFoundError } from '#libs/errors';
import { dbWrite } from '#libs/knex';
import { getBlock, getLatestSlot } from '#libs/solana';
import {
  getStartBlock,
  retry,
  retryOnError,
  secToNs,
  updateProgress,
} from '#libs/utils';
import { Chains } from '#types/enum';
import { BlockProcess, RetryErrorContext } from '#types/types';

const BATCH_SIZE = 10;
const INSERT_LIMIT = config.insertLimit;

const processBlocks = async (chain: Chains) => {
  const { interval, start, url } = config.chains[chain];

  if (!url) return;

  const latestSlot = await getLatestSlot(url);
  const startSlot = await getStartBlock(chain, start);

  for (let i = startSlot; i <= latestSlot; i += BATCH_SIZE) {
    const promises = [];
    logger.info(`${chain}: syncing block: ${i}`);

    for (let j = 0; j < BATCH_SIZE; j++) {
      promises.push(
        processBlock({
          chain,
          height: i + j,
          interval,
          url,
        }),
      );
    }

    await Promise.all(promises);
    await updateProgress(chain, Math.min(i + BATCH_SIZE, latestSlot));
  }

  let currentBlock = latestSlot;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    currentBlock++;
    logger.info(`${chain}: syncing block: ${currentBlock}`);

    await processBlock({
      chain,
      height: currentBlock,
      interval,
      url,
    });
    await updateProgress(chain, currentBlock);
  }
};

const processBlock = async ({ chain, height, interval, url }: BlockProcess) => {
  const runBlock = async () => {
    return getBlock(url, height);
  };
  const onError = async ({ attempts, error, retries }: RetryErrorContext) => {
    logger.error({ attempts, chain, err: error, height });
    if (error instanceof NotFoundError) {
      await sleep(interval);
    } else {
      await retryOnError({ attempts, error, retries });
    }
  };

  const block = await retry(runBlock, { onError });

  if (!block) {
    throw new NotFoundError(`${chain}: block not found: ${height}`);
  }

  if (!block.transactions?.length) return;

  const txns: MultichainTransaction[] = [];

  for (const txn of block.transactions) {
    const txnHash = txn.transaction.signatures[0];
    const signature = Buffer.from(base58.decode(txnHash));
    const address = txn.transaction.message.accountKeys[0] ?? 'unknown';

    txns.push({
      address: address.toLowerCase(),
      chain,
      r: null,
      s: null,
      signature,
      timestamp: secToNs(block.blockTime),
      transaction: txnHash.toLowerCase(),
      v: null,
    });
  }

  const promises = [];

  if (txns.length) {
    for (let i = 0; i < txns.length; i += INSERT_LIMIT) {
      const batch = txns.slice(i, i + INSERT_LIMIT);
      const runBatch = async () => {
        await dbWrite('multichain_transactions')
          .insert(batch)
          .onConflict(['chain', 'transaction', 'timestamp'])
          .ignore();
      };

      promises.push(retry(runBatch, { retries: 3 }));
    }
  }

  await Promise.all(promises);
};

export default { processBlocks };
