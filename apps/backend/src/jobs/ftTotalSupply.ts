import process from 'process';
import { parentPort } from 'worker_threads';

import log from '#libs/log';
import sentry from '#libs/sentry';
import { sleep } from '#libs/utils';
import { getTokens, updateTotalSupply } from '#services/ftTotalSupply';

(async () => {
  try {
    const tokens = await getTokens();

    for await (const token of tokens) {
      try {
        await updateTotalSupply(token);
        await sleep(1000);
      } catch (error) {
        log.error(error);
      }
    }
  } catch (error) {
    log.error(error);
    sentry.captureException(error);
    await sleep(1000);
  }

  if (parentPort) {
    return parentPort.postMessage('done');
  }

  return process.exit(0);
})();
