import process from 'process';
import { parentPort } from 'worker_threads';

import config from '#config';
import log from '#libs/log';
import sentry from '#libs/sentry';
import { sleep } from '#libs/utils';
import {
  getSearchedTokens,
  getTokens,
  searchContract,
} from '#services/marketSearch';
import { Network } from '#types/enums';

(async () => {
  try {
    if (config.network === Network.TESTNET) return;

    const tokens = await getTokens();
    const searchedTokens = await getSearchedTokens();

    for await (const token of tokens) {
      try {
        await searchContract(token);
        await sleep(1000);
      } catch (error) {
        log.error(error);
      }
    }

    for await (const searchedToken of searchedTokens) {
      try {
        await searchContract(searchedToken);
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
