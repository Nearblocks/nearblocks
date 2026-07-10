import type {
  KitwalletAccountsReq,
  KitwalletDeposit,
  KitwalletDepositsReq,
  KitwalletTokensFromBlockReq,
  KitwalletTokensReq,
} from 'nb-schemas';
import response from 'nb-schemas/dist/kitwallet/response.js';

import { dbBase, dbEvents, dbStaking } from '#libs/pgp';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';
import sql from '#sql/kitwallet';

const pools = responseHandler(response.pools, async () => {
  const pools = await dbBase.manyOrNone<{ account_id: string }>(sql.pools);

  return pools.map((pool) => pool.account_id);
});

const accounts = responseHandler(
  response.accounts,
  async (req: RequestValidator<KitwalletAccountsReq>) => {
    const accounts = await dbBase.manyOrNone<{ account_id: string }>(
      sql.accounts,
      { key: req.validator.key },
    );

    return accounts.map((account) => account.account_id);
  },
);

const deposits = responseHandler(
  response.deposits,
  async (req: RequestValidator<KitwalletDepositsReq>) => {
    return dbStaking.manyOrNone<KitwalletDeposit>(sql.deposits, {
      account: req.validator.account,
    });
  },
);

const getLastBlockTimestamp = async () => {
  const { block_timestamp: last } = await dbBase.one<{
    block_timestamp: string;
  }>(sql.lastBlock);

  return last;
};

const tokens = responseHandler(
  response.tokens,
  async (req: RequestValidator<KitwalletTokensReq>) => {
    const tokens = await dbEvents.manyOrNone<{ contract_account_id: string }>(
      sql.tokens,
      { account: req.validator.account, last: null },
    );

    return tokens.map((token) => token.contract_account_id);
  },
);

const tokensFromBlock = responseHandler(
  response.tokensFromBlock,
  async (req: RequestValidator<KitwalletTokensFromBlockReq>) => {
    const account = req.validator.account;
    const from = req.validator.fromBlockTimestamp;

    const last = await getLastBlockTimestamp();
    const tokens =
      from === '0'
        ? await dbEvents.manyOrNone<{ contract_account_id: string }>(
            sql.tokens,
            { account, last },
          )
        : await dbEvents.manyOrNone<{ contract_account_id: string }>(
            sql.tokensFrom,
            { account, from, last },
          );

    return {
      lastBlockTimestamp: last,
      list: tokens.map((token) => token.contract_account_id),
      version: '1.0.0',
    };
  },
);

const nfts = responseHandler(
  response.nfts,
  async (req: RequestValidator<KitwalletTokensReq>) => {
    const nfts = await dbEvents.manyOrNone<{ contract_account_id: string }>(
      sql.nfts,
      { account: req.validator.account, from: null, last: null },
    );

    return nfts.map((nft) => nft.contract_account_id);
  },
);

const nftsFromBlock = responseHandler(
  response.nftsFromBlock,
  async (req: RequestValidator<KitwalletTokensFromBlockReq>) => {
    const account = req.validator.account;
    const from = req.validator.fromBlockTimestamp;

    const last = await getLastBlockTimestamp();
    const nfts = await dbEvents.manyOrNone<{ contract_account_id: string }>(
      sql.nfts,
      { account, from, last },
    );

    return {
      lastBlockTimestamp: last,
      list: nfts.map((nft) => nft.contract_account_id),
      version: '1.0.0',
    };
  },
);

export default {
  accounts,
  deposits,
  nfts,
  nftsFromBlock,
  pools,
  tokens,
  tokensFromBlock,
};
