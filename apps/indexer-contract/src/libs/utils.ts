import { snakeCase, toUpper } from 'lodash-es';

import { ExecutionStatus } from 'nb-blocks';
import { EventStatus, ExecutionOutcomeStatus } from 'nb-types';

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
