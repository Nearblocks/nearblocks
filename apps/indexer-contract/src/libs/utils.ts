import { snakeCase, toUpper } from 'lodash-es';

import { types } from 'nb-lake';
import { EventStatus, ExecutionOutcomeStatus } from 'nb-types';

export const mapStateChangeStatus = (
  status: types.ExecutionStatus,
): EventStatus => {
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
