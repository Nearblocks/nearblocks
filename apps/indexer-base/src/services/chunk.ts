import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { Chunk } from 'nb-types';
import { retry } from 'nb-utils';

export const storeChunks = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  const data = message.shards.flatMap((shard) =>
    shard.chunk
      ? getChunkData(
          message.block.header.height,
          message.block.header.timestampNanosec,
          shard.chunk,
        )
      : [],
  );

  if (data.length) {
    await retry(async () => {
      await knex('chunks')
        .insert(data)
        .onConflict(['block_height', 'chunk_hash'])
        .ignore();
    });
  }
};

const getChunkData = (
  blockHeight: number,
  blockTimestamp: string,
  chunk: types.Chunk,
): Chunk => {
  return {
    author_account_id: chunk.author,
    block_height: blockHeight,
    block_timestamp: blockTimestamp,
    chunk_hash: chunk.header.chunkHash,
    gas_limit: chunk.header.gasLimit,
    gas_used: chunk.header.gasUsed,
    shard_id: chunk.header.shardId,
  };
};
