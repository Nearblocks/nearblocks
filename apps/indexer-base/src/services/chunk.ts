import { types } from 'near-lake-framework';

import { Chunk } from 'nb-types';

import { chunkColumns, pgp } from '#libs/pgp';

export const storeChunks = async (message: types.StreamerMessage) => {
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
    return [
      pgp.helpers.insert(data, chunkColumns) +
        ' ON CONFLICT (chunk_hash) DO NOTHING',
    ];
  }

  return [];
};

const getChunkData = (
  blockHash: string,
  blockTimestamp: string,
  chunk: types.Chunk,
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
