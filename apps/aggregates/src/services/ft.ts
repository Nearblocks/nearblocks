import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { big, getLimit } from '#libs/utils';

const OFFSET = 3_000_000_000n; // 3s in ns
const TABLE = 'ft_holders';

export const syncFTHolders = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await holders();
  }
};

const holders = async () => {
  try {
    const [settings, first, event] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_timestamp')
        .from('ft_events')
        .orderBy('block_timestamp', 'asc')
        .limit(1)
        .first(),
      knex('settings').where('key', 'events').first(),
    ]);

    const synced = big(settings?.value?.sync as string);
    const oldest = big(first?.block_timestamp);
    const last = big(event?.value?.timestamp as string);

    if (!oldest || !last) {
      logger.warn(`${TABLE}: retrying... ${oldest} - ${last}}`);
      await sleep(600);

      return;
    }

    const start = synced ? synced + 1n : oldest;
    let end = last - OFFSET;
    const limit = BigInt(getLimit(start));

    if (end < start) {
      logger.warn(`${TABLE}: retrying... ${start} - ${end}`);
      await sleep(600);

      return;
    }

    if (end - start > limit) end = start + limit;

    logger.info(`${TABLE}: blocks: ${start} - ${end}`);

    await knex.transaction(async (trx) => {
      await trx.raw(
        `
          INSERT INTO
            ${TABLE} (contract, account, amount)
          SELECT
            contract_account_id AS contract,
            affected_account_id AS account,
            SUM(delta_amount) AS amount
          FROM
            ft_events
          WHERE
            block_timestamp BETWEEN ? AND ?
          GROUP BY
            1,
            2
          ON CONFLICT (contract, account) DO UPDATE
          SET
            amount = ${TABLE}.amount + EXCLUDED.amount
        `,
        [start.toString(), end.toString()],
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
    logger.error(error, 'syncFTHolders');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
