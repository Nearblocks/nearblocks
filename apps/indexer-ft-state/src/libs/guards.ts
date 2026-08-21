import {
  Action,
  ActionReceipt,
  ExecutionStatus,
  FunctionCallAction,
  ReceiptEnum,
} from 'nb-neardata';
import { StateChangeValueView } from 'nb-types';

import {
  AccountUpdate,
  ContractCodeUpdate,
  DataDeletion,
  DataUpdate,
  StateChange,
} from '#types/types';

export const isDataUpdate = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<DataUpdate> =>
  stateChange.type === StateChangeValueView.DataUpdate;

export const isDataDeletion = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<DataDeletion> =>
  stateChange.type === StateChangeValueView.DataDeletion;

export const isAccountUpdate = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<AccountUpdate> =>
  stateChange.type === StateChangeValueView.AccountUpdate;

export const isContractCodeUpdate = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<ContractCodeUpdate> =>
  stateChange.type === StateChangeValueView.ContractCodeUpdate;

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

export const isActionReceipt = (
  receipt: ReceiptEnum,
): receipt is ActionReceipt => (receipt as ActionReceipt).Action !== undefined;

export const isExecutionSuccess = (status: ExecutionStatus): boolean =>
  'SuccessValue' in status || 'SuccessReceiptId' in status;
