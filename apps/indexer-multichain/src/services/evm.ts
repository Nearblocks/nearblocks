import { MultichainTransaction } from 'nb-types';

import config from '#config';
import { NotFoundError } from '#libs/errors';
import { getBlock, getLatestBlock, isValid } from '#libs/evm';
import { db } from '#libs/knex';
import { chainLastBlockTimestamp } from '#libs/prom';
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
    getTip: getLatestBlock,
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

  const block = await retry(runBlock, { chain, label: `block ${height}` });

  if (!block) {
    throw new NotFoundError(`${chain}: block not found: ${height}`);
  }

  const blockTimestamp = parseInt(block.timestamp, 16);
  // parseInt yields NaN if the upstream response omits the timestamp; skip
  // the gauge update so the series is not poisoned with NaN.
  if (Number.isFinite(blockTimestamp)) {
    chainLastBlockTimestamp.set({ chain }, blockTimestamp);
  }

  if (!block.transactions?.length) return;

  const txns: MultichainTransaction[] = [];

  for (const txn of block.transactions) {
    const r = Buffer.from(txn.r.replace(/^0x/, ''), 'hex');
    const s = Buffer.from(txn.s.replace(/^0x/, ''), 'hex');

    if (isValid(r, s)) {
      txns.push({
        address: txn.from.toLowerCase(),
        chain,
        r,
        s,
        signature: null,
        timestamp: secToNs(parseInt(block.timestamp, 16)),
        transaction: txn.hash.toLowerCase(),
        v: parseInt(txn.v, 16),
      });
    }
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
