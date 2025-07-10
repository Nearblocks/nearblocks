import { Action, FunctionCallAction } from 'nb-blocks-minio';
import { FTLogKind, MTLogKind, NEP, NFTLogKind } from 'nb-types';

import {
  EventLogs,
  FTBurnEventLog,
  FTEventLogs,
  FTMintEventLog,
  FTTransferEventLog,
  MTBurnEventLog,
  MTEventLogs,
  MTMintEventLog,
  MTTransferEventLog,
  NFTBurnEventLog,
  NFTEventLogs,
  NFTMintEventLog,
  NFTTransferEventLog,
} from '#types/types';

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

export const isNep141 = (log: EventLogs): log is FTEventLogs =>
  log.standard === NEP.Nep141;

export const isNep171 = (log: EventLogs): log is NFTEventLogs =>
  log.standard === NEP.Nep171;

export const isNep245 = (log: EventLogs): log is MTEventLogs =>
  log.standard === NEP.Nep245;

export const isFTMintEventLog = (log: EventLogs): log is FTMintEventLog =>
  log.event === FTLogKind.MINT;

export const isFTBurnEventLog = (log: EventLogs): log is FTBurnEventLog =>
  log.event === FTLogKind.BURN;

export const isFTTransferEventLog = (
  log: EventLogs,
): log is FTTransferEventLog => log.event === FTLogKind.TRANSFER;

export const isNFTMintEventLog = (log: EventLogs): log is NFTMintEventLog =>
  log.event === NFTLogKind.MINT;

export const isNFTBurnEventLog = (log: EventLogs): log is NFTBurnEventLog =>
  log.event === NFTLogKind.BURN;

export const isNFTTransferEventLog = (
  log: EventLogs,
): log is NFTTransferEventLog => log.event === NFTLogKind.TRANSFER;

export const isMTMintEventLog = (log: EventLogs): log is MTMintEventLog =>
  log.event === MTLogKind.MINT;

export const isMTBurnEventLog = (log: EventLogs): log is MTBurnEventLog =>
  log.event === MTLogKind.BURN;

export const isMTTransferEventLog = (
  log: EventLogs,
): log is MTTransferEventLog => log.event === MTLogKind.TRANSFER;
