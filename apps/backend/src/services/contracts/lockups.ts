import { Network } from 'nb-types';

import config from '#config';
import { dbBase } from '#libs/knex';
import { getCirculatingSupply } from '#libs/supply';
import { AccountId, BlockSupply, Raw } from '#types/types';

export const syncNearSupply = async () => {
  if (config.network === Network.TESTNET) {
    return;
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
        ORDER BY
          block_timestamp DESC
        LIMIT
          1
      `,
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
    const supply = await getCirculatingSupply(blocks[0], accounts);

    await dbBase('stats').update({ circulating_supply: supply });
  }
};
