import { createRequire } from 'module';

import { ExecutionStatus } from 'nb-blocks-minio';
import { logger } from 'nb-logger';

import sentry from '#libs/sentry';

const require = createRequire(import.meta.url);
const json = require('nb-json');

export const jsonParse = (args: string) => json.parse(args);

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  json.parse(Buffer.from(args, 'base64').toString());

export const errorHandler = (error: Error) => {
  logger.error(error);
  sentry.captureException(error);
};

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};
