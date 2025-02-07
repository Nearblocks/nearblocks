import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { getLimit } from '#libs/utils';

const TABLE = 'account_ft_stats_new';

export const syncFTStats = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await ftStats();
  }
};

const ftStats = async () => {
  try {
    const [settings, first, last] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_height')
        .from('ft_events')
        .orderBy('event_index', 'asc')
        .limit(1)
        .first(),
      knex
        .select('block_height')
        .from('ft_events')
        .orderBy('event_index', 'desc')
        .limit(1)
        .first(),
    ]);

    const synced = settings?.value?.sync;

    if (!first || !last) {
      logger.warn(
        `${TABLE}: retrying... ${JSON.stringify({
          first,
          last,
        })}`,
      );
      await sleep(5000);

      return;
    }

    const start = synced ? +synced + 1 : +first.block_height;
    let end = +last.block_height - 5;
    const diff = end - start;
    const limit = getLimit(start);

    if (diff < 0) {
      logger.warn(
        `${TABLE}: retrying... ${JSON.stringify({ diff, end, limit, start })}`,
      );
      await sleep(1000);

      return;
    }

    if (diff > limit) {
      end = start + limit;
    }

    logger.info(`${TABLE}: blocks: ${start} - ${end}`);

    const { rows: events } = await knex.raw(
      `
        SELECT
          contract_account_id AS contract,
          affected_account_id AS account,
          SUM(delta_amount) AS delta_amount,
          COALESCE(
            SUM(delta_amount) FILTER (
              WHERE
                delta_amount > 0
            ),
            0
          ) AS amount_in,
          COALESCE(
            SUM(ABS(delta_amount)) FILTER (
              WHERE
                delta_amount <= 0
            ),
            0
          ) AS amount_out,
          COUNT(*) AS txns,
          COUNT(*) FILTER (
            WHERE
              delta_amount > 0
          ) AS txns_in,
          COUNT(*) FILTER (
            WHERE
              delta_amount <= 0
          ) AS txns_out,
          (
            TO_TIMESTAMP(block_timestamp / 1e9) AT TIME ZONE 'UTC'
          )::DATE AS date
        FROM
          ft_events
        WHERE
          block_height BETWEEN :start AND :end
        GROUP BY
          contract,
          account,
          date
      `,
      { end, start },
    );

    await knex.transaction(async (trx) => {
      logger.info(`${TABLE}: events: ${events.length}`);

      if (events.length) {
        const chunkSize = 100;

        for (let i = 0; i < events.length; i += chunkSize) {
          const chunk = events.slice(i, i + chunkSize);

          await trx(TABLE)
            .insert(chunk)
            .onConflict(['contract', 'account', 'date'])
            .merge({
              amount_in: trx.raw('?? + ?', [
                `${TABLE}.amount_in`,
                trx.raw('excluded.amount_in'),
              ]),
              amount_out: trx.raw('?? + ?', [
                `${TABLE}.amount_out`,
                trx.raw('excluded.amount_out'),
              ]),
              delta_amount: trx.raw('?? + ?', [
                `${TABLE}.delta_amount`,
                trx.raw('excluded.delta_amount'),
              ]),
              txns: trx.raw('?? + ?', [
                `${TABLE}.txns`,
                trx.raw('excluded.txns'),
              ]),
              txns_in: trx.raw('?? + ?', [
                `${TABLE}.txns_in`,
                trx.raw('excluded.txns_in'),
              ]),
              txns_out: trx.raw('?? + ?', [
                `${TABLE}.txns_out`,
                trx.raw('excluded.txns_out'),
              ]),
            });
        }
      }

      await trx('settings')
        .insert({
          key: TABLE,
          value: { sync: end },
        })
        .onConflict('key')
        .merge();
    });
  } catch (error) {
    logger.error(error, 'syncAccountFTStats');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
