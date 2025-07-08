import { Response } from 'express';
import { providers } from 'near-api-js';

import { Network } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import { callFunction, getProvider } from '#libs/near';
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

export function bytesParse<T>(result: Uint8Array): T {
  return JSON.parse(Buffer.from(result).toString());
}

const metadata = catchAsync(
  async (req: RequestValidator<MetaRequest>, res: Response) => {
    const { contract, token_ids } = req.validator.data;

    const safeTokenIds = Array.isArray(token_ids) ? [...token_ids].sort() : [];
    const cacheKey = `nep245:${contract}:meta:${JSON.stringify(safeTokenIds)}`;

    const metas = await redis.cache(
      cacheKey,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          contract,
          'mt_metadata_token_all',
          {
            token_ids: safeTokenIds,
          },
        );

        return bytesParse<mtMetadata[]>(response.result);
      },
      EXPIRY,
    );

    return res.status(200).json(metas);
  },
);

export const intentsTokens = async <T>(
  provider: providers.JsonRpcProvider,
  account: string,
): Promise<T> => {
  try {
    return redis.cache(
      `intents:${account}:tokens`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          'intents.near',
          'mt_tokens',
          { account_id: account },
        );
        return bytesParse(response.result);
      },
      EXPIRY * 5,
    );
  } catch (error) {
    return [] as T;
  }
};

export const intentsBalances = async <T>(
  provider: providers.JsonRpcProvider,
  account_id: string,
  tokenIds: string[],
): Promise<T> => {
  try {
    return redis.cache(
      `intents:${account_id}:balances`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          'intents.near',
          'mt_batch_balance_of',
          {
            accounts: [
              {
                account_id: account_id,
                token_ids: tokenIds,
              },
            ],
          },
        );
        return bytesParse(response.result);
      },
      EXPIRY,
    );
  } catch (error) {
    return [] as T;
  }
};

const nep245 = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.validator.data.account;

    if (config.network !== Network.MAINNET) {
      return res.status(200).json({ nep245: { intents: [] } });
    }

    const tokens = await intentsTokens<IntentsToken[]>(provider, account);

    const tokenIds = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith('nep245'));

    if (!tokenIds.length) {
      return res.status(200).json({ nep245: { intents: [] } });
    }

    const balances = await intentsBalances<string[]>(
      provider,
      account,
      tokenIds,
    );

    const intents = tokenIds.map((token, index) => ({
      amount: balances?.[index] ?? '0',
      token_id: token,
    }));

    return res.status(200).json({ nep245: { intents } });
  },
);

export default { metadata, nep245 };
