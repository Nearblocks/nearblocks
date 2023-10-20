import { types } from 'near-lake-framework';
import { snakeCase, toUpper } from 'lodash-es';

import { ExecutionOutcomeStatus } from '#ts/enums';

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mapExecutionStatus = (
  status: types.ExecutionStatus,
): ExecutionOutcomeStatus => {
  const key = toUpper(
    snakeCase(Object.keys(status)[0]),
  ) as keyof typeof ExecutionOutcomeStatus;

  return ExecutionOutcomeStatus[key];
};
