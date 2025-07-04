import * as Minio from 'minio';

import { Message } from 'nb-neardata';

import config from '#config';
import { s3Histogram } from '#libs/prom';

export const s3Config = {
  accessKey: config.s3AccessKey,
  endPoint: config.s3Host,
  port: config.s3Port,
  secretKey: config.s3SecretKey,
  useSSL: config.s3UseSsl,
};

const minio = new Minio.Client(s3Config);

export const uploadJson = async (message: Message) => {
  if (config.disableS3Upload) return;

  const start = performance.now();

  await minio.putObject(
    config.s3Bucket,
    `${message.block.header.height}.json`,
    Buffer.from(JSON.stringify(message)),
    undefined,
    { 'Content-Type': 'application/json' },
  );

  s3Histogram.labels(config.network).observe(performance.now() - start);
};
