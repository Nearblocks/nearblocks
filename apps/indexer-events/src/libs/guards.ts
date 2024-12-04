import { Action, FunctionCallAction } from 'nb-blocks';
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

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

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
