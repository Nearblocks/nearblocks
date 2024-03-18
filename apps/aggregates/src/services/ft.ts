import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { getLimit } from '#libs/utils';

const TABLE = config.ftHoldersTable;

export const syncFTHolders = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await syncHolders();

    if (resp) break;
  }
};

const syncHolders = async (): Promise<boolean> => {
  try {
    if (!TABLE) {
      logger.warn(`FT_HOLDERS_TABLE not specified`);
      return true;
    }

    const [settings, first, last] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_height')
        .from('ft_events')
        .orderBy('block_height', 'asc')
        .limit(1)
        .first(),
      knex
        .select('block_height')
        .from('ft_events')
        .orderBy('block_height', 'desc')
        .limit(1)
        .first(),
    ]);

    const synced = settings?.value?.sync;

    if (!first || !last) {
      logger.warn(`${TABLE}: retrying... ${JSON.stringify({ first, last })}`);
      await sleep(1000);

      return false;
    }

    const start = synced ? +synced + 1 : +first.block_height;
    let end = +last.block_height - 1;
    const diff = end - start;
    const limit = getLimit(start);

    if (diff < 0) {
      logger.warn(
        `${TABLE}: retrying... ${JSON.stringify({ diff, end, limit, start })}`,
      );
      await sleep(1000);

      return true;
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

      await Promise.all(
        events.map(async (event) => {
          return trx(TABLE)
            .insert({
              account: event.account,
              amount: event.amount,
              contract: event.contract,
            })
            .onConflict(['contract', 'account'])
            .merge({
              amount: trx.raw('?? + ?', [`${TABLE}.amount`, event.amount]),
            });
        }),
      );

      await knex('settings')
        .insert({
          key: TABLE,
          value: { sync: end },
        })
        .onConflict('key')
        .merge();
    });

    return false;
  } catch (error) {
    logger.error({ syncFTHolders: error });
    Sentry.captureException(error);
    await sleep(5000);

    return false;
  }
};
