import { Request, Response } from 'express';
import { z } from 'zod';

import type { Block } from 'nb-schemas';
import request from 'nb-schemas/dist/blocks/request.js';

import config from '#config';
import catchAsync from '#libs/async';
import cursors from '#libs/cursors';
import { dbBase } from '#libs/pgp';
import { legacyCursor, proxyAsync, toNumber, uncappedNumber } from '#libs/proxy';
import redis from '#libs/redis';
import {
  approximateCount,
  paginateData,
  rollingWindow,
  rollingWindowList,
  windowEnd,
  WindowListQuery,
  windowStart,
} from '#libs/response';
import schema, { Item, Latest, List } from '#libs/schema/blocks';
import sql from '#sql/blocks';
import { RequestValidator } from '#types/types';

// The proxy emits the v3 opaque cursor as the v1 `cursor` field; the legacy v1
// schema constrained `cursor` to the old raw numeric value, so the list schema
// is re-exported with the cursor loosened to any string (route swaps it in when
// the proxy is enabled). Old persisted numeric cursors are rejected as invalid.
const schemas = {
  list: schema.list.extend({ cursor: z.string().optional() }),
};

// v1 blocks endpoints served by reusing the shared v3 block query modules
// (#sql/blocks + #libs/response) directly and reformatting to the legacy v1 JSON
// shape. No v3 service file is imported or modified — all changes are in v1 land.
// The query orchestration below mirrors services/v3/blocks; see the per-handler
// notes for the non-1:1 differences.

type V3ChunksAgg = { count?: number; gas_limit?: string; gas_used?: string };

/**
 * GET /v1/blocks (list)
 *
 * Non-1:1: v3 blocks paginate by opaque `block_timestamp` cursor, so the v1
 * numeric `cursor` (block_height) and `page` are not honoured — the proxy emits
 * and consumes the v3 opaque cursor instead; `per_page` is capped at v3's max
 * of 100. `receipts_agg` is not computed by the v3 list query, so it reports
 * `count: 0` here (use /blocks/{hash} for the value).
 */
const list = proxyAsync(async (req: RequestValidator<List>, res: Response) => {
  const limit = Math.min(req.validator.data.per_page, 100);
  const next = req.validator.data.cursor
    ? cursors.decode(request.cursor, req.validator.data.cursor)
    : null;

  const blocksQuery: WindowListQuery<Block> = (start, end, l) => {
    return dbBase.manyOrNone<Block>(sql.blocks, {
      cursor: { timestamp: next?.timestamp ?? null },
      direction: 'desc',
      end,
      limit: l,
      start,
    });
  };

  const rows = await rollingWindowList<Block>(blocksQuery, {
    direction: 'desc',
    end: windowEnd(next?.timestamp, undefined, 'desc'),
    limit: limit + 1,
    start: windowStart(config.baseStart, next?.timestamp, 'desc'),
  });

  const page = paginateData(
    rows,
    limit,
    'desc',
    (b) => ({ timestamp: b.block_timestamp }),
    !!next,
  );

  const blocks = (page.data ?? []).map((b) => {
    const chunks = (b.chunks_agg ?? {}) as V3ChunksAgg;

    return {
      author_account_id: b.author_account_id,
      block_hash: b.block_hash,
      block_height: b.block_height,
      block_timestamp: b.block_timestamp,
      chunks_agg: {
        gas_limit: toNumber(chunks.gas_limit),
        gas_used: toNumber(chunks.gas_used),
      },
      receipts_agg: { count: 0 },
      transactions_agg: { count: b.transactions_agg?.count ?? 0 },
    };
  });

  return res
    .status(200)
    .json({ blocks, cursor: legacyCursor(page.meta?.next_page) });
});

/**
 * GET /v1/blocks/{hash}
 *
 * v3 returns a single object (or null). v1 wraps it in an array, renames
 * `chunks_agg.count` -> `chunks_agg.shards`, and emits gas as numbers.
 */
const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const input = String(req.validator.data.hash ?? '');
  const hash = input.length >= 43 ? input : null;
  const height = !isNaN(+input) && input !== '' ? +input : null;

  if (!hash && height === null) return res.status(200).json({ blocks: [] });

  const data = await rollingWindow<Block>(
    (start, end) => {
      return dbBase.oneOrNone<Block>(sql.block, { end, hash, height, start });
    },
    { start: config.baseStart },
  );

  if (!data) return res.status(200).json({ blocks: [] });

  const chunks = (data.chunks_agg ?? {}) as V3ChunksAgg;
  const block = {
    author_account_id: data.author_account_id,
    block_hash: data.block_hash,
    block_height: data.block_height,
    block_timestamp: data.block_timestamp,
    chunks_agg: {
      gas_limit: toNumber(chunks.gas_limit),
      gas_used: toNumber(chunks.gas_used),
      shards: chunks.count ?? 0,
    },
    gas_price: data.gas_price,
    prev_block_hash: data.prev_block_hash,
    receipts_agg: { count: data.receipts_agg?.count ?? 0 },
    transactions_agg: { count: data.transactions_agg?.count ?? 0 },
  };

  return res.status(200).json({ blocks: [block] });
});

/**
 * GET /v1/blocks/latest
 *
 * v1 exposes a subset (no `gas_price`; `chunks_agg` carries `gas_used` only).
 */
const latest = catchAsync(
  async (req: RequestValidator<Latest>, res: Response) => {
    const limit = req.validator.data.limit;

    const rollingQuery = rollingWindowList<Block>(
      (start, end) => {
        return dbBase.manyOrNone<Block>(sql.blocks, {
          cursor: { timestamp: null },
          direction: 'desc',
          end,
          limit,
          start,
        });
      },
      { limit, start: config.baseStart },
    );

    const rows = await redis.cache<Block[]>(
      `v3:blocks:latest:${limit}`,
      () => rollingQuery,
      5,
    );

    const blocks = (rows ?? []).map((b) => {
      const chunks = (b.chunks_agg ?? {}) as V3ChunksAgg;

      return {
        author_account_id: b.author_account_id,
        block_hash: b.block_hash,
        block_height: b.block_height,
        block_timestamp: b.block_timestamp,
        chunks_agg: { gas_used: toNumber(chunks.gas_used) },
        transactions_agg: { count: b.transactions_agg?.count ?? 0 },
      };
    });

    return res.status(200).json({ blocks });
  },
);

/**
 * GET /v1/blocks/count
 *
 * Non-1:1: v3 returns an approximate capped string; v1 returns a numeric estimate
 * (exactness above the cap is not recoverable).
 */
const count = catchAsync(async (_req: Request, res: Response) => {
  const result = await dbBase.one<{ count: string }>(sql.countCagg);
  const value = uncappedNumber(approximateCount(result.count));

  return res.status(200).json({ blocks: [{ count: value }] });
});

export default { count, item, latest, list, schemas };
