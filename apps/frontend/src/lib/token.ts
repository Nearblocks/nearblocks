import { AccountAssetFT } from 'nb-schemas';

import { AssetToken, TokenCache } from '@/types/types';

import { toTokenPrice } from './format';
import { tokenBalance } from './rpc';

export const mergeTokens = async (
  account: string,
  tokens: AccountAssetFT[] | null,
  tokensCache: null | TokenCache[],
) => {
  if (!tokens?.length) {
    return [];
  }

  if (!tokensCache?.length) {
    const merged = await Promise.all(
      tokens.map(async (item) => {
        const amount = await tokenBalance(item.contract, account);
        const price =
          item.meta?.price && item.meta?.decimals
            ? toTokenPrice(item.amount, item.meta.decimals, item.meta.price)
            : '0';

        return {
          ...item,
          amount,
          price,
        };
      }),
    );

    return merged;
  }

  const balanceMap = new Map(
    tokensCache.map((item) => [item.contract_id, item.balance]),
  );

  return tokens.map((item) => {
    const price =
      item.meta?.price && item.meta?.decimals
        ? toTokenPrice(item.amount, item.meta.decimals, item.meta.price)
        : '0';

    return {
      ...item,
      amount: balanceMap.get(item.contract) ?? item.amount,
      price,
    };
  });
};

export const sortTokens = (tokens: AssetToken[]) => {
  let amount = 0;

  tokens.sort((a, b) => {
    const priceA = Number(a.price);
    const priceB = Number(b.price);

    if (priceA !== priceB) {
      return priceB - priceA;
    }

    if (priceA === 0) {
      return Number(b.amount) - Number(a.amount);
    }

    return 0;
  });

  for (const item of tokens) {
    amount += Number(item.price);
  }

  return { amount, tokens: tokens };
};
