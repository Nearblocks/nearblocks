import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { Block } from 'nb-types';
import { retry } from 'nb-utils';

export const storeBlock = async (knex: Knex, block: types.Block) => {
  const data = getBlockData(block);

  await retry(async () => {
    await knex('blocks').insert(data).onConflict(['block_hash']).ignore();
  });
};

const getBlockData = (block: types.Block): Block => {
  return {
    author_account_id: block.author,
    block_hash: block.header.hash,
    block_height: block.header.height,
    block_timestamp: block.header.timestampNanosec,
    gas_price: block.header.gasPrice,
    prev_block_hash: block.header.prevHash,
    total_supply: block.header.totalSupply,
  };
};
