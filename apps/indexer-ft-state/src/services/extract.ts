import {
  ExecutionOutcomeWithReceipt,
  Message,
  Receipt,
  Shard,
} from 'nb-neardata';

import {
  isActionReceipt,
  isContractCodeUpdate,
  isDataDeletion,
  isDataUpdate,
  isFunctionCallAction,
} from '#libs/guards';
import { FT_METHODS } from '#services/detect';
import { FTMessage, FTOutcome, FTShard, StateChange } from '#types/types';

const extractReceipt = (receipt: null | Receipt): null | Receipt => {
  if (!receipt || !isActionReceipt(receipt.receipt)) return null;

  const action = receipt.receipt.Action;
  const actions = action.actions.filter(
    (item) =>
      isFunctionCallAction(item) &&
      FT_METHODS.includes(item.FunctionCall.methodName),
  );

  if (!actions.length) return null;

  return { ...receipt, receipt: { Action: { ...action, actions } } };
};

const extractOutcome = (
  outcome: ExecutionOutcomeWithReceipt,
): FTOutcome | null => {
  const { executorId, logs, status } = outcome.executionOutcome.outcome;
  const receipt = extractReceipt(outcome.receipt);

  if (!logs.length && !receipt) return null;

  return {
    executionOutcome: { outcome: { executorId, logs, status } },
    receipt,
  };
};

const extractStateChanges = (
  changes: StateChange<unknown>[],
): StateChange<unknown>[] => {
  const kept: StateChange<unknown>[] = [];

  for (const change of changes) {
    if (isDataUpdate(change) || isDataDeletion(change)) {
      kept.push(change);
    } else if (isContractCodeUpdate(change)) {
      kept.push({ ...change, change: { accountId: change.change.accountId } });
    }
  }

  return kept;
};

const extractShard = (shard: Shard): FTShard => ({
  receiptExecutionOutcomes: shard.receiptExecutionOutcomes.flatMap(
    (outcome) => extractOutcome(outcome) ?? [],
  ),
  shardId: shard.shardId,
  stateChanges: extractStateChanges(
    shard.stateChanges as StateChange<unknown>[],
  ),
});

export const extractMessage = (message: Message): FTMessage => ({
  block: {
    header: {
      height: message.block.header.height,
      timestampNanosec: message.block.header.timestampNanosec,
    },
  },
  shards: message.shards.map(extractShard),
});
