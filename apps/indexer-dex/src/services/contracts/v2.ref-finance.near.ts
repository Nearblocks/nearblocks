import { types } from 'nb-lake';
import { logger } from 'nb-logger';
import { DexEvents, DexPairs } from 'nb-types';

import config from '#config';
import knex from '#libs/knex';
import {
  decodeArgs,
  decodeSuccessValue,
  getEventIndex,
  getPair,
  getPrice,
  getSwapPair,
  getType,
  isExecutionSuccess,
} from '#libs/utils';
import { DexEventIndex } from '#types/enum';
import {
  DexPairMeta,
  FtOnTransferArgs,
  PoolArgs,
  SwapArgs,
} from '#types/types';

const CONTRACT = 'v2.ref-finance.near';
const EVENT_INDEX = DexEventIndex.V2_REF_FINANCE_NEAR;
const POOL_METHOD = 'add_simple_pool';
const SWAP_METHODS = ['swap', 'ft_on_transfer'];
const SWAP_PATTERN = /^Swapped (\d+) ([\S]+) for (\d+) ([\S]+)/;

export const syncRefFinance = async (message: types.StreamerMessage) => {
  const pairIds = new Set<string>();
  const block = message.block.header.height;
  const poolMap: Map<string, DexPairs> = new Map();

  const swaps = await Promise.all(
    message.shards.flatMap((shard) => {
      return shard.receiptExecutionOutcomes.flatMap((outcome) => {
        if (
          outcome.receipt &&
          outcome.receipt.receiverId === CONTRACT &&
          isExecutionSuccess(outcome.executionOutcome.outcome.status) &&
          'Action' in outcome.receipt.receipt &&
          outcome.receipt.receipt.Action.actions.length
        ) {
          const maker = outcome.receipt.receipt.Action.signerId;

          return outcome.receipt.receipt.Action.actions.flatMap(
            (receiptAction) => {
              if (
                typeof receiptAction !== 'string' &&
                'FunctionCall' in receiptAction
              ) {
                const args = receiptAction.FunctionCall.args;
                const method = receiptAction.FunctionCall.methodName;

                if (method === POOL_METHOD) {
                  const [token0, token1] = decodeArgs<PoolArgs>(args).tokens;
                  const [base, quote] = getPair(token0, token1);

                  if (
                    typeof outcome.executionOutcome.outcome.status !==
                      'string' &&
                    'SuccessValue' in outcome.executionOutcome.outcome.status &&
                    outcome.executionOutcome.outcome.status.SuccessValue
                  ) {
                    const pool = decodeSuccessValue(
                      outcome.executionOutcome.outcome.status.SuccessValue,
                    );
                    const data = {
                      base,
                      contract: CONTRACT,
                      pool,
                      price_token: null,
                      price_usd: null,
                      quote,
                    };

                    logger.info({ new_pool: data });

                    poolMap.set(pool, data);
                  }
                }

                if (
                  outcome.executionOutcome.outcome.logs.length &&
                  SWAP_METHODS.includes(method)
                ) {
                  const logs = outcome.executionOutcome.outcome.logs;
                  const logsFiltered = logs.filter((log) =>
                    SWAP_PATTERN.test(log),
                  );

                  return logsFiltered.flatMap((log, index) => {
                    const match = log.match(SWAP_PATTERN);

                    if (match && BigInt(match[1]) && BigInt(match[3])) {
                      const pool = getPool(method, args, index);

                      if (!pool) {
                        logger.warn({
                          args,
                          block,
                          index,
                          method,
                          receipt: outcome.executionOutcome.id,
                        });
                        throw Error('no pool');
                      }

                      pairIds.add(pool);

                      return {
                        amount0: match[1],
                        amount1: match[3],
                        maker,
                        pool: String(pool),
                        receipt: outcome.executionOutcome.id,
                        timestamp: message.block.header.timestampNanosec,
                        token0: match[2],
                        token1: match[4],
                      };
                    }

                    return [];
                  });
                }
              }

              return [];
            },
          );
        }

        return [];
      });
    }),
  );

  const [pairs, nearPair] = await Promise.all([
    knex('dex_pairs as d')
      .select<DexPairMeta[]>([
        'd.*',
        'b.decimals as baseDecimal',
        'q.decimals as quoteDecimal',
      ])
      .join('ft_meta as b', 'd.base', '=', 'b.contract')
      .join('ft_meta as q', 'd.quote', '=', 'q.contract')
      .where('d.contract', CONTRACT)
      .whereIn('d.pool', [...pairIds]),
    knex('dex_pairs')
      .where('contract', CONTRACT)
      .where('base', config.NEAR_TOKEN)
      .whereIn('quote', config.STABLE_TOKENS)
      .whereNotNull('price_token')
      .orderBy('updated_at', 'desc')
      .first(),
  ]);

  const pairMap = new Map(pairs.map((pair) => [pair.pool, pair]));

  const events = await Promise.all(
    swaps.map(async (swap, index) => {
      const pair = pairMap.get(swap.pool);

      if (!pair) {
        logger.warn({
          block,
          pairIds: [...pairIds],
          pairMap: [...pairMap],
          swap,
        });
        return;
      }

      const swapPair = getSwapPair(
        pair,
        swap.amount0,
        swap.token0,
        swap.amount1,
        swap.token1,
      );
      const price = await getPrice(nearPair, pair, swapPair);

      poolMap.set(swap.pool, {
        base: pair.base,
        contract: pair.contract,
        pool: pair.pool,
        price_token: price.priceToken,
        price_usd: price.priceUsd,
        quote: pair.quote,
        updated_at: knex.raw('now()'),
      });

      return {
        amount_usd: price.amountUsd,
        base_amount: price.baseAmount,
        event_index: getEventIndex(swap.timestamp, index, EVENT_INDEX),
        maker: swap.maker,
        pair_id: pair.id!,
        price_token: price.priceToken,
        price_usd: price.priceUsd,
        quote_amount: price.quoteAmount,
        receipt_id: swap.receipt,
        timestamp: swap.timestamp.slice(0, 10),
        type: getType(pair, swap.token0),
      };
    }),
  );

  const eventsFiltered = events.filter((e) => e) as DexEvents[];
  const pairsSorted = [...poolMap.values()].sort((a, b) => +a.pool - +b.pool);

  if (pairsSorted.length) {
    await knex('dex_pairs')
      .insert(pairsSorted)
      .onConflict(['contract', 'pool'])
      .merge(['price_token', 'price_usd', 'updated_at']);
  }

  if (eventsFiltered.length) {
    await knex('dex_events')
      .insert(eventsFiltered)
      .onConflict(['event_index', 'timestamp'])
      .ignore();
  }
};

const getPool = (method: string, args: string, index: number) => {
  if (method === SWAP_METHODS[0]) {
    const actions = decodeArgs<SwapArgs>(args).actions;
    const action = actions[index];

    return String(action.pool_id);
  }

  if (method === SWAP_METHODS[1]) {
    const decoded = decodeArgs<FtOnTransferArgs>(args);
    const actions = (JSON.parse(decoded.msg.replace(/\\/g, '')) as SwapArgs)
      .actions;
    const action = actions[index];

    return String(action.pool_id);
  }

  return undefined;
};
