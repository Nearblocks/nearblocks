import { Response } from 'express';

import catchAsync from '#libs/async';
import sql from '#libs/postgres';
import { Charts, Item, Txns, TxnsCount } from '#libs/schema/dex';
import { RequestValidator } from '#types/types';

const item = catchAsync(async (req: RequestValidator<Item>, res: Response) => {
  const pair = req.validator.data.pair;

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
      ) ep1d ON TRUE
    where
      p.id = ${pair}
  `;

  return res.status(200).json({ pairs });
});

const txns = catchAsync(async (req: RequestValidator<Txns>, res: Response) => {
  const pair = req.validator.data.pair;
  const a = req.validator.data.a;
  const per_page = req.validator.data.per_page;
  const cursor = req.validator.data.cursor?.replace('n', '');

  const txns = await sql`
    SELECT
      *
    FROM
      dex_events
    WHERE
      pair_id = ${pair}
      AND ${a ? sql`maker = ${a}` : sql`TRUE`}
      AND ${cursor ? sql`event_index < ${cursor}` : sql`TRUE`}
    ORDER BY
      event_index DESC
    LIMIT
      ${per_page}
  `;

  let nextCursor = txns?.[txns?.length - 1]?.event_index;
  nextCursor =
    txns?.length === per_page && nextCursor ? `${nextCursor}n` : undefined;

  return res.status(200).json({ cursor: nextCursor, txns });
});

const txnsCount = catchAsync(
  async (req: RequestValidator<TxnsCount>, res: Response) => {
    const pair = req.validator.data.pair;
    const a = req.validator.data.a;

    const txns = await sql`
      SELECT
        COUNT(pair_id)
      FROM
        dex_events
      WHERE
        pair_id = ${pair}
        AND ${a ? sql`maker = ${a}` : sql`TRUE`}
    `;

    return res.status(200).json({ txns });
  },
);

const charts = catchAsync(
  async (req: RequestValidator<Charts>, res: Response) => {
    const pair = req.validator.data.pair;
    const interval = req.validator.data.interval;
    const limit = req.validator.data.limit;
    const to = req.validator.data.to;

    if (interval === '1h') {
      const charts = await sql`
        SELECT
          *
        FROM
          (
            SELECT
              bucket_1h AS "timestamp",
              open_usd_1h AS open,
              high_usd_1h AS high,
              low_usd_1h AS low,
              close_usd_1h AS "close",
              open_token_1h AS open_token,
              high_token_1h AS high_token,
              low_token_1h AS low_token,
              close_token_1h AS close_token,
              volume_1h AS volume
            FROM
              dex_events_1h
            WHERE
              pair_id = ${pair}
              AND bucket_1h < ${to}
            ORDER BY
              TIMESTAMP DESC
            LIMIT
              ${limit}
          ) t
        ORDER BY
          "timestamp" ASC
      `;

      return res.status(200).json({ charts });
    }

    if (interval === '1d') {
      const charts = await sql`
        SELECT
          *
        FROM
          (
            SELECT
              bucket_1d AS "timestamp",
              open_usd_1d AS open,
              high_usd_1d AS high,
              low_usd_1d AS low,
              close_usd_1d AS "close",
              open_token_1d AS open_token,
              high_token_1d AS high_token,
              low_token_1d AS low_token,
              close_token_1d AS close_token,
              volume_1d AS volume
            FROM
              dex_events_1d
            WHERE
              pair_id = ${pair}
              AND bucket_1d < ${to}
            ORDER BY
              TIMESTAMP DESC
            LIMIT
              ${limit}
          ) t
        ORDER BY
          "timestamp" ASC
      `;

      return res.status(200).json({ charts });
    }

    const charts = await sql`
      SELECT
        *
      FROM
        (
          SELECT
            bucket_1m AS "timestamp",
            open_usd_1m AS open,
            high_usd_1m AS high,
            low_usd_1m AS low,
            close_usd_1m AS "close",
            open_token_1m AS open_token,
            high_token_1m AS high_token,
            low_token_1m AS low_token,
            close_token_1m AS close_token,
            volume_1m AS volume
          FROM
            dex_events_1m
          WHERE
            pair_id = ${pair}
            AND bucket_1m < ${to}
          ORDER BY
            TIMESTAMP DESC
          LIMIT
            ${limit}
        ) t
      ORDER BY
        "timestamp" ASC
    `;

    return res.status(200).json({ charts });
  },
);

export default { charts, item, txns, txnsCount };
