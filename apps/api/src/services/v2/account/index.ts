import { Response } from 'express';
import { providers } from 'near-api-js';

import catchAsync from '#libs/async';
import { fetchMeta } from '#libs/fetchMeta';
import {
  fetchFtMetadata,
  fetchMtMetadata,
  fetchNftMetadata,
} from '#libs/fetchTokenMeta';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import redis from '#libs/redis';
import { Inventory } from '#libs/schema/v2/account';
import { IntentsToken, RequestValidator, RPCResponse } from '#types/types';

const EXPIRY = 60;
const provider = getProvider();

export const intentsTokens = async <T>(
  provider: providers.JsonRpcProvider,
  account: string,
): Promise<T> => {
  try {
    return redis.cache(
      `${account}:tokens`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          'intents.near',
          'mt_tokens_for_owner',
          {
            account_id: account,
          },
        );
        const tokens = bytesParse(response.result);
        return tokens as T;
      },
      EXPIRY * 5,
    );
  } catch (error) {
    return [] as T;
  }
};

export const mtBalances = async <T>(
  provider: providers.JsonRpcProvider,
  accountId: string,
  tokenId: string,
): Promise<T> => {
  try {
    return redis.cache(
      `mt:${accountId}:${tokenId}:balances`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          'intents.near',
          'mt_balance_of',
          { account_id: accountId, token_id: tokenId },
        );
        return bytesParse(response.result);
      },
      EXPIRY,
    );
  } catch (error) {
    return [] as T;
  }
};

const inventory = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.validator.data.account;

    const nep141 = 'nep141:';
    const nep171 = 'nep171:';
    const nep245 = 'nep245:';

    const tokens = await intentsTokens<IntentsToken[]>(provider, account);

    const tokenIds141 = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep141));

    const tokenIds171 = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep171));

    const tokenIds245 = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep245));

    const [fts, nfts, multitokens] = await Promise.all([
      Promise.all(
        tokenIds141.map(async (token_id) => {
          const contract = token_id.replace(nep141, '');
          const TokenId = `${nep141}intents.near:${contract}`;
          const [meta, amount] = await Promise.all([
            fetchFtMetadata(provider, contract).catch(() => null),
            mtBalances<string>(provider, account, token_id).catch(() => '0'),
          ]);

          return {
            amount,
            contract,
            meta: meta,
            token_id: TokenId,
          };
        }),
      ),

      Promise.all(
        tokenIds171.map(async (token_id) => {
          const contract = token_id.replace(nep171, '').split(':')[0];
          const TokenId = `${nep141}intents.near:${contract}`;
          const [meta, amount] = await Promise.all([
            fetchNftMetadata(provider, contract).catch(() => null),
            mtBalances<string>(provider, account, token_id).catch(() => '0'),
          ]);

          return {
            amount,
            contract,
            meta: meta,
            token_id: TokenId,
          };
        }),
      ),

      Promise.all(
        tokenIds245.map(async (token) => {
          const [contract, id] = token.replace(nep245, '').split(':');
          const [initialMeta, amount] = await Promise.all([
            fetchMeta(contract, id, EXPIRY).catch(() => null),
            mtBalances<string[]>(provider, account, token).catch(() => '0'),
          ]);

          const meta =
            initialMeta ?? (await fetchMtMetadata(provider, contract, id));

          return {
            amount,
            contract,
            meta: meta,
            token_id: token,
          };
        }),
      ),
    ]);

    const combinedInventory = [...fts, ...nfts, ...multitokens];

    return res.status(200).json({
      inventory: {
        mts: combinedInventory,
      },
    });
  },
);
export default { inventory };
