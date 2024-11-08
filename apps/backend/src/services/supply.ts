import { Network } from 'nb-types';

import config from '#config';
import knex from '#libs/knex';
import { circulatingSupply } from '#libs/supply';

export const syncCirculatingSupply = async () => {
  const latestBlock = await knex('blocks')
    .orderBy('block_timestamp', 'desc')
    .limit(1)
    .first();

  if (config.network === Network.MAINNET && latestBlock) {
    const supply = await circulatingSupply(latestBlock, config.rpcUrl2);

    await knex('stats').update({ circulating_supply: supply });
  }
};
