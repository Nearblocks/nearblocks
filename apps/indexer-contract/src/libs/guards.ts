import {
  Action,
  UseGlobalContractAction,
  UseGlobalContractByAccountIdAction,
} from 'nb-neardata';
import { StateChangeValueView } from 'nb-types';

import { ContractDeletion, ContractUpdate, StateChange } from '#types/types';

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

export const isUseGlobalContractAction = (
  action: Action,
): action is UseGlobalContractAction =>
  (action as UseGlobalContractAction).UseGlobalContract !== undefined;

export const isUseGlobalContractByAccountIdAction = (
  action: Action,
): action is UseGlobalContractByAccountIdAction =>
  (action as UseGlobalContractByAccountIdAction)
    .UseGlobalContractByAccountId !== undefined;
