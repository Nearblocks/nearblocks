import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { getLimit } from '#libs/utils';

const TABLE = 'account_near_stats_new';

export const syncNearStats = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await nearStats();
  }
};

const nearStats = async () => {
  try {
    const [settings, first, last] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_height')
        .from('balance_events')
        .orderBy('event_index', 'asc')
        .limit(1)
        .first(),
      knex
        .select('block_height')
        .from('balance_events')
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

    const events = await knex('balance_events')
      .distinct('affected_account_id as account')
      .select(
        knex.raw(`
          FIRST_VALUE(absolute_nonstaked_amount) OVER (
            PARTITION BY affected_account_id, (TO_TIMESTAMP(block_timestamp / 1e9) AT TIME ZONE 'UTC')::DATE
            ORDER BY block_timestamp DESC
          ) AS amount
        `),
        knex.raw(`
          FIRST_VALUE(absolute_staked_amount) OVER (
            PARTITION BY affected_account_id, (TO_TIMESTAMP(block_timestamp / 1e9) AT TIME ZONE 'UTC')::DATE
            ORDER BY block_timestamp DESC
          ) AS amount_staked
        `),
        knex.raw(
          `(TO_TIMESTAMP(block_timestamp / 1e9) AT TIME ZONE 'UTC')::DATE AS date`,
        ),
      )
      .whereBetween('block_height', [start, end]);

    await knex.transaction(async (trx) => {
      logger.info(`${TABLE}: events: ${events.length}`);

      if (events.length) {
        const chunkSize = 100;

        for (let i = 0; i < events.length; i += chunkSize) {
          const chunk = events.slice(i, i + chunkSize);

          await trx(TABLE)
            .insert(chunk)
            .onConflict(['account', 'date'])
            .merge({
              amount: trx.raw('excluded.amount'),
              amount_staked: trx.raw('excluded.amount_staked'),
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
    logger.error(error, 'syncAccountNearStats');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
