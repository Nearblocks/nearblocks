import {
  AccessKeyFunctionCallPermission,
  Action,
  AddKeyAction,
  DeleteAccountAction,
  DeleteKeyAction,
  TransferAction,
} from 'nb-blocks-minio';

export const isCreateAccountAction = (
  action: Action,
): action is 'CreateAccount' => typeof action === 'string';

export const isTransferAction = (action: Action): action is TransferAction =>
  (action as TransferAction).Transfer !== undefined;

export const isAddKeyAction = (action: Action): action is AddKeyAction =>
  (action as AddKeyAction).AddKey !== undefined;

export const isAccessKeyFunctionCallPermission = (
  accessKeyPermission: AccessKeyFunctionCallPermission | string,
): accessKeyPermission is AccessKeyFunctionCallPermission =>
  (accessKeyPermission as AccessKeyFunctionCallPermission).FunctionCall !==
  undefined;

export const isDeleteKeyAction = (action: Action): action is DeleteKeyAction =>
  (action as DeleteKeyAction).DeleteKey !== undefined;

export const isDeleteAccountAction = (
  action: Action,
): action is DeleteAccountAction =>
  (action as DeleteAccountAction).DeleteAccount !== undefined;
