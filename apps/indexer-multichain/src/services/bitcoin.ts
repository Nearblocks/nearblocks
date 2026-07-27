import { MultichainTransaction } from 'nb-types';

import config from '#config';
import {
  decodeDERsignature,
  getBlock,
  getLatestBlock,
  pubKeyToP2PKH,
  pubKeyToP2WPKH,
} from '#libs/bitcoin';
import { NotFoundError } from '#libs/errors';
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

  // Guard against missing timestamp on malformed RPC responses; skip the
  // gauge update rather than throwing inside the block processor.
  if (typeof block.timestamp === 'number' && Number.isFinite(block.timestamp)) {
    chainLastBlockTimestamp.set({ chain }, block.timestamp);
  }

  if (!block.tx?.length) return;

  const txns: MultichainTransaction[] = [];

  for (const tx of block.tx) {
    for (const vin of tx.vin) {
      // P2PKH (Legacy)
      if (vin.scriptSig?.asm) {
        const asmParts = vin.scriptSig.asm.split(' ');

        if (asmParts.length >= 2) {
          const txn = getTxn(block.timestamp, tx.txid, asmParts, pubKeyToP2PKH);

          if (txn) txns.push(txn);
        }
      }

      // P2WPKH (SegWit)
      if (vin.txinwitness && vin.txinwitness.length > 0) {
        const txn = getTxn(
          block.timestamp,
          tx.txid,
          vin.txinwitness,
          pubKeyToP2WPKH,
        );

        if (txn) txns.push(txn);
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
      chain: 'BITCOIN',
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
