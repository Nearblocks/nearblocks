import { Knex } from 'knex';
import { types } from 'near-lake-framework';
import { AccountView } from 'near-api-js/lib/providers/provider.js';

import retry from '#libs/retry';
import { viewAccount } from '#libs/near';
import redis, { redLock } from '#libs/redis';
import { mapExecutionStatus } from '#libs/utils';
import { isAccountDelete, isAccountUpdate } from '#libs/guards';
import {
  Cause,
  Direction,
  ExecutionOutcomeStatus,
  StateChangeCauseView,
} from '#ts/enums';
import {
  StateChange,
  BalanceEvent,
  AccountBalance,
  ReceiptProcessing,
  TransactionProcessing,
  ActionReceiptGasReward,
  Balance,
} from '#ts/types';

type BalanceChanges = {
  validators: AccountBalance[];
  transactions: Map<string, AccountBalance>;
  receipts: Map<string, AccountBalance>;
  rewards: Map<string, AccountBalance>;
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
    shard.stateChanges as StateChange<any>[],
    block.height,
  );

  const validatorChanges = await storeValidatorChanges(
    stateChanges.validators,
    block,
  );
  const txnChanges = await storeTxnChanges(
    shard.chunk?.transactions || [],
    stateChanges.transactions,
    block,
  );
  const receiptRewardChanges = await storeReceiptRewardChanges(
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

  if (!changes.length) return;

  const startIndex =
    BigInt(block.timestamp) * 100000000n * 100000000n +
    BigInt(shard.shardId) * 10000000n;

  for (let index = 0; index < changes.length; index++) {
    changes[index].event_index = (startIndex + BigInt(index)).toString();
  }

  await retry(async () => {
    await knex('balance_events')
      .insert(changes)
      .onConflict(['event_index', 'block_timestamp'])
      .ignore();
  });
};

const getStateChanges = (
  stateChanges: StateChange<any>[],
  blockHeight: number,
) => {
  const result: BalanceChanges = {
    validators: [],
    transactions: new Map(),
    receipts: new Map(),
    rewards: new Map(),
  };

  for (const stateChange of stateChanges) {
    const account = getAccount(stateChange);

    if (!account) continue;

    switch (stateChange.cause.type) {
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
            )} ${JSON.stringify(result.transactions.get(txHash))}.`,
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
            )} ${JSON.stringify(result.receipts.get(receiptHash))}.`,
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
            )} ${JSON.stringify(result.receipts.get(receiptHash))}.`,
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
          `Unexpected state change cause met: ${stateChange.cause.type}`,
        );
      }
      default:
        break;
    }
  }

  return result;
};

const getAccount = (stateChange: StateChange<any>): AccountBalance | null => {
  if (isAccountUpdate(stateChange)) {
    return {
      accountId: stateChange.change.accountId,
      balance: {
        staked: stateChange.change.locked,
        nonStaked: stateChange.change.amount,
      },
    };
  }

  if (isAccountDelete(stateChange)) {
    return {
      accountId: stateChange.change.accountId,
      balance: {
        staked: '0',
        nonStaked: '0',
      },
    };
  }

  return null;
};

const storeValidatorChanges = async (
  balanceChanges: AccountBalance[],
  block: types.BlockHeader,
) => {
  const result: BalanceEvent[] = [];

  for (const currentBalance of balanceChanges) {
    const prevBalance = await getAccountBalance(
      currentBalance.accountId,
      block.prevHash,
    );
    const { staked, nonStaked } = getDeltas(prevBalance, currentBalance);

    await saveAccountBalance(currentBalance);

    result.push({
      event_index: '0',
      block_height: block.height,
      block_timestamp: block.timestampNanosec,
      receipt_id: null,
      transaction_hash: null,
      affected_account_id: currentBalance.accountId,
      involved_account_id: null,
      direction: Direction.Inbound,
      cause: Cause.ValidatorsReward,
      status: ExecutionOutcomeStatus.SUCCESS_VALUE,
      delta_staked_amount: staked,
      delta_nonstaked_amount: nonStaked,
      absolute_staked_amount: currentBalance.balance.staked,
      absolute_nonstaked_amount: currentBalance.balance.nonStaked,
    });
  }

  return result;
};

const storeTxnChanges = async (
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

      const prevBalance = await getAccountBalance(
        affectedAccount,
        block.prevHash,
      );
      const { staked, nonStaked } = getDeltas(prevBalance, changesAfterTxn);

      await saveAccountBalance(changesAfterTxn);

      result.push({
        event_index: '0',
        block_height: block.height,
        block_timestamp: block.timestampNanosec,
        receipt_id: null,
        transaction_hash: txnHash,
        affected_account_id: affectedAccount,
        involved_account_id: involvedAccount,
        direction: Direction.Outbound,
        cause: Cause.Transaction,
        status: mapExecutionStatus(txn.outcome.executionOutcome.outcome.status),
        delta_staked_amount: staked,
        delta_nonstaked_amount: nonStaked,
        absolute_staked_amount: changesAfterTxn.balance.staked,
        absolute_nonstaked_amount: changesAfterTxn.balance.nonStaked,
      });

      if (involvedAccount && involvedAccount !== affectedAccount) {
        const involvedAccountPrevBalance = await getAccountBalance(
          involvedAccount,
          block.prevHash,
        );

        result.push({
          event_index: '0',
          block_height: block.height,
          block_timestamp: block.timestampNanosec,
          receipt_id: null,
          transaction_hash: txnHash,
          affected_account_id: involvedAccount,
          involved_account_id: affectedAccount,
          direction: Direction.Inbound,
          cause: Cause.Transaction,
          status: mapExecutionStatus(
            txn.outcome.executionOutcome.outcome.status,
          ),
          delta_staked_amount: '0',
          delta_nonstaked_amount: '0',
          absolute_staked_amount: involvedAccountPrevBalance.balance.staked,
          absolute_nonstaked_amount:
            involvedAccountPrevBalance.balance.nonStaked,
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
      }, keys: ${JSON.stringify(
        balanceChanges.keys(),
      )}, values: ${JSON.stringify(balanceChanges.values())}`,
    );
  }

  return result;
};

const storeReceiptRewardChanges = async (
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

      const prevBalance = await getAccountBalance(
        affectedAccount,
        block.prevHash,
      );
      const { staked, nonStaked } = getDeltas(prevBalance, changesAfterReceipt);

      await saveAccountBalance(changesAfterReceipt);

      result.push({
        event_index: '0',
        block_height: block.height,
        block_timestamp: block.timestampNanosec,
        receipt_id: receiptId,
        transaction_hash: null,
        affected_account_id: affectedAccount,
        involved_account_id: involvedAccount,
        direction: Direction.Inbound,
        cause: Cause.Receipt,
        status: mapExecutionStatus(outcome.executionOutcome.outcome.status),
        delta_staked_amount: staked,
        delta_nonstaked_amount: nonStaked,
        absolute_staked_amount: changesAfterReceipt.balance.staked,
        absolute_nonstaked_amount: changesAfterReceipt.balance.nonStaked,
      });

      if (involvedAccount && involvedAccount !== affectedAccount) {
        const involvedAccountPrevBalance = await getAccountBalance(
          involvedAccount,
          block.prevHash,
        );

        result.push({
          event_index: '0',
          block_height: block.height,
          block_timestamp: block.timestampNanosec,
          receipt_id: receiptId,
          transaction_hash: null,
          affected_account_id: involvedAccount,
          involved_account_id: affectedAccount,
          direction: Direction.Outbound,
          cause: Cause.Receipt,
          status: mapExecutionStatus(outcome.executionOutcome.outcome.status),
          delta_staked_amount: '0',
          delta_nonstaked_amount: '0',
          absolute_staked_amount: involvedAccountPrevBalance.balance.staked,
          absolute_nonstaked_amount:
            involvedAccountPrevBalance.balance.nonStaked,
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

      const prevBalance = await getAccountBalance(
        affectedAccount,
        block.prevHash,
      );
      const { staked, nonStaked } = getDeltas(prevBalance, changesAfterReward);

      await saveAccountBalance(changesAfterReward);

      result.push({
        event_index: '0',
        block_height: block.height,
        block_timestamp: block.timestampNanosec,
        receipt_id: receiptId,
        transaction_hash: null,
        affected_account_id: affectedAccount,
        involved_account_id: involvedAccount,
        direction: Direction.Inbound,
        cause: Cause.ContractReward,
        status: mapExecutionStatus(outcome.executionOutcome.outcome.status),
        delta_staked_amount: staked,
        delta_nonstaked_amount: nonStaked,
        absolute_staked_amount: changesAfterReward.balance.staked,
        absolute_nonstaked_amount: changesAfterReward.balance.nonStaked,
      });
    }
  }

  if (receipts.size) {
    throw new Error(
      `${
        receipts.size
      } changes for transactions were not applied, block_height ${
        block.height
      }, keys: ${JSON.stringify(receipts.keys())}, values: ${JSON.stringify(
        receipts.values(),
      )}`,
    );
  }

  if (rewards.size) {
    throw new Error(
      `${
        rewards.size
      } changes for transactions were not applied, block_height ${
        block.height
      }, keys: ${JSON.stringify(rewards.keys())}, values: ${JSON.stringify(
        rewards.values(),
      )}`,
    );
  }

  return result;
};

const getAccountBalance = async (accountId: string, blockHash: string) => {
  return await retry(async () => {
    const unlock = await redLock('balance', 10);
    const balance = await getBalance(accountId, blockHash);
    await unlock();

    return { accountId, balance };
  });
};

const saveAccountBalance = async (currentBalance: AccountBalance) => {
  return retry(async () => {
    const unlock = await redLock('balance', 10);
    await redis.set(
      currentBalance.accountId,
      JSON.stringify(currentBalance.balance),
    );
    await unlock();
  });
};

const getBalance = async (
  accountId: string,
  blockHash: string,
): Promise<Balance> => {
  const cachedAccount = await redis.get(accountId);

  if (cachedAccount) return JSON.parse(cachedAccount);

  const accountBalance = await getRPCBalance(accountId, blockHash);

  if (accountBalance) {
    await redis.set(accountId, JSON.stringify(accountBalance));
  }

  return accountBalance;
};

const getRPCBalance = async (
  accountId: string,
  blockHash: string,
): Promise<Balance> => {
  const { data } = await viewAccount(accountId, blockHash);

  if (data.result) {
    const account = data.result as AccountView;
    return {
      nonStaked: account.amount,
      staked: account.locked,
    };
  }

  if (data?.error?.cause?.name === 'UNKNOWN_ACCOUNT') {
    return {
      nonStaked: '0',
      staked: '0',
    };
  }

  throw Error(data);
};

const getDeltas = (
  prevBalance: AccountBalance,
  currentBalance: AccountBalance,
) => {
  return {
    staked: (
      BigInt(currentBalance.balance.staked) - BigInt(prevBalance.balance.staked)
    ).toString(),
    nonStaked: (
      BigInt(currentBalance.balance.nonStaked) -
      BigInt(prevBalance.balance.nonStaked)
    ).toString(),
  };
};
