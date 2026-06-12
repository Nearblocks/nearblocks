import { readFile } from 'node:fs/promises';

import { Network } from 'nb-types';

const SIGNER_ACCOUNT =
  process.env.NETWORK === Network.MAINNET
    ? 'v1.signer'
    : 'v1.signer-prod.testnet';

export async function up(knex) {
  const sql = await readFile(
    new URL('./20260610000000_signer_caggs.up.sql', import.meta.url),
    'utf8',
  );

  await knex.raw(sql.replaceAll('__SIGNER_ACCOUNT__', SIGNER_ACCOUNT));
}

export function down() {}
