import jsSha3 from 'js-sha3';
import { base_decode } from 'near-api-js/lib/utils/serialize.js';
const { sha3_256 } = jsSha3;

import elliptic from 'elliptic';
import { keccak256 } from 'viem';
const { ec: EC } = elliptic;

import { types } from 'near-lake-framework';
import { Action, FunctionCallAction } from 'near-lake-framework/dist/types.js';

import { Knex } from 'nb-knex';
import { ExecutionOutcome, ExecutionOutcomeReceipt } from 'nb-types';
import { retry } from 'nb-utils';

import { mapExecutionStatus } from '#libs/utils';

const rootPublicKey =
  'secp256k1:4NfTiv3UsGahebgTaHyD9vF8KYKMBnfd6kh94mK6xv8fGBiJB8TBtFMP5WWXz6B89Ac1fbpzPwAvoyQebemHFwx3';

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
  const derivedAddressesToStore: any = [];

  executionOutcomes.forEach((executionOutcome, indexInChunk) => {
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
      logs.forEach(async (log) => {
        const receipt = executionOutcome?.receipt?.receipt;

        if (receipt && 'Action' in receipt) {
          const functionCallAction = receipt.Action?.actions?.find((action) =>
            isFunctionCallAction(action),
          ) as FunctionCallAction;

          if (
            log.startsWith('sign:') &&
            functionCallAction?.FunctionCall?.methodName === 'sign'
          ) {
            const signerId = receipt.Action?.signerId;
            const receiverId = executionOutcome?.receipt?.receiverId;
            const { path } = parseSignLog(log);
            const derivedAddress = await processSignTransactionLog(
              signerId,
              path,
              receiverId,
            );

            // Push the derived address data into the array
            derivedAddressesToStore.push({
              account_id: signerId,
              chain: 'Ethereum', // You can customize this if needed
              derived_address: derivedAddress,
            });
          }
        }
      });
    }
  });

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

  // Insert derived addresses
  if (derivedAddressesToStore.length) {
    promises.push(
      retry(async () => {
        await knex('derived_addresses')
          .insert(derivedAddressesToStore)
          .onConflict(['derived_address', 'account_id'])
          .ignore();
      }),
    );
  }

  await Promise.all(promises);
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

// Function to decode NEAR public key and return uncompressed hex
function najPublicKeyStrToUncompressedHexPoint(): string {
  const res =
    '04' +
    Buffer.from(base_decode(rootPublicKey.split(':')[1])).toString('hex');
  return res;
}

// Derive the child public key using NEAR signer ID and path
async function deriveChildPublicKey(
  parentUncompressedPublicKeyHex: string,
  signerId: string,
  path = '',
): Promise<string> {
  const ec = new EC('secp256k1');
  const scalarHex = sha3_256(
    `near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`,
  );

  const x = parentUncompressedPublicKeyHex.substring(2, 66);
  const y = parentUncompressedPublicKeyHex.substring(66);

  // Create a point object from X and Y coordinates
  const oldPublicKeyPoint = ec.curve.point(x, y);

  // Multiply the scalar by the generator point G
  const scalarTimesG = ec.g.mul(scalarHex);

  // Add the result to the old public key point
  const newPublicKeyPoint = oldPublicKeyPoint.add(scalarTimesG);
  const newX = newPublicKeyPoint.getX().toString('hex').padStart(64, '0');
  const newY = newPublicKeyPoint.getY().toString('hex').padStart(64, '0');

  return '04' + newX + newY; // uncompressed public key
}

// Convert the uncompressed public key to an Ethereum address
function uncompressedHexPointToEvmAddress(
  uncompressedHexPoint: string,
): string {
  const addressHash = keccak256(`0x${uncompressedHexPoint.slice(2)}`);
  // Ethereum address is last 20 bytes of hash (40 characters), prefixed with 0x
  return '0x' + addressHash.substring(addressHash.length - 40);
}

async function getEthereumAddress(accountId: string): Promise<string> {
  // Convert the root NEAR public key to uncompressed format
  const parentPublicKey = najPublicKeyStrToUncompressedHexPoint();

  // Derive the child public key for the given account ID and path (ethereum-1)
  const derivedPublicKey = await deriveChildPublicKey(
    parentPublicKey,
    accountId,
    'ethereum-1',
  );

  // Convert the derived public key to an Ethereum address
  const ethereumAddress = uncompressedHexPointToEvmAddress(derivedPublicKey);

  return ethereumAddress;
}

async function processSignTransactionLog(
  signerId: any,
  path: any,
  receiverId: any,
) {
  // Check if path matches Ethereum derivation (ethereum-1)
  if (path === 'ethereum-1') {
    // Convert payload to buffer and derive Ethereum address
    const ethereumAddress = await getEthereumAddress(signerId);
    console.log('receiverId', receiverId);

    console.log('Ethereum Address:', ethereumAddress);
  }
}
