import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { Message } from 'nb-neardata';

import config from '#config';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.s3AccessKey,
    secretAccessKey: config.s3SecretKey,
  },
  endpoint: config.s3Endpoint,
  forcePathStyle: true,
  region: config.s3Region,
});

export const uploadJson = async (message: Message) => {
  if (config.disableS3Upload) return;

  const command = new PutObjectCommand({
    Body: JSON.stringify(message),
    Bucket: config.s3Bucket,
    ContentType: 'application/json',
    Key: `${message.block.header.height}.json`,
  });

  await s3Client.send(command);
};
