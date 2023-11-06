import process from 'process';
import { parentPort } from 'worker_threads';

import log from '#libs/log';
import sentry from '#libs/sentry';
import { sleep } from '#libs/utils';
import { syncMeta, unSyncedTokens } from '#services/ftMeta';

(async () => {
  try {
    const contracts = await unSyncedTokens();

    await Promise.all(
      contracts.map(async (contract) => {
        try {
          await syncMeta(contract.emitted_by_contract_account_id);
        } catch (error) {
          log.error(error);
        }
      }),
    );
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
