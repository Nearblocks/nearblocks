import { Response } from 'express';
import { providers } from 'near-api-js';

import { Network } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import redis from '#libs/redis';
import { Inventory } from '#libs/schema/account';
import {
  IntentsToken,
  mtMetadata,
  RequestValidator,
  RPCResponse,
} from '#types/types';

const EXPIRY = 60;
const provider = getProvider();

type MetaRequest = {
  contract: string;
  token_ids: string[];
};

const metadata = catchAsync(
  async (req: RequestValidator<MetaRequest>, res: Response) => {
    const contract = req.query.contract as string;
    const token_ids = (req.query.token_ids as string)?.split(',') ?? [];

    const tokenId = [...token_ids].sort();
    const cacheKey = `nep245:${contract}:meta:${JSON.stringify(tokenId)}`;

    const metas = await redis.cache(
      cacheKey,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          contract,
          'mt_metadata_token_all',
          {
            token_ids: tokenId,
          },
        );

        return bytesParse(response.result) as mtMetadata[];
      },
      EXPIRY,
    );

    return res.status(200).json(metas);
  },
);

export const MTTokens = async <T>(
  provider: providers.JsonRpcProvider,
  account: string,
): Promise<T> => {
  const allTokens = [];
  const contracts = ['intents.near', 'v2.omni.hot.tg'];

  for (const contract of contracts) {
    try {
      const tokens = await redis.cache(
        `${contract}:${account}:tokens`,
        async () => {
          const response: RPCResponse = await callFunction(
            provider,
            contract,
            'mt_tokens_for_owner',
            { account_id: account },
          );
          return bytesParse(response.result);
        },
        EXPIRY * 5,
      );

      for (const token of tokens) {
        allTokens.push({
          ...token,
          token_id: `nep245:${contract}:${token.token_id}`,
        });
      }
    } catch {
      continue;
    }
  }

  return allTokens as T;
};

export const MTBalances = async <T>(
  provider: providers.JsonRpcProvider,
  accountId: string,
  tokenIds: string[],
): Promise<T> => {
  const tokensByContract: Record<string, string[]> = {};

  for (const tokenId of tokenIds) {
    const [, contract, id] = tokenId.split(':');
    if (!tokensByContract[contract]) {
      tokensByContract[contract] = [];
    }
    tokensByContract[contract].push(id);
  }

  const balances: string[] = [];

  for (const [contract, ids] of Object.entries(tokensByContract)) {
    try {
      const result = await redis.cache(
        `${contract}:${accountId}:balances`,
        async () => {
          const response: RPCResponse = await callFunction(
            provider,
            contract,
            'mt_batch_balance_of',
            {
              accounts: [{ account_id: accountId, token_ids: ids }],
            },
          );
          return bytesParse(response.result);
        },
        EXPIRY,
      );
      balances.push(...result);
    } catch {
      balances.push(...ids.map(() => '0'));
    }
  }

  return balances as T;
};

const MT = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.query.account as string;

    if (config.network !== Network.MAINNET) {
      return res.status(200).json({ nep245: { intents: [] } });
    }

    const tokens = await MTTokens<IntentsToken[]>(provider, account);

    const tokenIds = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith('nep245'));

    if (!tokenIds.length) {
      return res.status(200).json({ nep245: { intents: [] } });
    }

    const balances = await MTBalances<string[]>(provider, account, tokenIds);

    const intents = tokenIds.map((token, index) => ({
      amount: balances?.[index] ?? '0',
      token_id: token,
    }));

    return res.status(200).json({ MT: { intents } });
  },
);

export default { metadata, MT };
