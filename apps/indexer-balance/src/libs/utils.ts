import { snakeCase, toUpper } from 'lodash-es';

import { ExecutionStatus } from 'nb-blocks';
import { EventStatus, ExecutionOutcomeStatus, JsonValue } from 'nb-types';
import { sleep } from 'nb-utils';

import config from '#config';
import { dbRead } from '#libs/knex';

export const mapStateChangeStatus = (status: ExecutionStatus): EventStatus => {
  const key = toUpper(
    snakeCase(Object.keys(status)[0]),
  ) as keyof typeof ExecutionOutcomeStatus;

  switch (key) {
    case ExecutionOutcomeStatus.FAILURE:
      return EventStatus.FAILURE;
    case ExecutionOutcomeStatus.SUCCESS_VALUE:
    case ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID:
      return EventStatus.SUCCESS;
    default:
      return EventStatus.UNKNOWN;
  }
};

export const monitorProgress = async (): Promise<void> => {
  let lastBlock: JsonValue | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const settings = await dbRead('settings')
      .where({ key: config.indexerKey })
      .first();
    const currentBlock = settings?.value?.sync;

    if (lastBlock && currentBlock && lastBlock === currentBlock) {
      throw new Error('indexing stalled...');
    }

    if (currentBlock) {
      lastBlock = currentBlock;
    }

    await sleep(30_000); // 30s
  }
};
