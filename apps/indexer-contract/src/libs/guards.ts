import { StateChangeValueView } from 'nb-types';

import {
  ContractDeletion,
  ContractUpdate,
  DataDeletion,
  DataUpdate,
  StateChange,
} from '#types/types';

export const isContractUpdate = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<ContractUpdate> =>
  (stateChange as StateChange<ContractUpdate>).type ===
  StateChangeValueView.ContractCodeUpdate;

export const isContractDeletion = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<ContractDeletion> =>
  (stateChange as StateChange<ContractDeletion>).type ===
  StateChangeValueView.ContractCodeDeletion;

export const isDataUpdate = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<DataUpdate> =>
  (stateChange as StateChange<DataUpdate>).type ===
  StateChangeValueView.DataUpdate;

export const isDataDeletion = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<DataDeletion> =>
  (stateChange as StateChange<DataDeletion>).type ===
  StateChangeValueView.DataDeletion;
