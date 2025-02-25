import { Knex } from 'nb-knex';
import { Chunk as JChunk, Message } from 'nb-neardata';
import { Chunk } from 'nb-types';
import { retry } from 'nb-utils';

export const storeChunks = async (knex: Knex, message: Message) => {
  const data = message.shards.flatMap((shard) =>
    shard.chunk
      ? getChunkData(
          message.block.header.hash,
          message.block.header.timestampNanosec,
          shard.chunk,
        )
      : [],
  );

  if (data.length) {
    await retry(async () => {
      await knex('chunks').insert(data).onConflict(['chunk_hash']).ignore();
    });
  }
};

const getChunkData = (
  blockHash: string,
  blockTimestamp: string,
  chunk: JChunk,
): Chunk => {
  return {
    author_account_id: chunk.author,
    chunk_hash: chunk.header.chunkHash,
    gas_limit: chunk.header.gasLimit,
    gas_used: chunk.header.gasUsed,
    included_in_block_hash: blockHash,
    included_in_block_timestamp: blockTimestamp,
    shard_id: chunk.header.shardId,
  };
};
