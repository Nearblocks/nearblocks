import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { types } from 'near-lake-framework';

import { Knex } from 'nb-knex';
import { Chunk } from 'nb-types';
import { retry } from 'nb-utils';

const chunkTracer = trace.getTracer('chunk-processor');

export const storeChunks = async (
  knex: Knex,
  message: types.StreamerMessage,
) => {
  const chunkSpan = chunkTracer.startSpan('store.chunks', {
    attributes: {
      'block.hash': message.block.header.hash,
      'block.timestamp': message.block.header.timestampNanosec,
      'chunks.count': message.shards.filter((shard) => shard.chunk).length,
    },
  });

  try {
    await context.with(trace.setSpan(context.active(), chunkSpan), async () => {
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

      chunkSpan.setStatus({ code: SpanStatusCode.OK });
    });
  } catch (error) {
    chunkSpan.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    chunkSpan.end();
  }
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
