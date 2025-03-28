import { Knex } from 'nb-knex';
import { Message } from 'nb-neardata';
import { Block } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { blockHistogram } from '#libs/prom';

export const storeBlock = async (knex: Knex, message: Message) => {
  const start = performance.now();
  const data = getBlockData(message);

  await retry(async () => {
    await knex('blocks').insert(data).onConflict(['block_hash']).ignore();
  });

  blockHistogram.labels(config.network).observe(performance.now() - start);
};

const getBlockData = (message: Message): Block => {
  const block = message.block;

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
