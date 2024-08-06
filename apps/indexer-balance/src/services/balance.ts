import { Knex } from 'nb-knex';
import { types } from 'nb-lake';
import {
  BalanceEvent,
  EventStatus,
  StateChangeCause,
  StateChangeCauseView,
  StateChangeDirection,
} from 'nb-types';
import { retry } from 'nb-utils';

import { isAccountDelete, isAccountUpdate } from '#libs/guards';
import { mapStateChangeStatus } from '#libs/utils';
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

export const storeBalance = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await storeChunkBalance(knex, shard, message.block.header);
    }),
  );
};

export const storeChunkBalance = async (
  knex: Knex,
  shard: types.Shard,
  block: types.BlockHeader,
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

  const startIndex =
    BigInt(block.timestamp) * 100_000_000n * 100_000_000n +
    BigInt(shard.shardId) * 10_000_000n;

  for (let index = 0; index < changesLength; index++) {
    changes[index].event_index = String(startIndex + BigInt(index));
  }

  await retry(async () => {
    await knex('balance_events')
      .insert(changes)
      .onConflict(['event_index'])
      .ignore();
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

    switch ((stateChange as types.StateChange).cause.type) {
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
            (stateChange as types.StateChange).cause.type
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
      },
    };
  }

  if (isAccountDelete(stateChange)) {
    return {
      accountId: stateChange.change.accountId,
      balance: {
        nonStaked: '0',
        staked: '0',
      },
    };
  }

  return null;
};

const getValidatorChanges = async (
  balanceChanges: AccountBalance[],
  block: types.BlockHeader,
) => {
  const result: BalanceEvent[] = [];

  for (const currentBalance of balanceChanges) {
    result.push({
      absolute_nonstaked_amount: currentBalance.balance.nonStaked,
      absolute_staked_amount: currentBalance.balance.staked,
      affected_account_id: currentBalance.accountId,
      block_height: block.height,
      block_timestamp: block.timestampNanosec,
      cause: StateChangeCause.ValidatorsReward,
      delta_nonstaked_amount: null,
      delta_staked_amount: null,
      direction: StateChangeDirection.Inbound,
      event_index: '0',
      involved_account_id: null,
      receipt_id: null,
      status: EventStatus.SUCCESS,
      transaction_hash: null,
    });
  }

  return result;
};

const getTxnChanges = async (
  txns: types.IndexerTransactionWithOutcome[],
  balanceChanges: Map<string, AccountBalance>,
  block: types.BlockHeader,
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

      result.push({
        absolute_nonstaked_amount: changesAfterTxn.balance.nonStaked,
        absolute_staked_amount: changesAfterTxn.balance.staked,
        affected_account_id: affectedAccount,
        block_height: block.height,
        block_timestamp: block.timestampNanosec,
        cause: StateChangeCause.Transaction,
        delta_nonstaked_amount: null,
        delta_staked_amount: null,
        direction: StateChangeDirection.Outbound,
        event_index: '0',
        involved_account_id: involvedAccount,
        receipt_id: null,
        status: mapStateChangeStatus(
          txn.outcome.executionOutcome.outcome.status,
        ),
        transaction_hash: txnHash,
      });
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
  outcomes: types.ExecutionOutcomeWithReceipt[],
  receipts: Map<string, AccountBalance>,
  rewards: Map<string, AccountBalance>,
  block: types.BlockHeader,
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

      result.push({
        absolute_nonstaked_amount: changesAfterReceipt.balance.nonStaked,
        absolute_staked_amount: changesAfterReceipt.balance.staked,
        affected_account_id: affectedAccount,
        block_height: block.height,
        block_timestamp: block.timestampNanosec,
        cause: StateChangeCause.Receipt,
        delta_nonstaked_amount: null,
        delta_staked_amount: null,
        direction: StateChangeDirection.Inbound,
        event_index: '0',
        involved_account_id: involvedAccount,
        receipt_id: receiptId,
        status: mapStateChangeStatus(outcome.executionOutcome.outcome.status),
        transaction_hash: null,
      });
    }

    const changesAfterReward = rewards.get(receiptId);

    if (changesAfterReward) {
      if (changesAfterReward.accountId !== affectedAccount) {
        throw new Error(
          `Unexpected balance change info found for receipt ${receiptId}. Expected account ${affectedAccount}, Actual account ${changesAfterReward.accountId}`,
        );
      }

      rewards.delete(receiptId);

      result.push({
        absolute_nonstaked_amount: changesAfterReward.balance.nonStaked,
        absolute_staked_amount: changesAfterReward.balance.staked,
        affected_account_id: affectedAccount,
        block_height: block.height,
        block_timestamp: block.timestampNanosec,
        cause: StateChangeCause.ContractReward,
        delta_nonstaked_amount: null,
        delta_staked_amount: null,
        direction: StateChangeDirection.Inbound,
        event_index: '0',
        involved_account_id: involvedAccount,
        receipt_id: receiptId,
        status: mapStateChangeStatus(outcome.executionOutcome.outcome.status),
        transaction_hash: null,
      });
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
