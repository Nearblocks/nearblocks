import { types } from 'nb-lake';

export const isExecutionSuccess = (status: types.ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};
