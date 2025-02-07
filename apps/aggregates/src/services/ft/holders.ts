import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { getLimit } from '#libs/utils';

const TABLE = 'ft_holders_new';

export const syncHolders = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await holders();

    if (resp) break;
  }
};

const holders = async (): Promise<boolean> => {
  try {
    if (!TABLE) {
      logger.warn(`FT_HOLDERS_TABLE not specified...`);
      return true;
    }

    const [settings, first, event] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_height')
        .from('ft_events')
        .orderBy('block_height', 'asc')
        .limit(1)
        .first(),
      knex('settings').where('key', 'events').first(),
    ]);

    const synced = settings?.value?.sync;
    const last = event?.value?.sync;

    if (!first || !last) {
      logger.warn(`${TABLE}: retrying... ${JSON.stringify({ first, last })}`);
      await sleep(1000);

      return false;
    }

    const start = synced ? +synced + 1 : +first.block_height;
    let end = +last - 5;
    const diff = end - start;
    const limit = getLimit(start);

    if (diff < 0) {
      logger.warn(
        `${TABLE}: retrying... ${JSON.stringify({ diff, end, limit, start })}`,
      );
      await sleep(1000);

      return false;
    }

    if (diff > limit) {
      end = start + limit;
    }

    logger.info(`${TABLE}: blocks: ${start} - ${end}`);

    const events = await knex
      .select(
        'contract_account_id as contract',
        'affected_account_id as account',
      )
      .from('ft_events')
      .sum('delta_amount as amount')
      .whereBetween('block_height', [start, end])
      .groupBy('contract_account_id', 'affected_account_id');

    await knex.transaction(async (trx) => {
      logger.info(`${TABLE}: events: ${events.length}`);

      if (events.length) {
        const chunkSize = 100;

        for (let i = 0; i < events.length; i += chunkSize) {
          const chunk = events.slice(i, i + chunkSize);

          await trx(TABLE)
            .insert(chunk)
            .onConflict(['contract', 'account'])
            .merge({
              amount: trx.raw('?? + ?', [
                `${TABLE}.amount`,
                trx.raw('excluded.amount'),
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

    return false;
  } catch (error) {
    logger.error(error, 'syncFTHolders');
    Sentry.captureException(error);
    await sleep(5000);

    return false;
  }
};
