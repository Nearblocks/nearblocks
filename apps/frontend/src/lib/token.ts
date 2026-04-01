import { AccountAssetFT } from 'nb-schemas';

import { AssetToken, TokenCache } from '@/types/types';

import { toTokenPrice } from './format';

type ParsedTokenId =
  | { contract: string; token: string; type: 'nft' }
  | { contract: string; type: 'ft' }
  | { type: 'unknown' };

export const mergeTokens = (
  tokens: AccountAssetFT[] | null,
  tokensCache: TokenCache[],
) => {
  if (!tokens?.length) {
    return [];
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

export const parseMTToken = (token: string): ParsedTokenId => {
  if (/^nep141:/i.test(token)) {
    return { contract: token.slice('nep141:'.length), type: 'ft' };
  }

  if (/^nep171:/i.test(token)) {
    const rest = token.slice('nep171:'.length);
    const sep = rest.indexOf(':');

    if (sep === -1) return { type: 'unknown' };

    return {
      contract: rest.slice(0, sep),
      token: rest.slice(sep + 1),
      type: 'nft',
    };
  }

  if (/^nep245:/i.test(token)) {
    const rest = token.slice('nep245:'.length);
    const sep = rest.indexOf(':');

    if (sep === -1) return { type: 'unknown' };

    const innerPart = rest.slice(sep + 1);
    const inner = parseMTToken(innerPart);

    if (inner.type !== 'unknown') return inner;

    return { type: 'unknown' };
  }

  return { type: 'unknown' };
};
