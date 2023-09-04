import path from 'path';
import { globby } from 'globby';

import log from '#libs/log';
import config from '#config';
import sentry from '#libs/sentry';

export const syncJobs = async () => {
  try {
    const jobs = await globby([`build/src/jobs/${config.network}/*`]);

    await Promise.all(
      jobs.map(async (job) => {
        const { default: contract } = await import(path.resolve(job));
        await contract();
      }),
    );
  } catch (error) {
    log.error(error);
    sentry.captureException(error);
  }
};
