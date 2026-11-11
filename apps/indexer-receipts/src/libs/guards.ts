import {
  AccessKey,
  AccessKeyFunctionCallPermission,
  Action,
  AddKeyAction,
  DelegateAction,
  DelegateV2Action,
  DeleteAccountAction,
  DeleteKeyAction,
  DeployContractAction,
  DeployGlobalContractAction,
  DeployGlobalContractByAccountIdAction,
  DeterministicStateInitAction,
  FunctionCallAction,
  GasKeyFullAccessPermission,
  GasKeyFunctionCallPermission,
  StakeAction,
  TransferAction,
  TransferToGasKeyAction,
  UniversalStateInitAction,
  UseGlobalContractAction,
  UseGlobalContractByAccountIdAction,
  WithdrawFromGasKeyAction,
} from 'nb-neardata';

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

export const isDelegateAction = (action: Action): action is DelegateAction =>
  (action as DelegateAction).Delegate !== undefined;

export const isDelegateV2Action = (
  action: Action,
): action is DelegateV2Action =>
  (action as DelegateV2Action).DelegateV2 !== undefined;

export const isDeterministicStateInitAction = (
  action: Action,
): action is DeterministicStateInitAction =>
  (action as DeterministicStateInitAction).DeterministicStateInit !== undefined;

export const isUniversalStateInitAction = (
  action: Action,
): action is UniversalStateInitAction =>
  (action as UniversalStateInitAction).UniversalStateInit !== undefined;

export const isTransferToGasKeyAction = (
  action: Action,
): action is TransferToGasKeyAction =>
  (action as TransferToGasKeyAction).TransferToGasKey !== undefined;

export const isWithdrawFromGasKeyAction = (
  action: Action,
): action is WithdrawFromGasKeyAction =>
  (action as WithdrawFromGasKeyAction).WithdrawFromGasKey !== undefined;
