import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import retry from '#libs/retry';
import { Block } from '#ts/types';

export const storeBlock = async (knex: Knex, block: types.Block) => {
  const data = getBlockData(block);

  await retry(async () => {
    await knex('blocks').insert(data).onConflict('block_hash').ignore();
  });
};

const getBlockData = (block: types.Block): Block => {
  return {
    block_height: block.header.height,
    block_hash: block.header.hash,
    prev_block_hash: block.header.prevHash,
    block_timestamp: block.header.timestampNanosec,
    total_supply: block.header.totalSupply,
    gas_price: block.header.gasPrice,
    author_account_id: block.author,
  };
};
