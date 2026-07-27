import { base58 } from '@scure/base';

import { logger } from 'nb-logger';
import { MultichainTransaction } from 'nb-types';

import config from '#config';
import { db } from '#libs/knex';
import { chainLastBlockTimestamp } from '#libs/prom';
import { getBlock, getLatestSlot } from '#libs/solana';
import { syncBlocks } from '#libs/sync';
import { retry, secToNs } from '#libs/utils';
import { Chains } from '#types/enum';
import { BlockProcess } from '#types/types';

const INSERT_LIMIT = config.insertLimit;

const processBlocks = async (chain: Chains) => {
  const { concurrency, interval, start, url } = config.chains[chain];

  if (!url) return;

  await syncBlocks({
    chain,
    concurrency,
    getTip: getLatestSlot,
    interval,
    processBlock,
    start,
    url,
  });
};

const processBlock = async ({ chain, height, url }: BlockProcess) => {
  const runBlock = async () => {
    return getBlock(url, height);
  };

  const fetchStart = Date.now();
  const block = await retry(runBlock, { chain, label: `block ${height}` });
  const fetchMs = Date.now() - fetchStart;

  if (!block) {
    logger.info(
      `${chain}: block missing, skipping: ${height} (fetchMs=${fetchMs})`,
    );
    return;
  }

  if (
    typeof block.blockTime !== 'number' ||
    !Number.isFinite(block.blockTime)
  ) {
    logger.info(
      `${chain}: block ${height} missing blockTime, skipping (fetchMs=${fetchMs})`,
    );
    return;
  }

  chainLastBlockTimestamp.set({ chain }, block.blockTime);

  if (!block.transactions?.length) {
    logger.info(
      `${chain}: block ${height} fetchMs=${fetchMs} insertMs=0 txns=0`,
    );
    return;
  }

  const txns: MultichainTransaction[] = [];

  for (const txn of block.transactions) {
    const txnHash = txn.transaction.signatures[0];
    const signature = Buffer.from(base58.decode(txnHash));
    const address = txn.transaction.accountKeys[0]?.pubkey ?? 'unknown';

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
        await db('multichain_transactions')
          .insert(batch)
          .onConflict(['chain', 'transaction', 'timestamp'])
          .ignore();
      };

      promises.push(
        retry(runBatch, { chain, label: `insert block ${height}` }),
      );
    }
  }

  await Promise.all(promises);
};

export default { processBlocks };
