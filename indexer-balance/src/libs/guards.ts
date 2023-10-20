import { StateChangeValueView } from '#ts/enums';
import { AccountDelete, AccountUpdate, StateChange } from '#ts/types';

export const isAccountUpdate = (
  stateChange: StateChange<any>,
): stateChange is StateChange<AccountUpdate> =>
  (stateChange as StateChange<AccountUpdate>).type ===
  StateChangeValueView.AccountUpdate;

export const isAccountDelete = (
  stateChange: StateChange<any>,
): stateChange is StateChange<AccountDelete> =>
  (stateChange as StateChange<AccountDelete>).type ===
  StateChangeValueView.AccountDeletion;
