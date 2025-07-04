import {
  AccessKeyFunctionCallPermission,
  Action,
  AddKeyAction,
  DelegateAction,
  DeleteAccountAction,
  DeleteKeyAction,
  DeployContractAction,
  DeployGlobalContractAction,
  DeployGlobalContractByAccountIdAction,
  FunctionCallAction,
  StakeAction,
  TransferAction,
  UseGlobalContractAction,
  UseGlobalContractByAccountIdAction,
} from 'nb-blocks-minio';

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

export const isDeployContractAction = (
  action: Action,
): action is DeployContractAction =>
  (action as DeployContractAction).DeployContract !== undefined;

export const isDeployGlobalContractAction = (
  action: Action,
): action is DeployGlobalContractAction =>
  (action as DeployGlobalContractAction).DeployGlobalContract !== undefined;

export const isDeployGlobalContractByAccountIdAction = (
  action: Action,
): action is DeployGlobalContractByAccountIdAction =>
  (action as DeployGlobalContractByAccountIdAction)
    .DeployGlobalContractByAccountId !== undefined;

export const isUseGlobalContractAction = (
  action: Action,
): action is UseGlobalContractAction =>
  (action as UseGlobalContractAction).UseGlobalContract !== undefined;

export const isUseGlobalContractByAccountIdAction = (
  action: Action,
): action is UseGlobalContractByAccountIdAction =>
  (action as UseGlobalContractByAccountIdAction)
    .UseGlobalContractByAccountId !== undefined;

export const isTransferAction = (action: Action): action is TransferAction =>
  (action as TransferAction).Transfer !== undefined;

export const isStakeAction = (action: Action): action is StakeAction =>
  (action as StakeAction).Stake !== undefined;

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

export const isDelegateAction = (action: Action): action is DelegateAction =>
  (action as DelegateAction).Delegate !== undefined;
