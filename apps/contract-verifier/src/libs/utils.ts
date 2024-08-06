/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from '#libs/logger';
import Sentry from '#libs/sentry';

export const errorHandler = (error: Error) => {
  logger.error(error);
  Sentry.captureException(error);
};
