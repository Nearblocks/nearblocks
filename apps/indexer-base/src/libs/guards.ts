import { types } from 'near-lake-framework';

export const isCreateAccountAction = (
  action: types.Action,
): action is 'CreateAccount' => typeof action === 'string';

export const isFunctionCallAction = (
  action: types.Action,
): action is types.FunctionCallAction =>
  (action as types.FunctionCallAction).FunctionCall !== undefined;

export const isDeployContractAction = (
  action: types.Action,
): action is types.DeployContractAction =>
  (action as types.DeployContractAction).DeployContract !== undefined;

export const isTransferAction = (
  action: types.Action,
): action is types.TransferAction =>
  (action as types.TransferAction).Transfer !== undefined;

export const isStakeAction = (
  action: types.Action,
): action is types.StakeAction =>
  (action as types.StakeAction).Stake !== undefined;

export const isAddKeyAction = (
  action: types.Action,
): action is types.AddKeyAction =>
  (action as types.AddKeyAction).AddKey !== undefined;

export const isAccessKeyFunctionCallPermission = (
  accessKeyPermission: string | types.AccessKeyFunctionCallPermission,
): accessKeyPermission is types.AccessKeyFunctionCallPermission =>
  (accessKeyPermission as types.AccessKeyFunctionCallPermission)
    .FunctionCall !== undefined;

export const isDeleteKeyAction = (
  action: types.Action,
): action is types.DeleteKeyAction =>
  (action as types.DeleteKeyAction).DeleteKey !== undefined;

export const isDeleteAccountAction = (
  action: types.Action,
): action is types.DeleteAccountAction =>
  (action as types.DeleteAccountAction).DeleteAccount !== undefined;

export const isDelegateAction = (
  action: types.Action,
): action is types.DelegateAction =>
  (action as types.DelegateAction).Delegate !== undefined;
