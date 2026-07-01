import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { big, getLimit } from '#libs/utils';

const OFFSET = 3_000_000_000n; // 3s in ns
const TABLE = 'mt_intents_values';
const CONTRACT = 'intents.near';

export const syncMTIntents = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await values();
  }
};

const values = async () => {
  try {
    const [settings, event] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex('settings').where('key', 'events').first(),
    ]);

    const synced = big(settings?.value?.sync as string);
    const last = big(event?.value?.timestamp as string);

    if (!last) {
      logger.warn(`${TABLE}: retrying... ${last}`);
      await sleep(600);

      return;
    }

    let end = last - OFFSET;
    // first run: start from the current tip
    const start = synced ? synced + 1n : end;
    const limit = BigInt(getLimit(start));

    if (end < start) {
      logger.warn(`${TABLE}: retrying... ${start} - ${end}`);
      await sleep(1000);

      return;
    }

    if (end - start > limit) end = start + limit;

    logger.info(`${TABLE}: blocks: ${start} - ${end}`);

    await knex.transaction(async (trx) => {
      await trx.raw(
        `
          INSERT INTO
            ${TABLE} (
              block_timestamp,
              shard_id,
              event_index,
              token_id,
              blockchain,
              affected_account_id,
              involved_account_id,
              cause,
              delta_amount,
              price,
              value
            )
          SELECT
            mt.block_timestamp,
            mt.shard_id,
            mt.event_index,
            mt.token_id,
            it.blockchain,
            mt.affected_account_id,
            mt.involved_account_id,
            mt.cause,
            mt.delta_amount,
            pr.price,
            CASE
              WHEN pr.price IS NOT NULL
              AND it.decimals IS NOT NULL THEN ABS(mt.delta_amount) / POWER(10, it.decimals) * pr.price
            END AS value
          FROM
            mt_events mt
            JOIN mt_intents_tokens it ON it.token = mt.token_id
            LEFT JOIN LATERAL (
              SELECT
                fpd.price
              FROM
                ft_prices_daily fpd
              WHERE
                fpd.coingecko_id = it.coingecko_id
                AND fpd.date <= mt.block_timestamp / 1000000
              ORDER BY
                fpd.date DESC
              LIMIT
                1
            ) pr ON TRUE
          WHERE
            mt.contract_account_id = ?
            AND mt.block_timestamp BETWEEN ? AND ?
          ON CONFLICT (block_timestamp, shard_id, event_index) DO NOTHING
        `,
        [CONTRACT, start.toString(), end.toString()],
      );

      await trx('settings')
        .insert({
          key: TABLE,
          value: { sync: end.toString() },
        })
        .onConflict('key')
        .merge();
    });
  } catch (error) {
    logger.error(error, 'syncMTIntentsValues');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
