import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { big } from '#libs/utils';

const DAY_NS = 86_400_000_000_000n;
const DAY_MS = 86_400_000n;
const SWAPS_TABLE = 'mt_intents_swaps';
const STATS_TABLE = 'mt_intents_stats';
const STATS_REBUILD_DAYS = 2n;
const STATS_CATCHUP_DAYS = 3n;
const STATS_INTERVAL_MS = 60_000;

export const syncIntentsStats = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await stats();
    await sleep(STATS_INTERVAL_MS);
  }
};

const stats = async () => {
  try {
    const [settings, swapsSettings] = await Promise.all([
      knex('settings').where('key', STATS_TABLE).first(),
      knex('settings').where('key', SWAPS_TABLE).first(),
    ]);

    const swapsSynced = big(swapsSettings?.value?.sync as string);

    if (!swapsSynced) return;

    const synced = big(settings?.value?.sync as string);
    const lastDay = (swapsSynced / DAY_NS) * DAY_MS;
    let fromDay = synced ? synced - STATS_REBUILD_DAYS * DAY_MS : null;

    if (!fromDay) {
      const first = await knex
        .select('block_timestamp')
        .from(SWAPS_TABLE)
        .orderBy('block_timestamp', 'asc')
        .limit(1)
        .first();
      const oldest = big(first?.block_timestamp);

      if (!oldest) return;

      fromDay = (oldest / DAY_NS) * DAY_MS;
    }

    const startDay = fromDay > lastDay ? lastDay : fromDay;
    const endDay =
      lastDay - startDay > STATS_CATCHUP_DAYS * DAY_MS
        ? startDay + STATS_CATCHUP_DAYS * DAY_MS
        : lastDay;

    logger.info(`${STATS_TABLE}: days: ${startDay} - ${endDay}`);

    await knex.transaction(async (trx) => {
      await trx.raw(
        `
          INSERT INTO
            ${STATS_TABLE} (date, token_id, blockchain, swaps, volume, fee, price, volume_usd, fee_usd)
          SELECT
            s.date,
            s.token_id,
            it.blockchain,
            s.swaps,
            s.volume / (10::NUMERIC ^ it.decimals) AS volume,
            s.fee / (10::NUMERIC ^ it.decimals) AS fee,
            pr.price,
            s.volume / (10::NUMERIC ^ it.decimals) * pr.price AS volume_usd,
            s.fee / (10::NUMERIC ^ it.decimals) * pr.price AS fee_usd
          FROM
            (
              SELECT
                (block_timestamp / 86400000000000) * 86400000 AS date,
                token_id,
                COUNT(*) FILTER (
                  WHERE
                    delta_amount > 0
                ) AS swaps,
                SUM(delta_amount) FILTER (
                  WHERE
                    delta_amount > 0
                ) AS volume,
                SUM(fee_amount) AS fee
              FROM
                ${SWAPS_TABLE}
              WHERE
                block_timestamp >= ?
                AND block_timestamp < ?
              GROUP BY
                1,
                2
              HAVING
                COUNT(*) FILTER (
                  WHERE
                    delta_amount > 0
                ) > 0
            ) s
            JOIN mt_intents_tokens it ON it.token = s.token_id
            LEFT JOIN LATERAL (
              SELECT
                fpd.price
              FROM
                ft_prices_daily fpd
              WHERE
                fpd.coingecko_id = it.coingecko_id
                AND fpd.date = s.date - 86400000 -- previous day's 00:00 snapshot
              ORDER BY
                fpd.date DESC
              LIMIT
                1
            ) pr ON TRUE
          ON CONFLICT (date, token_id) DO UPDATE
          SET
            blockchain = EXCLUDED.blockchain,
            swaps = EXCLUDED.swaps,
            volume = EXCLUDED.volume,
            fee = EXCLUDED.fee,
            price = EXCLUDED.price,
            volume_usd = EXCLUDED.volume_usd,
            fee_usd = EXCLUDED.fee_usd
        `,
        [
          (startDay * 1_000_000n).toString(),
          ((endDay + DAY_MS) * 1_000_000n).toString(),
        ],
      );

      await trx('settings')
        .insert({
          key: STATS_TABLE,
          value: { sync: endDay.toString() },
        })
        .onConflict('key')
        .merge();
    });
  } catch (error) {
    logger.error(error, 'syncIntentsStats');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
