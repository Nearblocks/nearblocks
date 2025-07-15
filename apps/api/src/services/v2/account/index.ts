import { Response } from 'express';
import { providers } from 'near-api-js';

import { Network } from 'nb-types';

import config from '#config';
import catchAsync from '#libs/async';
import { fetchMeta } from '#libs/fetchMeta';
import { bytesParse, callFunction, getProvider } from '#libs/near';
import sql from '#libs/postgres';
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
          account,
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

export const nftBalanceOf = async <T>(
  provider: providers.JsonRpcProvider,
  contract: string,
  accountId: string,
): Promise<null | T> => {
  try {
    return redis.cache(
      `nft_balance:${contract}:${accountId}`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          contract,
          'nft_balance_of',
          { account_id: accountId },
        );
        return bytesParse(response.result);
      },
      EXPIRY,
    );
  } catch (error) {
    return null;
  }
};

export const mtBalances = async <T>(
  provider: providers.JsonRpcProvider,
  contractId: string,
  accountId: string,
  tokenIds: string[],
): Promise<T> => {
  try {
    return redis.cache(
      `mt:${contractId}:${accountId}:balances`,
      async () => {
        const response: RPCResponse = await callFunction(
          provider,
          contractId,
          'mt_batch_balance_of',
          { account_id: accountId, token_ids: tokenIds },
        );

        return bytesParse(response.result);
      },
      EXPIRY,
    );
  } catch (error) {
    return [] as T;
  }
};

export const ftsBalances = async (
  provider: providers.JsonRpcProvider,
  contract: string,
  account: string,
): Promise<string> => {
  try {
    const response: RPCResponse = await callFunction(
      provider,
      contract,
      'ft_balance_of',
      { account_id: account },
    );
    const parsed = bytesParse(response.result);
    return parsed ?? '0';
  } catch (error) {
    return '0';
  }
};

const inventory = catchAsync(
  async (req: RequestValidator<Inventory>, res: Response) => {
    const account = req.validator.data.account;

    if (config.network !== Network.MAINNET) {
      return res.status(200).json({ inventory: { intents: [], nfts: [] } });
    }

    const nep141 = 'nep141:';
    const nep171 = 'nep171:';
    const nep245 = 'nep245:';

    const tokens = await intentsTokens<IntentsToken[]>(provider, account);

    const tokenIds141 = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep141));

    const contractIds141 = tokenIds141.map((token) =>
      token.replace(nep141, ''),
    );

    const tokenIds171 = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep171));

    const contractIds171 = tokenIds171.map(
      (token) => token.replace(nep171, '').split(':')[0],
    );

    const tokenIds245 = tokens
      .map((token) => token.token_id)
      .filter((token) => token.startsWith(nep245));

    const [balances141, metas141, metas171] = await Promise.all([
      Promise.all(
        contractIds141.map((contract) =>
          ftsBalances(provider, contract, account).catch(() => {
            return '0';
          }),
        ),
      ),
      contractIds141.length
        ? sql`
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
              contract IN ${sql(contractIds141)}
          `
        : Promise.resolve([]),

      contractIds171.length
        ? sql`
            SELECT
              contract,
              name,
              symbol,
              icon,
              base_uri,
              reference
            FROM
              nft_meta
            WHERE
              contract IN ${sql(contractIds171)}
          `
        : Promise.resolve([]),
    ]);

    const multitokens = await Promise.all(
      tokenIds245.map(async (token) => {
        const [contract, id] = token.replace(nep245, '').split(':');

        const [meta, amount] = await Promise.all([
          // Fetch metadata
          (async () => {
            try {
              const metas = await fetchMeta(contract, id, EXPIRY);
              return metas?.[0] ?? null;
            } catch (error) {
              return null;
            }
          })(),

          // Fetch balance
          (async () => {
            try {
              const balances = await mtBalances<string[]>(
                provider,
                contract,
                account,
                [id],
              );
              return balances?.[0] ?? '0';
            } catch (error) {
              return '0';
            }
          })(),
        ]);

        return {
          amount,
          contract,
          meta,
          token_id: token,
        };
      }),
    );

    return res.status(200).json({
      inventory: {
        fts: tokenIds141.map((token_id, index) => {
          const contract = contractIds141[index];
          const Metas141 = Array.isArray(metas141) ? metas141 : [];
          const meta = Metas141.find((m) => m.contract === contract);
          return {
            amount: balances141[index] ?? '0',
            contract,
            meta: meta ?? null,
            token_id,
          };
        }),
        mts: multitokens,
        nfts: await Promise.all(
          contractIds171.map(async (contract) => {
            const meta = metas171.find((m) => m.contract === contract);

            let amount = '0';
            try {
              const balance = await nftBalanceOf<string>(
                provider,
                contract,
                account,
              );
              amount = balance ?? '0';
            } catch (error) {
              return {
                amount: '0',
                contract,
                meta: null,
                token_id: `nep171:${contract}`,
              };
            }

            return {
              amount,
              contract,
              meta: meta ?? null,
              token_id: `nep171:${contract}`,
            };
          }),
        ),
      },
    });
  },
);
export default { inventory };
