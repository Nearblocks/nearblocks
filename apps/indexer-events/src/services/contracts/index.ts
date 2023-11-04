/* eslint-disable perfectionist/sort-objects */
import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { logger } from 'nb-logger';
import { Network } from 'nb-types';

import config from '#config';

import aurora from './aurora.js';
import factoryBridge from './factory.bridge.near.js';
import metaPool from './meta-pool.near.js';
import metaToken from './meta-token.near.js';
import tkn from './tkn.near.js';
import tokenA11bd from './token.a11bd.near.js';
import tokenBurrow from './token.burrow.near.js';
import tokenRefFinance from './token.ref-finance.near.js';
import tokenSkyward from './token.skyward.near.js';
import tokenV2RefFinance from './token.v2.ref-finance.near.js';
import wrap from './wrap.near.js';

export const matchContractEvents = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  if (config.network === Network.TESTNET) return;

  await Promise.all(
    message.shards.map(async (shard) => {
      await Promise.all(
        shard.receiptExecutionOutcomes.map(async (outcome) => {
          if (outcome.receipt) {
            try {
              await matchContract(
                knex,
                message.block.header,
                shard.shardId,
                outcome,
              );
            } catch (error) {
              logger.error(error);
            }
          }
        }),
      );
    }),
  );
};

const matchContract = async (
  knex: Knex,
  blockHeader: types.BlockHeader,
  shardId: number,
  outcome: types.ExecutionOutcomeWithReceipt,
) => {
  const contractId = outcome.executionOutcome.outcome.executorId;

  switch (true) {
    case contractId === 'aurora': {
      return aurora(knex, blockHeader, shardId, outcome);
    }
    case contractId.endsWith('.factory.bridge.near'): {
      return factoryBridge(knex, blockHeader, shardId, outcome);
    }
    case contractId === 'meta-pool.near': {
      return metaPool(knex, blockHeader, shardId, outcome);
    }
    case contractId === 'meta-token.near': {
      return metaToken(knex, blockHeader, shardId, outcome);
    }
    case contractId.endsWith('.tkn.near'): {
      return tkn(knex, blockHeader, shardId, outcome);
    }
    case contractId.endsWith('abr.a11bd.near'):
    case contractId.endsWith('xabr.a11bd.near'):
    case contractId.endsWith('.token.a11bd.near'): {
      return tokenA11bd(knex, blockHeader, shardId, outcome);
    }
    case contractId === 'token.burrow.near': {
      return tokenBurrow(knex, blockHeader, shardId, outcome);
    }
    case contractId === 'token.ref-finance.near': {
      return tokenRefFinance(knex, blockHeader, shardId, outcome);
    }
    case contractId === 'token.skyward.near': {
      return tokenSkyward(knex, blockHeader, shardId, outcome);
    }
    case contractId === 'token.v2.ref-finance.near': {
      return tokenV2RefFinance(knex, blockHeader, shardId, outcome);
    }
    case contractId === 'wrap.near': {
      return wrap(knex, blockHeader, shardId, outcome);
    }
    default: {
      return;
    }
  }
};
