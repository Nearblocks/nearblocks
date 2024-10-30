import { types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import { MultichainAccount, MultichainTransaction } from 'nb-types';
import { retry } from 'nb-utils';

import bitcoin from '#libs/bitcoin';
import ethereum from '#libs/ethereum';
import { isFunctionCallAction } from '#libs/guards';
import { signer } from '#libs/kdf';
import knex from '#libs/knex';
import { decodeArgs, jsonParse } from '#libs/utils';
import { Chains } from '#types/enum';
import { Sign } from '#types/types';

type ChainData = {
  address: null | string;
  chain: null | string;
  publicKey: null | string;
};

export const storeMultichainData = async (message: types.StreamerMessage) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkData(
        message.block.header.height,
        message.block.header.timestampNanosec,
        shard.receiptExecutionOutcomes,
      );
    }),
  );
};

export const storeChunkData = async (
  blockHeight: number,
  blockTimestamp: string,
  executionOutcomes: types.ExecutionOutcomeWithReceipt[],
) => {
  const accounts: MultichainAccount[] = [];
  const transactions: MultichainTransaction[] = [];

  const receipts = executionOutcomes
    .filter((outcome) => {
      const keys = Object.keys(outcome.executionOutcome.outcome.status);

      return keys[0] === 'SuccessValue' || keys[0] === 'SuccessReceiptId';
    })
    .map((outcome) => outcome.receipt)
    .filter((receipt) => receipt !== null);

  await Promise.all(
    receipts.map(async (receipt) => {
      if (
        receipt &&
        receipt.receiverId === signer.account &&
        receipt.receipt &&
        'Action' in receipt.receipt
      ) {
        const receiptId = receipt.receiptId;
        const predecessor = receipt.predecessorId;

        await Promise.all(
          receipt.receipt.Action.actions.map(async (action) => {
            if (
              isFunctionCallAction(action) &&
              action.FunctionCall.methodName === 'sign'
            ) {
              const args = decodeArgs<Sign>(action.FunctionCall.args);

              if (args?.request?.path) {
                const { account, transaction } = await getDerivedData(
                  receiptId,
                  blockHeight,
                  blockTimestamp,
                  predecessor,
                  args.request.path,
                );

                if (account) {
                  accounts.push(account);
                }

                if (transaction) {
                  transactions.push(transaction);
                }
              }
            }
          }),
        );
      }
    }),
  );

  const promises = [];

  if (accounts.length) {
    promises.push(
      retry(async () => {
        await knex('multichain_accounts')
          .insert(accounts)
          .onConflict(['account_id', 'derived_address'])
          .ignore();
      }),
    );
  }

  if (transactions.length) {
    promises.push(
      retry(async () => {
        await knex('multichain_transactions')
          .insert(transactions)
          .onConflict(['receipt_id'])
          .ignore();
      }),
    );
  }

  await Promise.all(promises);
};

const getDerivedData = async (
  receiptId: string,
  blockHeight: number,
  blockTimestamp: string,
  predecessor: string,
  path: string,
) => {
  const { address, chain, publicKey } = await getChainData(predecessor, path);

  if (address && chain && publicKey) {
    return getTableData(
      receiptId,
      blockHeight,
      blockTimestamp,
      predecessor,
      address,
      publicKey,
      chain,
      path,
    );
  }

  logger.warn({ path, predecessor, receiptId });

  return { account: null, transaction: null };
};

const getChainData = async (
  predecessor: string,
  path: string,
): Promise<ChainData> => {
  const errorData = { address: null, chain: null, publicKey: null };

  switch (true) {
    case path.startsWith('ethereum'):
    case path.replace(/\\'/g, "'").startsWith("m/44'/60"):
      return getEvmData(predecessor, path);
    case path.startsWith('bitcoin'):
    case path.replace(/\\'/g, "'").startsWith("m/44'/0"):
      return getBtcData(predecessor, path);
    default: {
      if (path.includes('chain')) {
        try {
          const chainData = jsonParse(path.replace(/\\/g, ''));

          switch (chainData?.chain) {
            case 60:
              return getEvmData(predecessor, path);
            case 0:
              return getBtcData(predecessor, path);
            default:
              return errorData;
          }
        } catch (error) {
          logger.error(error);
        }
      }

      return errorData;
    }
  }
};

const getEvmData = async (
  predecessor: string,
  path: string,
): Promise<ChainData> => {
  try {
    const derivedData = await ethereum(predecessor, path);

    return { chain: Chains.ETHEREUM, ...derivedData };
  } catch (error) {
    logger.error(error);
    return { address: null, chain: null, publicKey: null };
  }
};

const getBtcData = async (
  predecessor: string,
  path: string,
): Promise<ChainData> => {
  try {
    const derivedData = await bitcoin(predecessor, path);

    return { chain: Chains.BITCOIN, ...derivedData };
  } catch (error) {
    logger.error(error);
    return { address: null, chain: null, publicKey: null };
  }
};

export const getTableData = (
  receiptId: string,
  blockHeight: number,
  blockTimestamp: string,
  predecessor: string,
  derivedAddress: string,
  publicKey: string,
  chain: string,
  path: string,
): { account: MultichainAccount; transaction: MultichainTransaction } => {
  return {
    account: {
      account_id: predecessor,
      block_height: blockHeight,
      block_timestamp: blockTimestamp,
      chain,
      derived_address: derivedAddress,
      path,
      public_key: publicKey,
    },
    transaction: {
      account_id: predecessor,
      block_height: blockHeight,
      block_timestamp: blockTimestamp,
      chain,
      derived_address: derivedAddress,
      derived_transaction: null,
      path,
      public_key: publicKey,
      receipt_id: receiptId,
    },
  };
};
