import { parentPort } from 'worker_threads';

import knexPkg from 'knex';

import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import config from '#config';
import knex from '#libs/knex';

const { knex: createKnex } = knexPkg;

const oldDb = createKnex({
  client: 'pg',
  connection: config.oldDbUrl,
});

type OldAccount = {
  account_id: string;
  created_by_receipt_id: string;
  deleted_by_receipt_id: string;
  id: number;
  last_update_block_height: string;
};

(async () => {
  logger.info('accounts job started...');
  try {
    const settings = await knex('settings')
      .where({ key: 'deleted-accounts' })
      .first();
    const lastId = settings?.value?.sync ?? 0;

    console.log({ lastId, settings });

    const stream = oldDb
      .select('*')
      .from<OldAccount>('accounts')
      .whereNotNull('deleted_by_receipt_id')
      .whereBetween('id', [lastId, config.lastAccountId])
      .orderBy('id')
      .stream();

    for await (const account of stream) {
      console.log({ account });
      const block = await knex
        .select('b.block_height')
        .join('receipts as r', 'r.receipt_id', '=', 'a.deleted_by_receipt_id')
        .join('blocks as b', 'b.block_hash', '=', 'r.included_in_block_hash')
        .where('r.receipt_id', account.deleted_by_receipt_id)
        .first();

      console.log({ block });
      await knex('settings')
        .insert({
          key: 'deleted-accounts',
          value: { sync: account.id },
        })
        .onConflict('key')
        .merge();

      await sleep(1000);
    }
  } catch (error) {
    console.log({ error });
    await sleep(3000);
  }
  logger.info('accounts job finished...');

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  process.exit(0);
})();
