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

const metaData = catchAsync(
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

export const mtTokens = async <T>(
  provider: providers.JsonRpcProvider,
  account: string,
): Promise<T> => {
  const allTokens = [];

  try {
    const tokens = await redis.cache(
      `${account}:tokens`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          account,
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
        token_id: `nep245:${account}:${token.token_id}`,
      });
    }
  } catch (error) {
    console.error(`Failed to fetch tokens for contract: ${account}`, error);
  }

  return allTokens as T;
};

export const mtBalances = async <T>(
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

const mtInventory = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.query.account as string;

    if (config.network !== Network.MAINNET) {
      return res.status(200).json({ nep245: { intents: [] } });
    }

    const tokens = await mtTokens<IntentsToken[]>(provider, account);

    const tokenIds = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith('nep245'));

    if (!tokenIds.length) {
      return res.status(200).json({ nep245: { intents: [] } });
    }

    const balances = await mtBalances<string[]>(provider, account, tokenIds);

    const intents = await Promise.all(
      tokenIds.map(async (token, index) => {
        const [, contract, id] = token.split(':');

        let meta = null;
        try {
          const response: RPCResponse = await callFunction(
            provider,
            contract,
            'mt_metadata',
            { token_id: id },
          );
          meta = bytesParse(response.result);
        } catch (error) {
          console.error(`mt_metadata failed for ${contract}:${id}`, error);
        }

        return {
          amount: balances?.[index] ?? '0',
          contract,
          meta,
          token_id: token,
        };
      }),
    );

    return res.status(200).json({ inventory: { intents } });
  },
);

export default { metaData, mtInventory };
