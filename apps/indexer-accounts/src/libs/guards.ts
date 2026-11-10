import {
  AccessKey,
  AccessKeyFunctionCallPermission,
  Action,
  AddKeyAction,
  DeleteAccountAction,
  DeleteKeyAction,
  DeterministicStateInitAction,
  GasKeyFullAccessPermission,
  GasKeyFunctionCallPermission,
  TransferAction,
  UniversalStateInitAction,
} from 'nb-neardata';

export const isCreateAccountAction = (
  action: Action,
): action is 'CreateAccount' => typeof action === 'string';

export const isTransferAction = (action: Action): action is TransferAction =>
  (action as TransferAction).Transfer !== undefined;

export const isAddKeyAction = (action: Action): action is AddKeyAction =>
  (action as AddKeyAction).AddKey !== undefined;

export const isAccessKeyFunctionCallPermission = (
  accessKeyPermission: AccessKey['permission'],
): accessKeyPermission is AccessKeyFunctionCallPermission =>
  (accessKeyPermission as AccessKeyFunctionCallPermission).FunctionCall !==
  undefined;

export const isGasKeyFullAccessPermission = (
  accessKeyPermission: AccessKey['permission'],
): accessKeyPermission is GasKeyFullAccessPermission =>
  (accessKeyPermission as GasKeyFullAccessPermission).GasKeyFullAccess !==
  undefined;

export const isGasKeyFunctionCallPermission = (
  accessKeyPermission: AccessKey['permission'],
): accessKeyPermission is GasKeyFunctionCallPermission =>
  (accessKeyPermission as GasKeyFunctionCallPermission).GasKeyFunctionCall !==
  undefined;

export const isDeleteKeyAction = (action: Action): action is DeleteKeyAction =>
  (action as DeleteKeyAction).DeleteKey !== undefined;

export const isDeleteAccountAction = (
  action: Action,
): action is DeleteAccountAction =>
  (action as DeleteAccountAction).DeleteAccount !== undefined;

export const isDeterministicStateInitAction = (
  action: Action,
): action is DeterministicStateInitAction =>
  (action as DeterministicStateInitAction).DeterministicStateInit !== undefined;

export const isUniversalStateInitAction = (
  action: Action,
): action is UniversalStateInitAction =>
  (action as UniversalStateInitAction).UniversalStateInit !== undefined;
