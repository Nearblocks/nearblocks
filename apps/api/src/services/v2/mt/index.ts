import { Response } from 'express';
import { providers } from 'near-api-js';
import catchAsync from '#libs/async';
import { callFunction, getProvider } from '#libs/near';
import redis from '#libs/redis';
import {
  IntentsToken,
  mtMetadata,
  RequestValidator,
  RPCResponse,
} from '#types/types';
import { Inventory } from '#libs/schema/account';
import config from '#config';
import { Network } from 'nb-types';

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
  account: string,
  tokenIds: string[],
): Promise<T> => {
  try {
    return redis.cache(
      `intents:${account}:balances`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          'intents.near',
          'mt_batch_balance_of',
          { account_id: account, token_ids: tokenIds },
        );
        return bytesParse(response.result);
      },
      EXPIRY,
    );
  } catch (error) {
    return [] as T;
  }
};

export const intentsMetadata = async <T>(
  provider: providers.JsonRpcProvider,
  tokenIds: string[],
): Promise<T> => {
  try {
    return redis.cache(
      `intents:metadata:${tokenIds.join(',')}`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          'intents.near',
          'mt_tokens',
          { token_ids: tokenIds },
        );
        return bytesParse(response.result);
      },
      EXPIRY * 5,
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

    const nep245 = 'nep245:';
    const tokens = await intentsTokens<IntentsToken[]>(provider, account);

    const tokenIds = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep245));

    if (!tokenIds.length) {
      return res.status(200).json({ nep245: { intents: [] } });
    }

    const [balances, metadata] = await Promise.all([
      intentsBalances<string[]>(provider, account, tokenIds),
      intentsMetadata<
        Array<{ title?: string; description?: string; media?: string }>
      >(provider, tokenIds),
    ]);
    const intents = tokenIds.map((token, index) => {
      const balance = balances?.[index] ?? '0';
      const meta = metadata?.[index] ?? {};

      return {
        amount: balance,
        token_id: token,
        metadata: {
          title: meta.title,
          description: meta.description,
          media: meta.media,
        },
      };
    });

    return res.status(200).json({ nep245: { intents } });
  },
);

export default { nep245, metadata };
