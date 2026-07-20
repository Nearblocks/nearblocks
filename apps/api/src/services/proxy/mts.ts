import { Response } from 'express';

import type { MTToken } from 'nb-schemas/dist/mts/tokens/index.js';

import catchAsync from '#libs/async';
import { dbEvents } from '#libs/pgp';
import sql from '#sql/mts';
import { RequestValidator } from '#types/types';

// v2 multi-token endpoints served by reusing the shared v3 mt query modules
// (#sql/mts) directly and reformatting to the legacy v2 JSON shape. No v3
// service file is imported or modified; see the per-handler notes for the
// non-1:1 differences.

type Meta = {
  contract: string;
  token_id: string;
};

/**
 * NEP-245 metadata timestamps are text columns in the indexer. v2 sourced them
 * from the RPC, where they arrive as JSON numbers, so a numeric string is
 * coerced back to a number; a non-numeric value (e.g. an ISO 8601 datetime,
 * which the standard also allows) is passed through unchanged rather than
 * being turned into `0`.
 */
const legacyTimestamp = (value: null | string | undefined) => {
  if (value === null || value === undefined) return null;

  const num = Number(value);

  return Number.isFinite(num) && value.trim() !== '' ? num : value;
};

/**
 * GET /v2/mts/contract/{contract}/{token_id}
 *
 * Non-1:1: **different source**. v2 called `mt_metadata_token_all` live on the
 * contract over RPC; the proxy reads the indexed `mt_base_meta`/`mt_token_meta`
 * rows instead, so an unindexed contract/token returns `{ contracts: [] }`
 * where v2 would have returned whatever the contract reported, and freshly
 * changed on-chain metadata lags the indexer. The flat v3 row is re-nested into
 * the v2 `{ base, token }` pair; `base.id` is the token id (the indexer keys
 * base metadata by contract+token and stores no separate base id).
 * `issued_at`/`starts_at`/`updated_at` are coerced from the indexer's text back
 * to JSON numbers. Only the token whose id was requested is returned, as in v2.
 */
const metadata = catchAsync(
  async (req: RequestValidator<Meta>, res: Response) => {
    const { contract, token_id } = req.validator.data;

    const data = await dbEvents.oneOrNone<MTToken>(sql.tokens.token, {
      contract,
      token: token_id,
    });

    const contracts = data
      ? [
          {
            base: {
              decimals: data.decimals,
              icon: data.icon,
              id: data.token,
              name: data.name,
              symbol: data.symbol,
            },
            token: {
              description: data.description,
              extra: data.extra,
              issued_at: legacyTimestamp(data.issued_at),
              media: data.media,
              starts_at: legacyTimestamp(data.starts_at),
              title: data.title,
              updated_at: legacyTimestamp(data.updated_at),
            },
          },
        ]
      : [];

    return res.status(200).json({ contracts });
  },
);

export default { metadata };
