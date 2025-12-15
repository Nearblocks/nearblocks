import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { logger } from 'nb-logger';
import { retry } from 'nb-utils';

import { config } from '#config.js';
import { Message } from '#types/index.js';

const retries = 3;

const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt, service: 'lake' });
};

export class LakeService {
  private bucketName: string;
  private client: null | S3Client = null;

  constructor() {
    // Only initialize if credentials are provided
    if (config.LAKE_AWS_ACCESS_KEY_ID && config.LAKE_AWS_SECRET_ACCESS_KEY) {
      this.client = new S3Client({
        credentials: {
          accessKeyId: config.LAKE_AWS_ACCESS_KEY_ID,
          secretAccessKey: config.LAKE_AWS_SECRET_ACCESS_KEY,
        },
        region: 'eu-central-1',
        requestHandler: {
          requestTimeout: 30000,
        },
      });
      this.bucketName =
        config.NETWORK === 'mainnet'
          ? 'near-lake-data-mainnet'
          : 'near-lake-data-testnet';
      logger.info({
        bucket: this.bucketName,
        message: 'NEAR Lake service initialized',
      });
    } else {
      this.bucketName = '';
      logger.info('NEAR Lake service disabled (no credentials)');
    }
  }

  async fetchBlock(height: number): Promise<Message | null> {
    if (!this.client) {
      return null;
    }

    try {
      return await retry(
        async () => {
          const blockHeight = String(height).padStart(12, '0');
          const key = `${blockHeight}/block.json`;

          const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          });

          const response = await this.client!.send(command);
          const body = await response.Body?.transformToString();

          if (!body) {
            throw new Error('Empty response body');
          }

          const message: Message = JSON.parse(body);

          return message;
        },
        { exponential: true, logger: retryLogger, retries },
      );
    } catch (error) {
      logger.warn({ error, height, message: 'NEAR Lake fetch failed' });

      return null;
    }
  }
}
