import {
  BlockHeader,
  StateChange as BlockStateChange,
  ExecutionOutcomeWithReceipt,
  IndexerTransactionWithOutcome,
  Message,
  Shard,
} from 'nb-blocks';
import { Knex } from 'nb-knex';
import {
  BalanceEvent,
  StateChangeCause,
  StateChangeCauseView,
  StateChangeDirection,
} from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { isAccountDelete, isAccountUpdate } from '#libs/guards';
import { isExecutionSuccess } from '#libs/utils';
import {
  AccountBalance,
  ActionReceiptGasReward,
  ReceiptProcessing,
  StateChange,
  TransactionProcessing,
} from '#types/types';

type BalanceChanges = {
  receipts: Map<string, AccountBalance>;
  rewards: Map<string, AccountBalance>;
  transactions: Map<string, AccountBalance>;
  validators: AccountBalance[];
};

export const storeBalance = async (knex: Knex, message: Message) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkBalance(knex, shard, message.block.header);
    }),
  );
};

export const storeChunkBalance = async (
  knex: Knex,
  shard: Shard,
  block: BlockHeader,
) => {
  const stateChanges = getStateChanges(
    shard.stateChanges as StateChange<unknown>[],
    block.height,
  );

  const validatorChanges = await getValidatorChanges(
    stateChanges.validators,
    block,
  );
  const txnChanges = await getTxnChanges(
    shard.chunk?.transactions || [],
    stateChanges.transactions,
    block,
  );
  const receiptRewardChanges = await getReceiptRewardChanges(
    shard.receiptExecutionOutcomes,
    stateChanges.receipts,
    stateChanges.rewards,
    block,
  );

  const changes: BalanceEvent[] = [
    ...validatorChanges,
    ...txnChanges,
    ...receiptRewardChanges,
  ];
  const changesLength = changes.length;

  if (!changesLength) return;

  for (let index = 0; index < changesLength; index++) {
    changes[index].shard_id = shard.shardId;
    changes[index].index_in_chunk = index;
  }

  await retry(async () => {
    for (let i = 0; i < changes.length; i += config.insertLimit) {
      const batch = changes.slice(i, i + config.insertLimit);

      await knex('balance_events')
        .insert(batch)
        .onConflict(['block_timestamp', 'shard_id', 'index_in_chunk'])
        .merge();
    }
  });
};

const getStateChanges = (
  stateChanges: StateChange<unknown>[],
  blockHeight: number,
) => {
  const result: BalanceChanges = {
    receipts: new Map(),
    rewards: new Map(),
    transactions: new Map(),
    validators: [],
  };

  for (const stateChange of stateChanges) {
    const account = getAccount(stateChange);

    if (!account) continue;

    switch ((stateChange as BlockStateChange).cause.type) {
      case StateChangeCauseView.ValidatorAccountsUpdate: {
        result.validators.push(account);
        break;
      }
      case StateChangeCauseView.TransactionProcessing: {
        const { txHash } = stateChange.cause as TransactionProcessing;

        if (result.transactions.has(txHash)) {
          throw new Error(
            `Duplicated balance changes for transaction ${txHash} at block_height ${blockHeight}.One of them may be missed ${JSON.stringify(
              account,
            )} ${result.transactions.get(txHash)}.`,
          );
        }

        result.transactions.set(txHash, account);
        break;
      }
      case StateChangeCauseView.ReceiptProcessing: {
        const { receiptHash } = stateChange.cause as ReceiptProcessing;

        if (result.receipts.has(receiptHash)) {
          throw new Error(
            `Duplicated balance changes for receipt ${receiptHash} at block_height ${blockHeight}. ${JSON.stringify(
              account,
            )} ${result.receipts.get(receiptHash)}.`,
          );
        }

        result.receipts.set(receiptHash, account);
        break;
      }
      case StateChangeCauseView.ActionReceiptGasReward: {
        const { receiptHash } = stateChange.cause as ActionReceiptGasReward;

        if (result.rewards.has(receiptHash)) {
          throw new Error(
            `Duplicated balance changes for receipt ${receiptHash} (reward) at block_height ${blockHeight}. ${JSON.stringify(
              account,
            )} ${result.receipts.get(receiptHash)}.`,
          );
        }

        result.rewards.set(receiptHash, account);
        break;
      }
      case StateChangeCauseView.NotWritableToDisk:
      case StateChangeCauseView.InitialState:
      case StateChangeCauseView.ActionReceiptProcessingStarted:
      case StateChangeCauseView.UpdatedDelayedReceipts:
      case StateChangeCauseView.PostponedReceipt:
      case StateChangeCauseView.Resharding: {
        throw new Error(
          `Unexpected state change cause met: ${
            (stateChange as BlockStateChange).cause.type
          }`,
        );
      }
      default:
        break;
    }
  }

  return result;
};

const getAccount = (
  stateChange: StateChange<unknown>,
): AccountBalance | null => {
  if (isAccountUpdate(stateChange)) {
    return {
      accountId: stateChange.change.accountId,
      balance: {
        nonStaked: stateChange.change.amount,
        staked: stateChange.change.locked,
        storage: stateChange.change.storageUsage,
      },
    };
  }

  if (isAccountDelete(stateChange)) {
    return {
      accountId: stateChange.change.accountId,
      balance: {
        nonStaked: '0',
        staked: '0',
        storage: '0',
      },
    };
  }

  return null;
};

const getValidatorChanges = async (
  balanceChanges: AccountBalance[],
  block: BlockHeader,
) => {
  const result: BalanceEvent[] = [];

  for (const currentBalance of balanceChanges) {
    result.push({
      affected_account_id: currentBalance.accountId,
      block_height: block.height,
      block_timestamp: block.timestampNanosec,
      cause: StateChangeCause.ValidatorsReward,
      direction: StateChangeDirection.Inbound,
      index_in_chunk: 0,
      involved_account_id: null,
      nonstaked_amount: currentBalance.balance.nonStaked,
      receipt_id: null,
      shard_id: 0,
      staked_amount: currentBalance.balance.staked,
      storage_usage: currentBalance.balance.storage,
      transaction_hash: null,
    });
  }

  return result;
};

const getTxnChanges = async (
  txns: IndexerTransactionWithOutcome[],
  balanceChanges: Map<string, AccountBalance>,
  block: BlockHeader,
) => {
  const result: BalanceEvent[] = [];

  for (const txn of txns) {
    const affectedAccount = txn.transaction.signerId;
    const involvedAccount =
      txn.transaction.receiverId === 'system'
        ? null
        : txn.transaction.receiverId;

    const txnHash = txn.transaction.hash;
    const changesAfterTxn = balanceChanges.get(txnHash);

    if (changesAfterTxn) {
      if (changesAfterTxn.accountId !== affectedAccount) {
        throw new Error(
          `Unexpected balance change info found for transaction ${txnHash}. Expected account ${affectedAccount}, Actual account ${changesAfterTxn.accountId}`,
        );
      }

      balanceChanges.delete(txnHash);

      if (isExecutionSuccess(txn.outcome.executionOutcome.outcome.status)) {
        result.push({
          affected_account_id: affectedAccount,
          block_height: block.height,
          block_timestamp: block.timestampNanosec,
          cause: StateChangeCause.Transaction,
          direction: StateChangeDirection.Outbound,
          index_in_chunk: 0,
          involved_account_id: involvedAccount,
          nonstaked_amount: changesAfterTxn.balance.nonStaked,
          receipt_id: null,
          shard_id: 0,
          staked_amount: changesAfterTxn.balance.staked,
          storage_usage: changesAfterTxn.balance.storage,
          transaction_hash: txnHash,
        });
      }
    }
  }

  if (balanceChanges.size) {
    throw new Error(
      `${
        balanceChanges.size
      } changes for transactions were not applied, block_height ${
        block.height
      }, keys: ${[...balanceChanges.keys()]}, values: ${JSON.stringify([
        ...balanceChanges.values(),
      ])}`,
    );
  }

  return result;
};

const getReceiptRewardChanges = async (
  outcomes: ExecutionOutcomeWithReceipt[],
  receipts: Map<string, AccountBalance>,
  rewards: Map<string, AccountBalance>,
  block: BlockHeader,
) => {
  const result: BalanceEvent[] = [];

  for (const outcome of outcomes) {
    if (!outcome.receipt) continue;

    const receiptId = outcome.receipt.receiptId;
    const affectedAccount = outcome.receipt.receiverId;
    const involvedAccount =
      outcome.receipt.predecessorId === 'system'
        ? null
        : outcome.receipt.predecessorId;

    const changesAfterReceipt = receipts.get(receiptId);

    if (changesAfterReceipt) {
      if (changesAfterReceipt.accountId !== affectedAccount) {
        throw new Error(
          `Unexpected balance change info found for receipt ${receiptId}. Expected account ${affectedAccount}, Actual account ${changesAfterReceipt.accountId}`,
        );
      }

      receipts.delete(receiptId);

      if (isExecutionSuccess(outcome.executionOutcome.outcome.status)) {
        result.push({
          affected_account_id: affectedAccount,
          block_height: block.height,
          block_timestamp: block.timestampNanosec,
          cause: StateChangeCause.Receipt,
          direction: StateChangeDirection.Inbound,
          index_in_chunk: 0,
          involved_account_id: involvedAccount,
          nonstaked_amount: changesAfterReceipt.balance.nonStaked,
          receipt_id: receiptId,
          shard_id: 0,
          staked_amount: changesAfterReceipt.balance.staked,
          storage_usage: changesAfterReceipt.balance.storage,
          transaction_hash: null,
        });
      }
    }

    const changesAfterReward = rewards.get(receiptId);

    if (changesAfterReward) {
      if (changesAfterReward.accountId !== affectedAccount) {
        throw new Error(
          `Unexpected balance change info found for receipt ${receiptId}. Expected account ${affectedAccount}, Actual account ${changesAfterReward.accountId}`,
        );
      }

      rewards.delete(receiptId);

      if (isExecutionSuccess(outcome.executionOutcome.outcome.status)) {
        result.push({
          affected_account_id: affectedAccount,
          block_height: block.height,
          block_timestamp: block.timestampNanosec,
          cause: StateChangeCause.ContractReward,
          direction: StateChangeDirection.Inbound,
          index_in_chunk: 0,
          involved_account_id: involvedAccount,
          nonstaked_amount: changesAfterReward.balance.nonStaked,
          receipt_id: receiptId,
          shard_id: 0,
          staked_amount: changesAfterReward.balance.staked,
          storage_usage: changesAfterReward.balance.storage,
          transaction_hash: null,
        });
      }
    }
  }

  if (receipts.size) {
    throw new Error(
      `${
        receipts.size
      } changes for transactions were not applied, block_height ${
        block.height
      }, keys: ${[...receipts.keys()]}, values: ${JSON.stringify([
        ...receipts.values(),
      ])}`,
    );
  }

  if (rewards.size) {
    throw new Error(
      `${
        rewards.size
      } changes for transactions were not applied, block_height ${
        block.height
      }, keys: ${[...rewards.keys()]}, values: ${JSON.stringify([
        ...rewards.values(),
      ])}`,
    );
  }

  return result;
};
