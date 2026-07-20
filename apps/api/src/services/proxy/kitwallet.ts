import { Request, Response } from 'express';

import catchAsync from '#libs/async';
import { dbBase, dbEvents, dbStaking } from '#libs/pgp';
import {
  Accounts,
  Deposits,
  Nfts,
  NftsFromBlock,
  Tokens,
  TokensFromBlock,
} from '#libs/schema/kitwallet';
import sql from '#sql/kitwallet';
import { RequestValidator } from '#types/types';

// v1 kitwallet endpoints served by reusing the shared v3 kitwallet queries
// (#sql/kitwallet) against the split DBs and returning the raw legacy JSON
// shapes (bare arrays / objects, no {data,meta} envelope). No v3 service file
// is imported or modified. The kitwallet endpoints without a v3 query
// (activities, callReceivers, receipts) are wired to the deprecation handler
// in routes/kitwallet.ts.

const getLastBlockTimestamp = async () => {
  const { block_timestamp: last } = await dbBase.one<{
    block_timestamp: string;
  }>(sql.lastBlock);

  return last;
};

/**
 * GET /v1/kitwallet/stakingPools
 */
const pools = catchAsync(async (_req: Request, res: Response) => {
  const pools = await dbBase.manyOrNone<{ account_id: string }>(sql.pools);

  return res.status(200).json(pools.map((pool) => pool.account_id));
});

/**
 * GET /v1/kitwallet/staking-deposits/{account}
 *
 * Non-1:1: sourced from indexed staking_events instead of the legacy
 * action_receipt_actions deposit heuristics — values can differ marginally for
 * exotic pools, and rows are ordered by validator.
 */
const deposits = catchAsync(
  async (req: RequestValidator<Deposits>, res: Response) => {
    const deposits = await dbStaking.manyOrNone<{
      deposit: string;
      validator_id: string;
    }>(sql.deposits, { account: req.validator.data.account });

    return res.status(200).json(deposits);
  },
);

/**
 * GET /v1/kitwallet/publicKey/{key}/accounts
 */
const accounts = catchAsync(
  async (req: RequestValidator<Accounts>, res: Response) => {
    const accounts = await dbBase.manyOrNone<{ account_id: string }>(
      sql.accounts,
      { key: req.validator.data.key },
    );

    return res.status(200).json(accounts.map((account) => account.account_id));
  },
);

/**
 * GET /v1/kitwallet/account/{account}/likelyTokens
 *
 * Non-1:1: v3 derives the list from ft_account_stats (+ last 2 days of
 * ft_events) instead of scanning the full ft_events history.
 */
const tokens = catchAsync(
  async (req: RequestValidator<Tokens>, res: Response) => {
    const tokens = await dbEvents.manyOrNone<{ contract_account_id: string }>(
      sql.tokens,
      { account: req.validator.data.account, last: null },
    );

    return res.status(200).json(tokens.map((t) => t.contract_account_id));
  },
);

/**
 * GET /v1/kitwallet/account/{account}/likelyTokensFromBlock
 */
const tokensFromBlock = catchAsync(
  async (req: RequestValidator<TokensFromBlock>, res: Response) => {
    const account = req.validator.data.account;
    const from = String(req.validator.data.fromBlockTimestamp);

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

    return res.status(200).json({
      lastBlockTimestamp: last,
      list: tokens.map((t) => t.contract_account_id),
      version: '1.0.0',
    });
  },
);

/**
 * GET /v1/kitwallet/account/{account}/likelyNFTs
 */
const nfts = catchAsync(async (req: RequestValidator<Nfts>, res: Response) => {
  const nfts = await dbEvents.manyOrNone<{ contract_account_id: string }>(
    sql.nfts,
    { account: req.validator.data.account, from: null, last: null },
  );

  return res.status(200).json(nfts.map((n) => n.contract_account_id));
});

/**
 * GET /v1/kitwallet/account/{account}/likelyNFTsFromBlock
 */
const nftsFromBlock = catchAsync(
  async (req: RequestValidator<NftsFromBlock>, res: Response) => {
    const account = req.validator.data.account;
    const from = String(req.validator.data.fromBlockTimestamp);

    const last = await getLastBlockTimestamp();
    const nfts = await dbEvents.manyOrNone<{ contract_account_id: string }>(
      sql.nfts,
      { account, from, last },
    );

    return res.status(200).json({
      lastBlockTimestamp: last,
      list: nfts.map((n) => n.contract_account_id),
      version: '1.0.0',
    });
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
