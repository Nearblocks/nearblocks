import { StateChangeValueView } from 'nb-types';

import { AccountDelete, AccountUpdate, StateChange } from '#types/types';

export const isAccountUpdate = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<AccountUpdate> =>
  (stateChange as StateChange<AccountUpdate>).type ===
  StateChangeValueView.AccountUpdate;

export const isAccountDelete = (
  stateChange: StateChange<unknown>,
): stateChange is StateChange<AccountDelete> =>
  (stateChange as StateChange<AccountDelete>).type ===
  StateChangeValueView.AccountDeletion;
