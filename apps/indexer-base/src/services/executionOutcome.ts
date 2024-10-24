import { types } from 'near-lake-framework';
import { Action, FunctionCallAction } from 'near-lake-framework/dist/types.js';

import { Knex } from 'nb-knex';
import { ExecutionOutcome, ExecutionOutcomeReceipt } from 'nb-types';
import { retry } from 'nb-utils';

import { getBitcoinAddress } from '#libs/chainAbstraction/bitcoin';
import { getEthereumAddress } from '#libs/chainAbstraction/ethereum';
import { addressExists } from '#libs/chainAbstraction/utils';
import { mapExecutionStatus } from '#libs/utils';

type DerivedData = { chain: null | string; derivedAddress: null | string };

export const storeExecutionOutcomes = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkExecutionOutcomes(
        knex,
        shard.shardId,
        message.block.header.timestampNanosec,
        shard.receiptExecutionOutcomes,
      );
    }),
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const storeChunkExecutionOutcomes = async (
  knex: Knex,
  shardId: number,
  blockTimestamp: string,
  executionOutcomes: types.ExecutionOutcomeWithReceipt[],
) => {
  const outcomes: ExecutionOutcome[] = [];
  const outcomeReceipts: ExecutionOutcomeReceipt[] = [];

  // Array to hold derived addresses data for batch insert
  const derivedAddresses: any = [];

  for (const [indexInChunk, executionOutcome] of executionOutcomes.entries()) {
    outcomes.push(
      getExecutionOutcomeData(
        shardId,
        blockTimestamp,
        indexInChunk,
        executionOutcome,
      ),
    );

    const executionOutcomeReceipts =
      executionOutcome.executionOutcome.outcome.receiptIds.map(
        (receiptId, receiptIndex) =>
          getExecutionOutcomeReceiptData(
            executionOutcome.executionOutcome.id,
            receiptId,
            receiptIndex,
          ),
      );

    outcomeReceipts.push(...executionOutcomeReceipts);

    // Process logs to derive addresses
    const logs = executionOutcome.executionOutcome.outcome.logs;

    if (logs) {
      for (const log of logs) {
        const receipt = executionOutcome?.receipt?.receipt;

        if (receipt && 'Action' in receipt) {
          const functionCallAction = receipt.Action?.actions?.find((action) =>
            isFunctionCallAction(action),
          ) as FunctionCallAction;

          if (
            log.startsWith('sign:') &&
            functionCallAction?.FunctionCall?.methodName === 'sign'
          ) {
            console.log('log', log);

            const signerId = receipt.Action?.signerId;
            const receiverId = executionOutcome?.receipt?.receiverId;
            const { path } = parseSignLog(log);
            const { chain, derivedAddress }: DerivedData =
              await getDerivedAddress(signerId, path);
            console.log('receiverId', receiverId);

            if (derivedAddress && chain) {
              derivedAddresses.push({
                account_id: signerId,
                chain: chain,
                derived_address: derivedAddress,
              });
            }
          }
        }
      }
    }
  }

  const promises = [];

  // Insert execution outcomes
  if (outcomes.length) {
    promises.push(
      retry(async () => {
        await knex('execution_outcomes')
          .insert(outcomes)
          .onConflict(['receipt_id'])
          .ignore();
      }),
    );
  }

  // Insert execution outcome receipts
  if (outcomeReceipts.length) {
    promises.push(
      retry(async () => {
        await knex('execution_outcome_receipts')
          .insert(outcomeReceipts)
          .onConflict([
            'executed_receipt_id',
            'index_in_execution_outcome',
            'produced_receipt_id',
          ])
          .ignore();
      }),
    );
  }

  try {
    console.log('derivedAddresses', derivedAddresses);

    // Insert derived addresses
    if (derivedAddresses.length) {
      promises.push(
        retry(async () => {
          await knex('derived_addresses')
            .insert(derivedAddresses)
            .onConflict(['derived_address', 'account_id'])
            .ignore();
        }),
      );
    }

    await Promise.all(promises);
  } catch (err) {
    console.log('ERRORR...', err);
  }
};

const getExecutionOutcomeData = (
  shardId: number,
  blockTimestamp: string,
  indexInChunk: number,
  outcome: types.ExecutionOutcomeWithReceipt,
): ExecutionOutcome => ({
  executed_in_block_hash: outcome.executionOutcome.blockHash,
  executed_in_block_timestamp: blockTimestamp,
  executor_account_id: outcome.executionOutcome.outcome.executorId,
  gas_burnt: outcome.executionOutcome.outcome.gasBurnt,
  index_in_chunk: indexInChunk,
  receipt_id: outcome.executionOutcome.id,
  shard_id: shardId,
  status: mapExecutionStatus(outcome.executionOutcome.outcome.status),
  tokens_burnt: outcome.executionOutcome.outcome.tokensBurnt,
});

const getExecutionOutcomeReceiptData = (
  executedReceipt: string,
  producedReceipt: string,
  receiptIndex: number,
): ExecutionOutcomeReceipt => ({
  executed_receipt_id: executedReceipt,
  index_in_execution_outcome: receiptIndex,
  produced_receipt_id: producedReceipt,
});

// Helper function to parse the "sign:" log to an object
const parseSignLog = (log: string) => {
  const cleanedLog = log.replace('sign:', '').trim();
  const keyValueRegex = /(\w+)=([^,]+)(?:,|$)/g;
  const result: any = {};
  let match;

  while ((match = keyValueRegex.exec(cleanedLog)) !== null) {
    const key = match[1];
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
};

function isFunctionCallAction(action: Action): action is FunctionCallAction {
  return (action as FunctionCallAction).FunctionCall !== undefined;
}

async function getDerivedAddress(signerId: string, path: string) {
  if (
    path === 'ethereum-1' ||
    path === "m/44'/60'/0'/0/0" ||
    path === 'ethereum,1'
  ) {
    const chain = 'ethereum';

    if (await addressExists(signerId, chain))
      return { chain: null, derivedAddress: null };

    const ethereumAddress = await getEthereumAddress(signerId, path);
    console.log('Ethereum Address:', ethereumAddress);
    const derivedData: DerivedData = {
      chain: 'ethereum',
      derivedAddress: ethereumAddress,
    };

    return derivedData;
  } else if (path === 'bitcoin-1') {
    const chain = 'bitcoin';

    if (await addressExists(signerId, chain))
      return { chain: null, derivedAddress: null };

    const bitcoinAddress: string = await getBitcoinAddress(signerId, path);
    console.log('Bitcoin Address:', bitcoinAddress);
    const derivedData: DerivedData = {
      chain: 'bitcoin',
      derivedAddress: bitcoinAddress,
    };

    return derivedData;
  } else return { chain: null, derivedAddress: null };
}
