import { types } from 'near-lake-framework';

import { FTLogKind, NEP, NFTLogKind } from 'nb-types';

import {
  FTBurnEventLog,
  FTEventLogs,
  FTMintEventLog,
  FTTransferEventLog,
  NFTBurnEventLog,
  NFTEventLogs,
  NFTMintEventLog,
  NFTTransferEventLog,
} from '#types/types';

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

export const isNep141 = (log: FTEventLogs | NFTEventLogs): log is FTEventLogs =>
  log.standard === NEP.Nep141;

export const isNep171 = (
  log: FTEventLogs | NFTEventLogs,
): log is NFTEventLogs => log.standard === NEP.Nep171;

export const isFTMintEventLog = (
  log: FTEventLogs | NFTEventLogs,
): log is FTMintEventLog => log.event === FTLogKind.MINT;

export const isFTBurnEventLog = (
  log: FTEventLogs | NFTEventLogs,
): log is FTBurnEventLog => log.event === FTLogKind.BURN;

export const isFTTransferEventLog = (
  log: FTEventLogs | NFTEventLogs,
): log is FTTransferEventLog => log.event === FTLogKind.TRANSFER;

export const isNFTMintEventLog = (
  log: FTEventLogs | NFTEventLogs,
): log is NFTMintEventLog => log.event === NFTLogKind.MINT;

export const isNFTBurnEventLog = (
  log: FTEventLogs | NFTEventLogs,
): log is NFTBurnEventLog => log.event === NFTLogKind.BURN;

export const isNFTTransferEventLog = (
  log: FTEventLogs | NFTEventLogs,
): log is NFTTransferEventLog => log.event === NFTLogKind.TRANSFER;
