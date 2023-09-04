import { Knex } from 'knex';
import { types } from 'near-lake-framework';

import retry from '#libs/retry';
import { Chunk } from '#ts/types';

export const storeChunks = async (
  knex: Knex,
  blockhash: string,
  shards: types.Shard[],
) => {
  const data = shards.flatMap((shard) =>
    shard.chunk ? getChunkData(blockhash, shard.chunk) : [],
  );

  if (data.length) {
    await retry(async () => {
      await knex('chunks').insert(data).onConflict('chunk_hash').ignore();
    });
  }
};

const getChunkData = (blockHash: string, chunk: types.Chunk): Chunk => {
  return {
    included_in_block_hash: blockHash,
    chunk_hash: chunk.header.chunkHash,
    shard_id: chunk.header.shardId,
    signature: chunk.header.signature,
    gas_limit: chunk.header.gasLimit,
    gas_used: chunk.header.gasUsed,
    author_account_id: chunk.author,
  };
};
