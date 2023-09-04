import { types } from 'near-lake-framework';

import { FtLogKind, NftLogKind } from '#ts/enums';
import {
  FtEventLogs,
  NftEventLogs,
  FtBurnEventLog,
  FtMintEventLog,
  NftMintEventLog,
  NftBurnEventLog,
  FtTransferEventLog,
  NftTransferEventLog,
} from '#ts/types';

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

export const isFtMintEventLog = (
  log: FtEventLogs | NftEventLogs,
): log is FtMintEventLog => log.event === FtLogKind.MINT;

export const isFtBurnEventLog = (
  log: FtEventLogs | NftEventLogs,
): log is FtBurnEventLog => log.event === FtLogKind.BURN;

export const isFtTransferEventLog = (
  log: FtEventLogs | NftEventLogs,
): log is FtTransferEventLog => log.event === FtLogKind.TRANSFER;

export const isNftMintEventLog = (
  log: FtEventLogs | NftEventLogs,
): log is NftMintEventLog => log.event === NftLogKind.MINT;

export const isNftBurnEventLog = (
  log: FtEventLogs | NftEventLogs,
): log is NftBurnEventLog => log.event === NftLogKind.BURN;

export const isNftTransferEventLog = (
  log: FtEventLogs | NftEventLogs,
): log is NftTransferEventLog => log.event === NftLogKind.TRANSFER;
