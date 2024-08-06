import { Knex } from 'nb-knex';
import { types } from 'nb-lake';
import { Network } from 'nb-types';

import config from '#config';
import { EventContractParam } from '#types/types';

import aurora from './aurora.js';
import factoryBridge from './factory.bridge.near.js';
import fusotaoToken from './fusotao-token.near.js';
import l2e from './l2e.near.js';
import metaPool from './meta-pool.near.js';
import metaToken from './meta-token.near.js';
import tkn from './tkn.near.js';
import tokenA11bd from './token.a11bd.near.js';
import tokenBurrow from './token.burrow.near.js';
import tokenRefFinance from './token.ref-finance.near.js';
import tokenSkyward from './token.skyward.near.js';
import tokenV2RefFinance from './token.v2.ref-finance.near.js';
import wrap from './wrap.near.js';

export const matchLegacyFTEvents = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  if (config.network === Network.TESTNET) return;

  await Promise.all(
    message.shards.map(async (shard) => {
      const params: EventContractParam = {
        blockHeader: message.block.header,
        knex,
        outcomes: shard.receiptExecutionOutcomes,
        shardId: shard.shardId,
      };

      await Promise.all([
        aurora(params),
        factoryBridge(params),
        fusotaoToken(params),
        l2e(params),
        metaPool(params),
        metaToken(params),
        tkn(params),
        tokenA11bd(params),
        tokenBurrow(params),
        tokenRefFinance(params),
        tokenSkyward(params),
        tokenV2RefFinance(params),
        wrap(params),
      ]);
    }),
  );
};
