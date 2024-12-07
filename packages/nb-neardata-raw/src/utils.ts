import { types } from 'near-lake-framework';

interface CamelCaseObject {
  [key: string]: unknown;
}

const camelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const camelCaseKeys = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys) as T;
  }

  const newObj: CamelCaseObject = {};

  for (const [key, value] of Object.entries(obj)) {
    newObj[camelCase(key)] = camelCaseKeys(value);
  }

  return newObj as T;
};

export const cleanupJson = (data: unknown) => {
  const message = camelCaseKeys(data) as types.StreamerMessage;
  const block = getBlock(message.block);
  const shards = message.shards.map((shard) => {
    return {
      chunk: getChunk(shard),
      receiptExecutionOutcomes: getExecutions(shard),
      shardId: shard.shardId,
      stateChanges: shard.stateChanges,
    };
  });

  return JSON.stringify({ block, shards });
};

const getBlock = (block: types.Block) => {
  const author = block.author;
  const {
    approvals,
    challengesResult,
    chunkMask,
    validatorProposals,
    ...header
  } = block.header;

  return { author, header };
};

const getChunk = (shard: types.Shard) => {
  if (!shard.chunk) return null;

  const transactions = shard.chunk.transactions.map((transaction) => {
    const { proof, ...executionOutcome } = transaction.outcome.executionOutcome;

    return {
      ...transaction,
      outcome: { ...transaction.outcome, executionOutcome },
    };
  });

  return { ...shard.chunk, transactions };
};

const getExecutions = (shard: types.Shard) => {
  return shard.receiptExecutionOutcomes.map((outcomes) => {
    const { proof, ...executionOutcome } = outcomes.executionOutcome;
    const { metadata, ...outcome } = outcomes.executionOutcome.outcome;

    return {
      ...outcomes,
      executionOutcome: { ...executionOutcome, outcome },
    };
  });
};
