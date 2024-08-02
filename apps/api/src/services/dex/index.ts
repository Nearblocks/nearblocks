import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { Count, List } from '#libs/schema/dex';
import { getPagination } from '#libs/utils';
import { RequestValidator } from '#types/types';

const list = catchAsync(async (req: RequestValidator<List>, res: Response) => {
  const page = req.validator.data.page;
  const per_page = req.validator.data.per_page;
  const sort = req.validator.data.sort;
  const order = req.validator.data.order;
  const search = req.validator.data.search;
  const { limit, offset } = getPagination(page, per_page);

  const pairs = await sql`
    SELECT
      p.id,
      p.contract,
      p.pool,
      p.base,
      p.quote,
      p.price_usd,
      p.price_token,
      JSON_BUILD_OBJECT(
        'name',
        b.name,
        'symbol',
        b.symbol,
        'decimals',
        b.decimals,
        'icon',
        b.icon,
        'reference',
        b.reference
      ) AS base_meta,
      JSON_BUILD_OBJECT(
        'name',
        q.name,
        'symbol',
        q.symbol,
        'decimals',
        q.decimals,
        'icon',
        q.icon,
        'reference',
        q.reference
      ) AS quote_meta,
      COALESCE(ea.volume, 0) AS volume,
      COALESCE(ea.txns, 0) AS txns,
      COALESCE(ea.makers, 0) AS makers,
      COALESCE(ep5m.change, 0) AS change_5m,
      COALESCE(ep1h.change, 0) AS change_1h,
      COALESCE(ep6h.change, 0) AS change_6h,
      COALESCE(ep1d.change, 0) AS change_1d
    FROM
      dex_pairs AS p
      JOIN ft_meta b ON b.contract = p.base
      JOIN ft_meta q ON q.contract = p.quote
      LEFT JOIN LATERAL (
        SELECT
          SUM(e.amount_usd) AS volume,
          COUNT(e.pair_id) AS txns,
          COUNT(DISTINCT e.maker) AS makers
        FROM
          dex_events e
        WHERE
          e.pair_id = p.id
          AND TO_TIMESTAMP(e.timestamp) >= NOW() - INTERVAL '1 day'
      ) ea ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          time_bucket (5 * 60, e.timestamp) bucket,
          e.pair_id,
          CASE
            WHEN FIRST (e.price_usd, e.timestamp) = 0 THEN 0
            ELSE (
              (
                LAST (e.price_usd, e.timestamp) - FIRST (e.price_usd, e.timestamp)
              ) / FIRST (e.price_usd, e.timestamp)
            ) * 100
          END AS change
        FROM
          dex_events e
        WHERE
          e.pair_id = p.id
          AND TO_TIMESTAMP(e.timestamp) >= NOW() - INTERVAL '5 minutes'
        GROUP BY
          bucket,
          pair_id
      ) ep5m ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          time_bucket (60 * 60, e.timestamp) bucket,
          e.pair_id,
          CASE
            WHEN FIRST (e.price_usd, e.timestamp) = 0 THEN 0
            ELSE (
              (
                LAST (e.price_usd, e.timestamp) - FIRST (e.price_usd, e.timestamp)
              ) / FIRST (e.price_usd, e.timestamp)
            ) * 100
          END AS change
        FROM
          dex_events e
        WHERE
          e.pair_id = p.id
          AND TO_TIMESTAMP(e.timestamp) >= NOW() - INTERVAL '1 hour'
        GROUP BY
          bucket,
          pair_id
      ) ep1h ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          time_bucket (6 * 60 * 60, e.timestamp) bucket,
          e.pair_id,
          CASE
            WHEN FIRST (e.price_usd, e.timestamp) = 0 THEN 0
            ELSE (
              (
                LAST (e.price_usd, e.timestamp) - FIRST (e.price_usd, e.timestamp)
              ) / FIRST (e.price_usd, e.timestamp)
            ) * 100
          END AS change
        FROM
          dex_events e
        WHERE
          e.pair_id = p.id
          AND TO_TIMESTAMP(e.timestamp) >= NOW() - INTERVAL '6 hours'
        GROUP BY
          bucket,
          pair_id
      ) ep6h ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          time_bucket (24 * 60 * 60, e.timestamp) bucket,
          e.pair_id,
          CASE
            WHEN FIRST (e.price_usd, e.timestamp) = 0 THEN 0
            ELSE (
              (
                LAST (e.price_usd, e.timestamp) - FIRST (e.price_usd, e.timestamp)
              ) / FIRST (e.price_usd, e.timestamp)
            ) * 100
          END AS change
        FROM
          dex_events e
        WHERE
          e.pair_id = p.id
          AND TO_TIMESTAMP(e.timestamp) >= NOW() - INTERVAL '1 day'
        GROUP BY
          bucket,
          pair_id
      ) ep1d ON TRUE ${search
      ? sql`
          WHERE
            p.contract ILIKE ${search + '%'}
            OR p.base ILIKE ${search + '%'}
            OR p.quote ILIKE ${search + '%'}
            OR b.symbol ILIKE ${search + '%'}
            OR q.symbol ILIKE ${search + '%'}
        `
      : sql``}
    ORDER BY
      ${sql(sort)} ${order === 'desc'
      ? sql`DESC NULLS LAST`
      : sql`ASC NULLS FIRST`},
      id
    LIMIT
      ${limit}
    OFFSET
      ${offset}
  `;

  return res.status(200).json({ pairs });
});

const count = catchAsync(
  async (req: RequestValidator<Count>, res: Response) => {
    const search = req.validator.data.search;

    const pairs = await sql`
      SELECT
        COUNT(*)
      FROM
        (
          SELECT
            p.id
          FROM
            dex_pairs p
            JOIN ft_meta b ON b.contract = p.base
            JOIN ft_meta q ON q.contract = p.quote ${search
        ? sql`
            WHERE
              p.contract ILIKE ${search + '%'}
              OR p.base ILIKE ${search + '%'}
              OR p.quote ILIKE ${search + '%'}
              OR b.symbol ILIKE ${search + '%'}
              OR q.symbol ILIKE ${search + '%'}
          `
        : sql``}
        ) AS temp
    `;

    return res.status(200).json({ pairs });
  },
);

export default { count, list };
