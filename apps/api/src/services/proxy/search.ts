import { Response } from 'express';

import type {
  SearchAccount,
  SearchBlock,
  SearchFT,
  SearchMT,
  SearchReceipt,
  SearchTxn,
} from 'nb-schemas';

import config from '#config';
import catchAsync from '#libs/async';
import { dbBase, dbEvents } from '#libs/pgp';
import { rollingWindowList } from '#libs/response';
import { Item } from '#libs/schema/search';
import sql from '#sql/search';
import { RequestValidator } from '#types/types';

// v1 search endpoints served by reusing the shared v3 search queries
// (#sql/search + #libs/response) against the split DBs and reformatting the rows
// into the legacy v1 JSON shape. No v3 service file is imported or modified —
// the keyword classification / query orchestration below mirrors
// services/v3/search.

const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;
const BLOCK_HEIGHT_LIMIT = 1_000_000_000_000n;

const normalizeKeyword = (keyword: string) => keyword.trim();

const isHexAddress = (id: string) => /^0x[a-fA-F0-9]{40}$/.test(id);

const isValidAccountId = (account: string) => {
  return (
    account !== 'system' &&
    account.length >= 2 &&
    account.length <= 64 &&
    ACCOUNT_ID_REGEX.test(account)
  );
};

const isValidBase58Hash = (hash: string) => {
  return hash.length >= 43 && hash.length <= 44 && BASE58_REGEX.test(hash);
};

const isValidBlockHeight = (height: string) => {
  return /^[0-9]+$/.test(height) && BigInt(height) <= BLOCK_HEIGHT_LIMIT;
};

const isValidHexAddress = (address: string) => {
  return /^0x[a-f0-9]{40}$/.test(address);
};

const isValidRlpHash = (hash: string) => {
  return /^0x[a-f0-9]{64}$/.test(hash);
};

const getAccounts = async (keyword: string) => {
  const query = keyword.toLowerCase();

  if (!isValidAccountId(query)) return [];

  return dbBase.manyOrNone<SearchAccount>(sql.accounts, { account: query });
};

const getBlocks = async (keyword: string) => {
  // v1 stripped a leading `0x` before deciding height vs hash — kept for parity.
  const stripped = keyword.replace(/^0x/, '');
  const hash = isValidBase58Hash(keyword) ? keyword : null;
  const height = isValidBlockHeight(stripped) ? +stripped : null;

  if (!hash && height === null) return [];

  return rollingWindowList<SearchBlock>(
    (start, end) => {
      return dbBase.manyOrNone<SearchBlock>(sql.blocks, {
        end,
        hash,
        height,
        limit: 1,
        start,
      });
    },
    { start: config.baseStart },
  );
};

const getFts = async (keyword: string) => {
  const query = keyword.toLowerCase();
  const hex = isValidHexAddress(query) ? query : null;
  const contract = isValidAccountId(query) ? query : null;

  if (!hex && !contract) return [];

  return dbEvents.manyOrNone<SearchFT>(sql.fts, { contract, hex });
};

const getMts = async (keyword: string) => {
  // v1 looked up an MT by a `contract:token_id` keyword over the RPC; the v3
  // query matches the bare `token` in mt_list, so the contract half of the
  // keyword is applied here as a filter to keep the v1 semantics.
  const [contract, token] = keyword.split(':');

  if (!contract || !token || token.length < 2) return [];

  const mts = await dbEvents.manyOrNone<SearchMT>(sql.mts, { keyword: token });

  return mts
    .filter((mt) => mt.contract === contract)
    .map((mt) => ({ contract: mt.contract, token_id: mt.token }));
};

const getReceipts = async (keyword: string) => {
  if (!isValidBase58Hash(keyword)) return [];

  return rollingWindowList<SearchReceipt>(
    (start, end) => {
      return dbBase.manyOrNone<SearchReceipt>(sql.receipts, {
        end,
        limit: 1,
        receipt: keyword,
        start,
      });
    },
    { start: config.baseStart },
  );
};

const getTxns = async (keyword: string) => {
  const query = keyword.toLowerCase();
  const hex = isValidRlpHash(query) ? query : null;
  const hash = isValidBase58Hash(keyword) ? keyword : null;

  if (!hex && !hash) return [];

  return rollingWindowList<SearchTxn>(
    (start, end) => {
      return dbBase.manyOrNone<SearchTxn>(hex ? sql.rlp : sql.txns, {
        end,
        hash: hex ?? hash,
        limit: 1,
        start,
      });
    },
    { start: config.baseStart },
  );
};

/**
 * GET /v1/search/txns
 *
 * Non-1:1: the v3 query classifies the keyword before hitting the DB — a
 * keyword that is neither a base58 hash (43-44 chars) nor a `0x` + 64 hex RLP
 * hash returns `[]` without a query (v1 issued the query regardless). The RLP
 * lookup is also bounded by the rolling window (config.baseStart .. now).
 */
const txns = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const keyword = normalizeKeyword(req.validator.data.keyword);
  const txns = await getTxns(keyword);

  return res.status(200).json({ txns });
});

/**
 * GET /v1/search/blocks
 *
 * Non-1:1: block heights above 1e12 and hashes that are not 43-44 char base58
 * return `[]` without a query. `block_height` stays a string, as in v1.
 */
const blocks = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = normalizeKeyword(req.validator.data.keyword);
    const blocks = await getBlocks(keyword);

    return res.status(200).json({ blocks });
  },
);

/**
 * GET /v1/search/accounts
 *
 * Non-1:1: v1 was an exact `account_id` match (0 or 1 rows) while the v3 query
 * is a fuzzy full-text search returning up to 5 — the result is filtered back
 * to the exact (lower-cased) match so the v1 contract holds.
 */
const accounts = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = normalizeKeyword(req.validator.data.keyword);
    const query = keyword.toLowerCase();
    const matches = await getAccounts(keyword);
    const accounts = matches.filter(
      (account) => account.account_id === query,
    );

    return res.status(200).json({ accounts });
  },
);

/**
 * GET /v1/search/receipts
 *
 * Non-1:1: the v3 query aliases the column to `transaction_hash`; it is renamed
 * back to the v1 `originated_from_transaction_hash`. The lookup is bounded by
 * the rolling window and requires a 43-44 char base58 receipt id.
 */
const receipts = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = normalizeKeyword(req.validator.data.keyword);
    const rows = await getReceipts(keyword);

    const receipts = rows.map((receipt) => ({
      originated_from_transaction_hash: receipt.transaction_hash,
      receipt_id: receipt.receipt_id,
    }));

    return res.status(200).json({ receipts });
  },
);

/**
 * GET /v1/search/tokens
 *
 * Non-1:1: sourced from the v3 FT search (`ft_meta` by `hex_address` /
 * `contract`), which additionally requires `modified_at IS NOT NULL` — a
 * contract whose metadata has never been synced no longer matches. Keywords
 * that are neither a hex address nor a valid account id return `[]`.
 */
const tokens = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = normalizeKeyword(req.validator.data.keyword);
    const tokens = await getFts(keyword);

    return res.status(200).json({ tokens });
  },
);

/**
 * GET /v1/search (combined)
 *
 * Emits the v1 key set verbatim — `accounts`, `blocks`, `mtTokens`, `receipts`,
 * `tokens`, `txns` (the v3 `keys` and `nfts` sub-arrays are not part of the v1
 * response and are not queried).
 *
 * Non-1:1: every per-endpoint note above applies. `mtTokens` changes source
 * from a live NEAR RPC `mt_metadata_token_all` call to the indexed `mt_list`
 * table, so freshness/membership can differ (the `contract:token_id` keyword
 * split and the `{contract, token_id}` shape are preserved). The v1 rule that
 * an FT hex-address hit clears `accounts` is reproduced as-is.
 */
const search = catchAsync(
  async (req: RequestValidator<Item>, res: Response) => {
    const keyword = normalizeKeyword(req.validator.data.keyword);
    const query = keyword.toLowerCase();

    const [accountRows, blocks, receiptRows, ftRows, mtTokens, txns] =
      await Promise.all([
        getAccounts(keyword),
        getBlocks(keyword),
        getReceipts(keyword),
        getFts(keyword),
        getMts(keyword),
        getTxns(keyword),
      ]);

    const accounts = accountRows.filter(
      (account) => account.account_id === query,
    );
    const receipts = receiptRows.map((receipt) => ({
      originated_from_transaction_hash: receipt.transaction_hash,
      receipt_id: receipt.receipt_id,
    }));
    const tokens = ftRows;

    // Same rule as v1: a hex address that resolves to an FT contract cannot
    // also be a NEAR account, so the (practically impossible) account collision
    // is dropped.
    if (tokens.length > 0 && isHexAddress(keyword)) {
      accounts.length = 0;
    }

    return res
      .status(200)
      .json({ accounts, blocks, mtTokens, receipts, tokens, txns });
  },
);

export default { accounts, blocks, receipts, search, tokens, txns };
