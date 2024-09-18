import { createRequire } from 'module';

import Big from 'big.js';

import { ExecutionStatus } from 'nb-neardata';
import { DexEventType, DexPairs } from 'nb-types';

import config from '#config';
import { DexEventIndex } from '#types/enum';
import { DexPairMeta, SwapPair } from '#types/types';

import knex from './knex.js';

const require = createRequire(import.meta.url);
const json = require('nb-json');

export const decodeArgs = <T>(args: string): T =>
  json.parse(decodeSuccessValue(args));

export const decodeSuccessValue = (value: string) =>
  Buffer.from(value, 'base64').toString();

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};

const isNearToken = (token: string) => config.NEAR_TOKEN === token;
const isStableToken = (token: string) => config.STABLE_TOKENS.includes(token);

export const getPair = (token0: string, token1: string) => {
  if (isStableToken(token1)) {
    return [token0, token1];
  }

  if (isStableToken(token0)) {
    return [token1, token0];
  }

  if (isNearToken(token0)) {
    return [token1, token0];
  }

  return [token0, token1];
};

export const getSwapPair = (
  pair: DexPairs,
  amount0: string,
  token0: string,
  amount1: string,
  token1: string,
): SwapPair => {
  if (pair.base === token0) {
    return {
      baseAmount: amount0,
      baseToken: token0,
      quoteAmount: amount1,
      quoteToken: token1,
    };
  }

  return {
    baseAmount: amount1,
    baseToken: token1,
    quoteAmount: amount0,
    quoteToken: token0,
  };
};

export const getPrice = async (
  nearPair: DexPairs | undefined,
  dexPair: DexPairMeta,
  swapPair: SwapPair,
) => {
  const baseAmount = Big(swapPair.baseAmount).div(
    Big(10).pow(dexPair.baseDecimal),
  );
  const quoteAmount = Big(swapPair.quoteAmount).div(
    Big(10).pow(dexPair.quoteDecimal),
  );
  const priceToken = Big(quoteAmount).div(baseAmount);
  const data = {
    baseAmount: baseAmount.round(12).toString(),
    priceToken: priceToken.round(12).toString(),
    quoteAmount: quoteAmount.round(12).toString(),
  };

  if (isStableToken(swapPair.quoteToken)) {
    return {
      ...data,
      amountUsd: quoteAmount.round(12).toString(),
      priceUsd: priceToken.round(12).toString(),
    };
  }

  if (isNearToken(swapPair.quoteToken)) {
    const price = priceToken.mul(nearPair?.price_token ?? 0);

    return {
      ...data,
      amountUsd: baseAmount.mul(price).round(12).toString(),
      priceUsd: price.round(12).toString(),
    };
  }

  const middlePair = await knex('dex_pairs')
    .where('contract', dexPair.contract)
    .where('base', swapPair.quoteToken)
    .where('quote', config.NEAR_TOKEN)
    .orderBy('updated_at', 'desc')
    .first();

  if (middlePair) {
    const price = priceToken.mul(middlePair.price_token ?? 0);

    return {
      ...data,
      amountUsd: baseAmount.mul(price).round(12).toString(),
      priceUsd: price.round(12).toString(),
    };
  }

  return { ...data, amountUsd: '0', priceUsd: '0' };
};

export const getType = (pair: DexPairs, token0: string) => {
  return token0 === pair.base ? DexEventType.SELL : DexEventType.BUY;
};

export const getEventIndex = (
  timestamp: string,
  index: number,
  eventIndex: DexEventIndex,
) => {
  return Big(Big(timestamp).mul(100_000_000).mul(100_000_000))
    .add(Big(eventIndex).mul(1_000_000))
    .add(index)
    .toString();
};
