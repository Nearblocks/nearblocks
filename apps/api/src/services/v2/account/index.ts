import { Response } from 'express';
import { providers } from 'near-api-js';

import { Network } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import sql from '#libs/postgres';
import redis from '#libs/redis';
import { Inventory } from '#libs/schema/v2/account';
import { IntentsToken, RequestValidator, RPCResponse } from '#types/types';

const EXPIRY = 60; // 1 mins
const provider = getProvider();

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
          'mt_tokens_for_owner',
          { account_id: account },
        );

        return bytesParse(response.result);
      },
      EXPIRY * 5, // 5 mins
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
      EXPIRY, // 1 min
    );
  } catch (error) {
    return [] as T;
  }
};

const inventory = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.validator.data.account;

    if (config.network !== Network.MAINNET) {
      return res.status(200).json({ inventory: { intents: [] } });
    }

    const nep141 = 'nep141:';
    const tokens = await intentsTokens<IntentsToken[]>(provider, account);
    const tokenIds = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep141));
    const contractIds = tokenIds.map((token) => token.replace(nep141, ''));

    if (!tokenIds.length || !contractIds.length) {
      return res.status(200).json({ inventory: { intents: [] } });
    }

    const [balances, metas] = await Promise.all([
      intentsBalances<string[]>(provider, account, tokenIds),
      sql`
        SELECT
          contract,
          name,
          symbol,
          decimals,
          icon,
          reference,
          price
        FROM
          ft_meta
        WHERE
          contract IN ${sql(contractIds)}
      `,
    ]);

    const intents = tokenIds.map((token, index) => {
      const contract = token.replace(nep141, '');
      const balance = balances?.[index] ?? '0';
      const meta = metas.find((meta) => meta.contract === contract);

      return {
        amount: balance,
        contract,
        ft_meta: meta,
      };
    });

    return res.status(200).json({ inventory: { intents } });
  },
);

export default { inventory };
