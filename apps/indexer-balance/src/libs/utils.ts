import { ExecutionStatus } from 'nb-blocks-minio';
import { retry, sleep } from 'nb-utils';

import { db } from '#libs/knex';

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};

export const monitorProgress = async (): Promise<void> => {
  let lastBlock: number | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const event = await retry(async () => {
      return db('balance_events')
        .select('block_height')
        .orderBy('block_timestamp', 'desc')
        .first();
    });
    const currentBlock = event?.block_height;

    if (lastBlock && currentBlock && lastBlock === currentBlock) {
      throw new Error('indexing stalled...');
    }

    if (currentBlock) {
      lastBlock = currentBlock;
    }

    await sleep(60_000); // 60s
  }
};
