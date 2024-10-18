import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { getLimit } from '#libs/utils';

const TABLE = config.nftHoldersTable;

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
      logger.warn(`NFT_HOLDERS_TABLE not specified...`);
      return true;
    }

    const [settings, first, event] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_height')
        .from('nft_events')
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
    let end = +last - 1;
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
        'token_id as token',
        'affected_account_id as account',
      )
      .from('nft_events')
      .sum('delta_amount as quantity')
      .whereBetween('block_height', [start, end])
      .groupBy('contract_account_id', 'token_id', 'affected_account_id');

    await knex.transaction(async (trx) => {
      logger.info(`${TABLE}: events: ${events.length}`);

      if (events.length) {
        await trx(TABLE)
          .insert(events)
          .onConflict(['contract', 'token', 'account'])
          .merge({
            quantity: trx.raw('?? + ?', [
              `${TABLE}.quantity`,
              trx.raw('excluded.quantity'),
            ]),
          });
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
    logger.error(error, 'syncNFTHolders');
    Sentry.captureException(error);
    await sleep(5000);

    return false;
  }
};
