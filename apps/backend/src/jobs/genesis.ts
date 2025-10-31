import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import {
  genesisProtocolInfoFetch,
  validatorsTelemetryCheck,
} from '#services/contracts/tasks';

export const task = async () => {
  try {
    logger.info('poolId: job started');
    await Promise.all([genesisProtocolInfoFetch(), validatorsTelemetryCheck()]);
    logger.info('poolId: job ended');
  } catch (error) {
    sentry.captureException(error);
    logger.error('poolId: job error');
    logger.error(error);
  }
};
