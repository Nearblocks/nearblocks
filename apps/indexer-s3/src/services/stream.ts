import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { stream, types } from 'near-lake-framework';

import { logger } from 'nb-logger';
import { streamBlock } from 'nb-neardata-raw';

import config from '#config';
import { DataSource } from '#types/enum';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.s3AccessKey,
    secretAccessKey: config.s3SecretKey,
  },
  endpoint: config.s3Endpoint,
  forcePathStyle: true,
  region: config.s3Region,
});

const lakeConfig: types.LakeConfig = {
  blocksPreloadPoolSize: config.preloadSize,
  credentials: () =>
    Promise.resolve({
      accessKeyId: config.nearlakeAccessKey,
      secretAccessKey: config.nearlakeSecretKey,
    }),
  s3BucketName: config.nearlakeBucketName,
  s3RegionName: config.nearlakeRegionName,
  startBlockHeight: config.startBlockHeight,
};

if (config.nearlakeEndpoint) {
  lakeConfig.s3ForcePathStyle = true;
  lakeConfig.s3Endpoint = config.nearlakeEndpoint;
}

export const syncData = async () => {
  if (config.dataSource === DataSource.FAST_NEAR_RAW) {
    const stream = streamBlock({
      end: config.endBlockHeight,
      network: config.network,
      start: config.startBlockHeight,
      url: config.fastnearEndpoint,
    });

    stream.on('end', () => {
      logger.error('stream ended');
      process.exit();
    });
    stream.on('error', (error: Error) => {
      logger.error(error);
      process.exit();
    });

    let blocks = [];

    for await (const message of stream) {
      blocks.push(message);

      if (blocks.length >= 10) {
        await onMessage(blocks);
        blocks = [];
      }
    }
  } else {
    let blocks = [];

    for await (const message of stream(lakeConfig)) {
      if (message.block.header.height >= config.endBlockHeight) {
        process.exit();
      }

      blocks.push(message);

      if (blocks.length >= 10) {
        await onMessage(blocks);
        blocks = [];
      }
    }
  }
};

const uploadBlock = async (message: types.StreamerMessage) => {
  const command = new PutObjectCommand({
    Body: JSON.stringify(message),
    Bucket: config.s3Bucket,
    ContentType: 'application/json',
    Key: `${message.block.header.height}.json`,
  });

  await s3Client.send(command);
};

export const onMessage = async (messages: types.StreamerMessage[]) => {
  try {
    const start = performance.now();

    await Promise.all(messages.map((message) => uploadBlock(message)));

    logger.info({
      blocks: `${messages[0].block.header.height} - ${
        messages[messages.length - 1].block.header.height
      }`,
      time: `${performance.now() - start} ms`,
    });
  } catch (error) {
    logger.error(`aborting... blocks ${JSON.stringify(messages)}`);
    logger.error(error);
    process.exit();
  }
};
