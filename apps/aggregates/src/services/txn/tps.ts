import { logger } from 'nb-logger';
import { TPS } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import knex from '#libs/knex';
import Sentry from '#libs/sentry';
import { nsToS, sToNs } from '#libs/utils';

const TABLE = config.tpsTable;

export const syncTPS = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await tps();

    if (resp) break;
  }
};

const tps = async (): Promise<boolean> => {
  try {
    if (!TABLE) {
      logger.warn(`TPS_TABLE not specified...`);
      return true;
    }

    const [settings, last] = await Promise.all([
      knex('settings').where('key', TABLE).first(),
      knex
        .select('block_timestamp')
        .from('transactions')
        .orderBy('block_timestamp', 'desc')
        .limit(1)
        .first(),
    ]);

    if (!last) {
      logger.warn(`${TABLE}: retrying... ${JSON.stringify({ last })}`);
      await sleep(1000);

      return false;
    }

    const end = nsToS(last.block_timestamp) - 1;
    const synced = settings?.value?.sync;
    const start = synced ? +synced + 1 : end;
    const diff = end - start;

    if (diff < 0) {
      logger.warn(
        `${TABLE}: retrying... ${JSON.stringify({ diff, end, start })}`,
      );
      await sleep(1000);

      return false;
    }

    logger.info(`${TABLE}: txns: ${start}`);

    const { rows: txns } = await knex.raw(
      `SELECT
        date,
        SUM(txns) AS txns,
        JSON_AGG(JSON_BUILD_OBJECT('shard', shard, 'txns', txns)) AS shards
      FROM
        (
          SELECT
            chunks.shard_id AS shard,
            COUNT(*) AS txns,
            block_timestamp / 1000000000 AS date
          FROM
            transactions
            JOIN chunks ON chunks.chunk_hash = transactions.included_in_chunk_hash
          WHERE
            block_timestamp >= ?
            AND block_timestamp < ?
          GROUP BY
            chunks.shard_id,
            block_timestamp / 1000000000
        ) AS subquery
      GROUP BY
        date
      ORDER BY
        date`,
      [sToNs(start), sToNs(start + 1)],
    );

    const tps = txns.map((txn: TPS) => {
      return {
        date: txn.date,
        shards: JSON.stringify(txn.shards),
        txns: txn.txns,
      };
    });

    await knex.transaction(async (trx) => {
      logger.info(`${TABLE}: tps: ${txns.length}`);

      if (txns.length) {
        await trx(TABLE).insert(tps).onConflict('date').ignore();
      }

      await trx('settings')
        .insert({
          key: TABLE,
          value: { sync: start },
        })
        .onConflict('key')
        .merge();
    });

    return false;
  } catch (error) {
    logger.error(error, 'syncTxnTPS');
    Sentry.captureException(error);
    await sleep(5000);

    return false;
  }
};
