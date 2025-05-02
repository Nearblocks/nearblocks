import { logger } from 'nb-logger';
import { MultichainTransaction } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import {
  decodeDERsignature,
  getBlock,
  getLatestBlock,
  pubKeyToP2PKH,
  pubKeyToP2WPKH,
} from '#libs/bitcoin';
import { NotFoundError } from '#libs/errors';
import { dbWrite } from '#libs/knex';
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

  const latestBlock = await getLatestBlock(url);
  const startBlock = await getStartBlock(chain, start);

  for (let i = startBlock; i <= latestBlock; i += BATCH_SIZE) {
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
    await updateProgress(chain, Math.min(i + BATCH_SIZE, latestBlock));
  }

  let currentBlock = latestBlock;

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
