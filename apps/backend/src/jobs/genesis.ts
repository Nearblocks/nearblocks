import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import {
  genesisProtocolInfoFetch,
  validatorsTelemetryCheck,
} from '#services/contracts/tasks';

export const task = async () => {
  try {
    logger.info('genesis: job started');
    await Promise.all([genesisProtocolInfoFetch(), validatorsTelemetryCheck()]);
    logger.info('genesis: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('genesis: job error');
    logger.error(error);
  }
};
