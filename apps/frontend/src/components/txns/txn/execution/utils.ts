import {
  FinalExecutionOutcomeWithReceiptView,
  RpcTransactionResponse,
} from '@near-js/jsonrpc-types';
import { deserialize } from 'borsh';
import { decodeBase64, hexlify, Transaction } from 'ethers';

export type AuroraViewFormat = 'default' | 'rlp' | 'table';

export type AuroraSubmitArgs = {
  gas_token_address?: null | number[] | undefined;
  max_gas_price?: null | string | undefined;
  tx_data: number[];
};

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

export const findRawArgs = (
  rpcData: RpcTransactionResponse | undefined,
  receiptId: string,
  actionIndex: number,
): null | string => {
  const receipts = (rpcData as FinalExecutionOutcomeWithReceiptView)?.receipts;
  if (!Array.isArray(receipts)) return null;

  const receipt = receipts.find((r) => r.receiptId === receiptId);
  const actionReceipt =
    receipt?.receipt && 'Action' in receipt.receipt
      ? receipt.receipt.Action
      : null;
  const action = actionReceipt?.actions?.[actionIndex];

  if (!action || typeof action === 'string' || !('FunctionCall' in action))
    return null;

  return action.FunctionCall.args ?? null;
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

const toPlainObject = (obj: unknown): unknown => {
  if (obj == null || typeof obj !== 'object') {
    if (typeof obj === 'bigint') return obj.toString();
    return obj;
  }

  if (Array.isArray(obj)) return obj.map(toPlainObject);

  const proto = Object.getPrototypeOf(obj);
  const descriptors = Object.getOwnPropertyDescriptors(proto);
  const getterKeys = Object.entries(descriptors)
    .filter(([, d]) => typeof d.get === 'function')
    .map(([key]) => key);

  if (getterKeys.length === 0) {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return String(obj);
    const plain: Record<string, unknown> = {};
    for (const [key, val] of entries) {
      if (val != null) plain[key] = toPlainObject(val);
    }
    return plain;
  }

  const plain: Record<string, unknown> = {};
  for (const key of getterKeys) {
    const val = (obj as any)[key];
    if (val != null) plain[key] = toPlainObject(val);
  }
  return plain;
};

export const parseEvmTransaction = (
  input: Uint8Array,
): null | Record<string, unknown> => {
  try {
    const tx = Transaction.from(hexlify(input));
    return toPlainObject(tx) as Record<string, unknown>;
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

export const decodeSubmit = (b64: string): null | Record<string, unknown> => {
  if (!isBase64(b64)) return null;
  try {
    const input = decodeBase64(b64);
    return parseEvmTransaction(input);
  } catch {
    return null;
  }
};

export const decodeSubmitWithArgs = (
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

export const decodeRlpExecute = (
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
