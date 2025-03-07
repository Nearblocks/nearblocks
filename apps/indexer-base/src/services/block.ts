import { Knex } from 'nb-knex';
import { Block as JBlock, Message, Shard } from 'nb-neardata';
import { Block } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { blockHistogram } from '#libs/prom';

export const storeBlock = async (knex: Knex, message: Message) => {
  const start = performance.now();
  const data = getBlockData(message);

  await retry(async () => {
    await knex('blocks').insert(data).onConflict(['block_hash']).ignore();
  });

  blockHistogram.labels(config.network).observe(performance.now() - start);
};

const getBlockData = (message: Message): Block => {
  const block = message.block;

  return {
    author_account_id: block.author,
    block_bytea: Buffer.from(''),
    block_hash: block.header.hash,
    block_height: block.header.height,
    block_json: null,
    block_timestamp: block.header.timestampNanosec,
    gas_price: block.header.gasPrice,
    prev_block_hash: block.header.prevHash,
    total_supply: block.header.totalSupply,
  };
};

export const cleanupJson = (message: Message) => {
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

const getBlock = (block: JBlock) => {
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

const getChunk = (shard: Shard) => {
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

const getExecutions = (shard: Shard) => {
  return shard.receiptExecutionOutcomes.map((outcomes) => {
    const { proof, ...executionOutcome } = outcomes.executionOutcome;
    const { metadata, ...outcome } = outcomes.executionOutcome.outcome;

    return {
      ...outcomes,
      executionOutcome: { ...executionOutcome, outcome },
    };
  });
};
