import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { big, getLimit } from '#libs/utils';

const OFFSET = 3_000_000_000n; // 3s in ns
const TABLE = 'ft_state_holders';
const SOURCE = 'ft_state_balances';
const INDEXER_KEY = 'ft_state';

export const syncFTStateHolders = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await holders();
  }
};

const holders = async () => {
  try {
    const [settings, first, indexer] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_timestamp')
        .from(SOURCE)
        .orderBy('block_timestamp', 'asc')
        .limit(1)
        .first(),
      knex('settings').where('key', INDEXER_KEY).first(),
    ]);

    const synced = big(settings?.value?.sync as string);
    const oldest = big(first?.block_timestamp);
    const last = big(indexer?.value?.timestamp as string);

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
            ${TABLE} (contract, account, amount, block_height)
          SELECT DISTINCT ON (contract_account_id, affected_account_id)
            contract_account_id AS contract,
            affected_account_id AS account,
            absolute_amount AS amount,
            block_height
          FROM
            ${SOURCE} s
          WHERE
            block_timestamp BETWEEN ? AND ?
            AND NOT EXISTS (
              SELECT 1 FROM ft_state_untracked u
              WHERE u.contract = s.contract_account_id
            )
          ORDER BY
            contract_account_id,
            affected_account_id,
            block_timestamp DESC,
            shard_id DESC,
            index_in_chunk DESC
          ON CONFLICT (contract, account) DO UPDATE
          SET
            amount = EXCLUDED.amount,
            block_height = EXCLUDED.block_height
          WHERE
            EXCLUDED.block_height >= ${TABLE}.block_height
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
    logger.error(error, 'syncFTStateHolders');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
