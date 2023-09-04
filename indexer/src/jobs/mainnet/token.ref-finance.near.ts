import { stream, types } from 'near-lake-framework';

import config from '#config';
import knex from '#libs/knex';
import logger from '#libs/log';
import redis from '#libs/redis';
import { sleep } from '#libs/utils';
import contract from '#services/contracts/mainnet/token.ref-finance.near';

const service = 'token.ref-finance.near'; // Contract name
const startsAt = 42150000; // Start from block height
const stopsAt = 99500000; // Stops at block height (optional)

const lakeConfig: types.LakeConfig = {
  s3BucketName: config.s3BucketName,
  s3RegionName: config.s3RegionName,
  startBlockHeight: startsAt,
  blocksPreloadPoolSize: config.preloadSize,
};

const onMessage = async (message: types.StreamerMessage) => {
  await Promise.all(
    message.shards.map(async (shard) => {
      await Promise.all(
        shard.receiptExecutionOutcomes.map(async (outcome) => {
          if (outcome.receipt?.receiverId === service) {
            await contract(knex, message.block.header, shard.shardId, outcome);
          }
        }),
      );
    }),
  );
};

// No need make changes past this line
const handleMessage = async (message: types.StreamerMessage) => {
  try {
    const block = message.block.header.height;

    if (stopsAt && stopsAt + 10 <= block) {
      // Work around to end data streaming until there is a way to interrupt streaming programatically https://github.com/near/near-lake-framework-js/issues/2
      process.exit();
    }

    if (block % 1000 === 0) logger.info(`${service}: syncing block: ${block}`);
    await onMessage(message);
    await redis.set(`job:${service}`, block + 1);
  } catch (error) {
    logger.error(error);
  }
};

const job = async () => {
  lakeConfig.startBlockHeight = startsAt;
  const block = await redis.get(`job:${service}`);

  if (stopsAt && block && stopsAt <= +block) return;

  if (block && +block > startsAt) {
    const next = +block - config.delta;
    const start = next > startsAt ? next : startsAt;
    lakeConfig.startBlockHeight = start;
    logger.info(`${service}: last synced block: ${block}`);
    logger.info(`${service}: syncing from block: ${start}`);
  }

  for await (const message of stream(lakeConfig)) {
    await sleep(50);
    await handleMessage(message);
  }
};

export default job;
