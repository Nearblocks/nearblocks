import { Network } from 'nb-types';

import config from '#config';
import { dbBase } from '#libs/knex';
import { getCirculatingSupply } from '#libs/supply';
import { AccountId, BlockSupply, Raw } from '#types/types';

export const syncNearSupply = async (end: string) => {
  if (config.network === Network.TESTNET) {
    return null;
  }

  const [{ rows: blocks }, { rows: accounts }] = await Promise.all([
    dbBase.raw<Raw<BlockSupply>>(
      `
        SELECT
          block_height,
          block_timestamp,
          total_supply
        FROM
          blocks
        WHERE
          block_timestamp < $1
        ORDER BY
          block_timestamp DESC
        LIMIT
          1
      `,
      [end],
    ),
    dbBase.raw<Raw<AccountId>>(
      `
        SELECT
          account_id
        FROM
          accounts
        WHERE
          parent = 'lockup.near'
        ORDER BY
          account_id
      `,
    ),
  ]);

  if (blocks.length && accounts.length) {
    return await getCirculatingSupply(blocks[0], accounts);
  }

  return null;
};
