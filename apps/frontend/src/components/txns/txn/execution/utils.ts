import { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import { deserialize } from 'borsh';
import { decodeBase64, hexlify, Transaction } from 'ethers';

import { ActionKind } from 'nb-types';

import type {
  AuroraSubmitArgs,
  EvmTransactionData,
  RpcTransactionResponseWithReceipts,
} from './types';

export const deepUnescape = (value: unknown): unknown => {
  if (typeof value === 'string') {
    const unescaped = value
      .replace(/\\{2,}"/g, (m) => '\\'.repeat(m.length / 2 - 1) + '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"');

    try {
      const parsed = JSON.parse(unescaped);
      if (typeof parsed === 'object' && parsed !== null) {
        return deepUnescape(parsed);
      }
      return value;
    } catch {
      return value;
    }
  }

  if (Array.isArray(value)) {
    return value.map(deepUnescape);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        deepUnescape(v),
      ]),
    );
  }

  return value;
};

export const actionLabel = (action: ActionKind): string => {
  switch (action) {
    case ActionKind.FUNCTION_CALL:
      return 'Function Call';
    case ActionKind.TRANSFER:
      return 'Transfer';
    case ActionKind.STAKE:
      return 'Stake';
    case ActionKind.ADD_KEY:
      return 'Add Key';
    case ActionKind.DELETE_KEY:
      return 'Delete Key';
    case ActionKind.DEPLOY_CONTRACT:
      return 'Deploy Contract';
    case ActionKind.DEPLOY_GLOBAL_CONTRACT:
    case ActionKind.DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
      return 'Deploy Global Contract';
    case ActionKind.CREATE_ACCOUNT:
      return 'Create Account';
    case ActionKind.DELETE_ACCOUNT:
      return 'Delete Account';
    case ActionKind.DELEGATE_ACTION:
      return 'Delegate Action';
    default:
      return action;
  }
};

export const findRawArgs = (
  rpcData: RpcTransactionResponse | undefined,
  receiptId: string,
  methodName: string | undefined,
): null | string => {
  if (!rpcData) return null;

  const rpcDataWithReceipts = rpcData as RpcTransactionResponseWithReceipts;
  const receipts = rpcDataWithReceipts.receipts;

  if (!Array.isArray(receipts)) return null;

  const rpcReceipt = receipts.find((r) => r.receiptId === receiptId);
  if (!rpcReceipt) return null;

  const receipt = rpcReceipt;
  const actionReceipt = receipt.receipt?.Action || receipt.receipt?.action;
  if (!actionReceipt) return null;

  const actions = actionReceipt.actions || [];
  const match = actions.find((a) => {
    const fc = a.FunctionCall || a.functionCall;
    if (!fc) return false;
    if (methodName) {
      return (fc.methodName || fc.method_name) === methodName;
    }
    return true;
  });

  if (!match) return null;
  const fc = match.FunctionCall || match.functionCall;
  return fc?.args ?? null;
};

export const isAuroraAction = (
  methodName: string | undefined,
  receiver: string,
): boolean => {
  if (receiver !== 'aurora') return false;
  return (
    methodName === 'submit' ||
    methodName === 'submit_with_args' ||
    methodName === 'rlp_execute'
  );
};

export const isBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
};

export const parseEvmTransaction = (
  input: Uint8Array,
): EvmTransactionData | null => {
  try {
    const tx = Transaction.from(hexlify(input));
    const proto = Object.getPrototypeOf(tx);
    const descriptors = Object.getOwnPropertyDescriptors(proto);
    const getters = Object.entries(descriptors)
      .filter(([, d]) => typeof d.get === 'function')
      .map(([key]) => key);
    const plain: Record<string, unknown> = {};

    for (const key of getters) {
      const val = (tx as any)[key];
      if (val != null) {
        plain[key] = val;
      }
    }

    return plain;
  } catch {
    return null;
  }
};

// Borsh v2 schema for Aurora SubmitArgs
// https://github.com/aurora-is-near/aurora-engine/blob/develop/engine-types/src/parameters/engine.rs#L133
// Field order must match the Rust struct: tx_data, max_gas_price, gas_token_address
/* eslint-disable perfectionist/sort-objects */
const submitArgsSchema = {
  struct: {
    tx_data: { array: { type: 'u8' as const } },
    max_gas_price: { option: 'u128' as const },
    gas_token_address: { option: { array: { len: 20, type: 'u8' as const } } },
  },
};
/* eslint-enable perfectionist/sort-objects */

export const decodeSubmitTransaction = (
  b64: string,
): null | Record<string, unknown> => {
  if (!isBase64(b64)) return null;
  try {
    const input = decodeBase64(b64);
    return parseEvmTransaction(input);
  } catch {
    return null;
  }
};

export const decodeSubmitWithArgsTransaction = (
  b64: string,
): null | Record<string, unknown> => {
  if (!isBase64(b64)) return null;
  try {
    const buffer = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const submitArgs = deserialize(
      submitArgsSchema,
      buffer,
    ) as AuroraSubmitArgs;
    const txData = new Uint8Array(submitArgs.tx_data);
    return parseEvmTransaction(txData);
  } catch {
    return null;
  }
};

export const decodeRlpExecuteTransaction = (
  data: Record<string, unknown>,
): null | Record<string, unknown> => {
  const b64 = data.tx_bytes_b64;
  if (typeof b64 !== 'string' || !isBase64(b64)) return null;
  try {
    const input = decodeBase64(b64);
    const parsed = parseEvmTransaction(input);
    if (!parsed) return null;
    const { tx_bytes_b64: _, ...rest } = data;
    return { ...rest, tx_bytes_b64: parsed };
  } catch {
    return null;
  }
};
