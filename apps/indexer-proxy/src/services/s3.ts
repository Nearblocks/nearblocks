import { Agent } from 'https';

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import { config } from '#config.js';
import { Message } from '#types/index.js';

const retries = 3;
const agent = new Agent({ keepAlive: true, timeout: 5_000 });

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt, service: 's3' });
};

export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      },
      endpoint: config.S3_ENDPOINT,
      forcePathStyle: true,
      logger: {
        debug: () => {},
        error: console.error,
        info: () => {},
        warn: console.warn,
      },
      maxAttempts: 1,
      region: config.S3_REGION,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 5_000,
        httpAgent: agent,
        httpsAgent: agent,
        logger: {
          debug: () => {},
          error: console.error,
          info: () => {},
          warn: console.warn,
        },
        requestTimeout: 30_000,
      }),
    });

    logger.info('S3 service initialized');
  }

  async fetchBlock(height: number): Promise<Message | null> {
    try {
      return await retry(
        async () => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 60_000);

          try {
            const response = await this.client.send(
              new GetObjectCommand({
                Bucket: config.S3_BUCKET,
                Key: `${height}.json`,
              }),
              { abortSignal: controller.signal },
            );

            if (!response.Body) {
              throw new Error(`empty response: block: ${height}`);
            }

            const body = await response.Body.transformToString('utf8');

            return JSON.parse(body) as Message;
          } finally {
            clearTimeout(timer);
          }
        },
        { exponential: true, logger: retryLogger, retries },
      );
    } catch (error) {
      logger.warn({ error, height, message: 'S3 fetch failed' });

      return null;
    }
  }

  async uploadBlock(height: number, block: Message): Promise<boolean> {
    try {
      await retry(
        async () => {
          await this.client.send(
            new PutObjectCommand({
              Body: Buffer.from(JSON.stringify(block)),
              Bucket: config.S3_BUCKET,
              ContentType: 'application/json',
              Key: `${height}.json`,
            }),
          );
        },
        {
          exponential: true,
          logger: retryLogger,
          retries: config.S3_UPLOAD_MAX_RETRIES,
        },
      );

      logger.info({ height, message: 'Block uploaded to S3' });

      return true;
    } catch (error) {
      logger.error({ error, height, message: 'S3 upload failed' });

      return false;
    }
  }
}
