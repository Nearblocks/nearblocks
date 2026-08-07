import { MultichainTransaction } from 'nb-types';

import config from '#config';
import { decodeDERsignature, parseScriptSigPushes } from '#libs/der';
import { NotFoundError } from '#libs/errors';
import { db } from '#libs/knex';
import { chainLastBlockTimestamp } from '#libs/prom';
import { syncBlocks } from '#libs/sync';
import { retry, secToNs } from '#libs/utils';
import { getBlock, getLatestBlock, pubKeyToTransparent } from '#libs/zcash';
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

  if (typeof block.time === 'number' && Number.isFinite(block.time)) {
    chainLastBlockTimestamp.set({ chain }, block.time);
  }

  if (!block.tx?.length) return;

  const txns: MultichainTransaction[] = [];

  for (const tx of block.tx) {
    for (const vin of tx.vin) {
      if (vin.scriptSig?.hex) {
        const pushes = parseScriptSigPushes(vin.scriptSig.hex);

        if (pushes && pushes.length >= 2) {
          const txn = getTxn(
            chain,
            block.time,
            tx.txid,
            pushes,
            pubKeyToTransparent,
          );

          if (txn) txns.push(txn);
        }
      }
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

const getTxn = (
  chain: Chains,
  timestamp: number,
  txn: string,
  input: string[],
  pubKeyToAddress: (pubkey: string) => string,
): MultichainTransaction | null => {
  try {
    const { r, s } = decodeDERsignature(input[0]); // [0] = sig
    const address = pubKeyToAddress(input[1]); // [1] = pubkey

    return {
      address,
      chain,
      r,
      s,
      signature: null,
      timestamp: secToNs(timestamp),
      transaction: txn.toLowerCase(),
      v: 1,
    };
  } catch (err) {
    return null;
  }
};

export default { processBlocks };
