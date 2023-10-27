import { snakeCase, toUpper } from 'lodash-es';
import { types } from 'near-lake-framework';

import { StateChangeStatus } from 'nb-types';

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mapStateChangeStatus = (
  status: types.ExecutionStatus,
): StateChangeStatus => {
  const key = toUpper(
    snakeCase(Object.keys(status)[0]),
  ) as keyof typeof StateChangeStatus;

  return StateChangeStatus[key];
};
