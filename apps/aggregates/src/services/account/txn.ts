import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { getLimit } from '#libs/utils';

const TABLE = 'account_stats_new';

export const syncTxnStats = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await txnStats();
  }
};

const txnStats = async () => {
  try {
    const [settings, first, last] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_height')
        .from('blocks')
        .orderBy('block_height', 'asc')
        .limit(1)
        .first(),
      knex
        .select('block_height')
        .from('blocks')
        .orderBy('block_height', 'desc')
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
    let end = +last.block_height - 1;
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
          account,
          SUM(txns_fee) AS txns_fee,
          SUM(txns) AS txns,
          SUM(txns_in) AS txns_in,
          SUM(txns_out) AS txns_out,
          SUM(receipts) AS receipts,
          SUM(receipts_in) AS receipts_in,
          SUM(receipts_out) AS receipts_out,
          date
        FROM
          (
            (
              SELECT
                t.signer_account_id AS account,
                (
                  SELECT
                    COALESCE(receipt_conversion_tokens_burnt, 0) + COALESCE(SUM(tokens_burnt), 0)
                  FROM
                    execution_outcomes e
                    JOIN receipts r ON r.receipt_id = e.receipt_id
                  WHERE
                    r.originated_from_transaction_hash = t.transaction_hash
                ) AS txns_fee,
                0 AS txns,
                0 AS txns_in,
                0 AS txns_out,
                0 AS receipts,
                0 AS receipts_in,
                0 AS receipts_out,
                (
                  TO_TIMESTAMP(t.block_timestamp / 1e9) AT TIME ZONE 'UTC'
                )::DATE AS date
              FROM
                transactions t
                JOIN blocks b ON b.block_hash = t.included_in_block_hash
              WHERE
                b.block_height BETWEEN :start AND :end
            )
            UNION ALL
            (
              SELECT
                account,
                0 AS txns_fee,
                COUNT(DISTINCT transaction_hash) AS txns,
                0 AS txns_in,
                0 AS txns_out,
                0 AS receipts,
                0 AS receipts_in,
                0 AS receipts_out,
                date
              FROM
                (
                  (
                    SELECT
                      t.transaction_hash,
                      t.signer_account_id AS account,
                      (
                        TO_TIMESTAMP(t.block_timestamp / 1e9) AT TIME ZONE 'UTC'
                      )::DATE AS date
                    FROM
                      transactions t
                      JOIN blocks b ON b.block_hash = t.included_in_block_hash
                    WHERE
                      b.block_height BETWEEN :start AND :end
                  )
                  UNION ALL
                  (
                    SELECT
                      t.transaction_hash,
                      t.receiver_account_id AS account,
                      (
                        TO_TIMESTAMP(t.block_timestamp / 1e9) AT TIME ZONE 'UTC'
                      )::DATE AS date
                    FROM
                      transactions t
                      JOIN blocks b ON b.block_hash = t.included_in_block_hash
                    WHERE
                      b.block_height BETWEEN :start AND :end
                  )
                )
              GROUP BY
                account,
                date
            )
            UNION ALL
            (
              SELECT
                t.receiver_account_id AS account,
                0 AS txns_fee,
                0 AS txns,
                COUNT(t.transaction_hash) AS txns_in,
                0 AS txns_out,
                0 AS receipts,
                0 AS receipts_in,
                0 AS receipts_out,
                (
                  TO_TIMESTAMP(t.block_timestamp / 1e9) AT TIME ZONE 'UTC'
                )::DATE AS date
              FROM
                transactions t
                JOIN blocks b ON b.block_hash = t.included_in_block_hash
              WHERE
                b.block_height BETWEEN :start AND :end
              GROUP BY
                account,
                date
            )
            UNION ALL
            (
              SELECT
                t.signer_account_id AS account,
                0 AS txns_fee,
                0 AS txns,
                0 AS txns_in,
                COUNT(t.transaction_hash) AS txns_out,
                0 AS receipts,
                0 AS receipts_in,
                0 AS receipts_out,
                (
                  TO_TIMESTAMP(t.block_timestamp / 1e9) AT TIME ZONE 'UTC'
                )::DATE AS date
              FROM
                transactions t
                JOIN blocks b ON b.block_hash = t.included_in_block_hash
              WHERE
                b.block_height BETWEEN :start AND :end
              GROUP BY
                account,
                date
            )
            UNION ALL
            (
              SELECT
                account,
                0 AS txns_fee,
                0 AS txns,
                0 AS txns_in,
                0 AS txns_out,
                COUNT(DISTINCT receipt_id) AS receipts,
                0 AS receipts_in,
                0 AS receipts_out,
                date
              FROM
                (
                  (
                    SELECT
                      r.receipt_id,
                      r.predecessor_account_id AS account,
                      (
                        TO_TIMESTAMP(r.included_in_block_timestamp / 1e9) AT TIME ZONE 'UTC'
                      )::DATE AS date
                    FROM
                      receipts r
                      JOIN blocks b ON b.block_hash = r.included_in_block_hash
                    WHERE
                      b.block_height BETWEEN :start AND :end
                  )
                  UNION ALL
                  (
                    SELECT
                      r.receipt_id,
                      r.receiver_account_id AS account,
                      (
                        TO_TIMESTAMP(r.included_in_block_timestamp / 1e9) AT TIME ZONE 'UTC'
                      )::DATE AS date
                    FROM
                      receipts r
                      JOIN blocks b ON b.block_hash = r.included_in_block_hash
                    WHERE
                      b.block_height BETWEEN :start AND :end
                  )
                )
              GROUP BY
                account,
                date
            )
            UNION ALL
            (
              SELECT
                r.receiver_account_id AS account,
                0 AS txns_fee,
                0 AS txns,
                0 AS txns_in,
                0 AS txns_out,
                0 AS receipts,
                COUNT(r.receipt_id) AS receipts_in,
                0 AS receipts_out,
                (
                  TO_TIMESTAMP(r.included_in_block_timestamp / 1e9) AT TIME ZONE 'UTC'
                )::DATE AS date
              FROM
                receipts r
                JOIN blocks b ON b.block_hash = r.included_in_block_hash
              WHERE
                b.block_height BETWEEN :start AND :end
              GROUP BY
                account,
                date
            )
            UNION ALL
            (
              SELECT
                r.predecessor_account_id AS account,
                0 AS txns_fee,
                0 AS txns,
                0 AS txns_in,
                0 AS txns_out,
                0 AS receipts,
                0 AS receipts_in,
                COUNT(r.receipt_id) AS receipts_out,
                (
                  TO_TIMESTAMP(r.included_in_block_timestamp / 1e9) AT TIME ZONE 'UTC'
                )::DATE AS date
              FROM
                receipts r
                JOIN blocks b ON b.block_hash = r.included_in_block_hash
              WHERE
                b.block_height BETWEEN :start AND :end
              GROUP BY
                account,
                date
            )
          )
        GROUP BY
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
            .onConflict(['account', 'date'])
            .merge({
              receipts: trx.raw('?? + ?', [
                `${TABLE}.receipts`,
                trx.raw('excluded.receipts'),
              ]),
              receipts_in: trx.raw('?? + ?', [
                `${TABLE}.receipts_in`,
                trx.raw('excluded.receipts_in'),
              ]),
              receipts_out: trx.raw('?? + ?', [
                `${TABLE}.receipts_out`,
                trx.raw('excluded.receipts_out'),
              ]),
              txns: trx.raw('?? + ?', [
                `${TABLE}.txns`,
                trx.raw('excluded.txns'),
              ]),
              txns_fee: trx.raw('?? + ?', [
                `${TABLE}.txns_fee`,
                trx.raw('excluded.txns_fee'),
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
    logger.error(error, 'syncTxnStats');
    Sentry.captureException(error);
    await sleep(5000);
  }
};
