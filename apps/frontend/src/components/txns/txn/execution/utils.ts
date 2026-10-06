import {
  FinalExecutionOutcomeWithReceiptView,
  RpcTransactionResponse,
} from '@near-js/jsonrpc-types';
import { deserialize, type Schema, serialize } from 'borsh';
import { decodeBase64, hexlify, Transaction } from 'ethers';

import { isRawJson, parseJson } from '@/lib/json';

export type AuroraViewFormat = 'default' | 'rlp' | 'table';

export type AuroraSubmitArgs = {
  gas_token_address?: null | number[] | undefined;
  max_gas_price?: null | string | undefined;
  tx_data: number[];
};

export const ACTION_ARGS_LAYERS = 1;
export const FUNCTION_ARGS_LAYERS = 2;
export const RESULT_LAYERS = 1;

const MAX_CODE_POINT = 0x10ffff;

const RUST_ESCAPES: Record<string, string> = {
  "'": "'",
  '"': '"',
  '\\': '\\',
  n: '\n',
  r: '\r',
  t: '\t',
};

const rustUnescape = (value: string): string =>
  value.replace(
    /\\(?:u\{([0-9a-fA-F]{1,6})\}|([\\'"nrt]))/g,
    (match, hex: string | undefined, char: string | undefined) => {
      if (hex === undefined) return RUST_ESCAPES[char ?? ''] ?? match;
      const codePoint = parseInt(hex, 16);
      return codePoint > MAX_CODE_POINT
        ? match
        : String.fromCodePoint(codePoint);
    },
  );

const unescapeLayers = (value: string, layers: number): string => {
  let current = value;
  for (let i = 0; i < layers; i++) current = rustUnescape(current);
  return current;
};

export const normalizeArgs = (value: unknown, layers: number): unknown => {
  if (typeof value === 'string') return unescapeLayers(value, layers);
  if (Array.isArray(value)) return value.map((v) => normalizeArgs(v, layers));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        normalizeArgs(v, layers),
      ]),
    );
  }
  return value;
};

const expandJsonStrings = (value: unknown): unknown => {
  if (typeof value === 'string') {
    try {
      const parsed = parseJson(value);
      if (typeof parsed === 'object' && parsed !== null && !isRawJson(parsed)) {
        return expandJsonStrings(parsed);
      }
    } catch {}
    return value;
  }
  if (isRawJson(value)) return value;
  if (Array.isArray(value)) return value.map(expandJsonStrings);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        expandJsonStrings(v),
      ]),
    );
  }
  return value;
};

export const deepUnescape = (value: unknown, layers: number): unknown =>
  expandJsonStrings(normalizeArgs(value, layers));

export const findRawArgs = (
  rpcData: RpcTransactionResponse | undefined,
  receiptId: string,
  actionIndex: number,
): null | string => {
  const data = rpcData as FinalExecutionOutcomeWithReceiptView | undefined;
  const receipts = data?.receipts;
  if (!Array.isArray(receipts)) return null;

  const receipt = receipts.find((r) => r.receiptId === receiptId);
  const actionReceipt =
    receipt?.receipt && 'Action' in receipt.receipt
      ? receipt.receipt.Action
      : null;

  const action = actionReceipt
    ? actionReceipt.actions?.[actionIndex]
    : data?.transactionOutcome?.outcome?.receiptIds?.[0] === receiptId
      ? data?.transaction?.actions?.[actionIndex]
      : undefined;

  if (!action || typeof action === 'string' || !('FunctionCall' in action))
    return null;

  return action.FunctionCall.args ?? null;
};

export const findRawOutcome = (
  rpcData: RpcTransactionResponse | undefined,
  receiptId: string,
) => {
  const outcomes = (rpcData as FinalExecutionOutcomeWithReceiptView | undefined)
    ?.receiptsOutcome;
  if (!Array.isArray(outcomes)) return null;

  return outcomes.find((o) => o.id === receiptId)?.outcome ?? null;
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
  const getterKeys =
    proto && proto !== Object.prototype
      ? Object.entries(Object.getOwnPropertyDescriptors(proto))
          .filter(([, d]) => typeof d.get === 'function')
          .map(([key]) => key)
      : [];

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

const SUBMIT_RESULT_VERSION = 7;
const LEGACY_MAX_STATUS_INDEX = 5;
const LEGACY_MAX_BOOL = 1;

const bytesType: Schema = { array: { type: 'u8' } };
const unitType: Schema = { struct: {} };
const addressField: Record<string, Schema> = {
  address: { array: { len: 20, type: 'u8' } },
};

/* eslint-disable perfectionist/sort-objects */
const transactionStatusSchema: Schema = {
  enum: [
    { struct: { Succeed: bytesType } },
    { struct: { Revert: bytesType } },
    { struct: { OutOfGas: unitType } },
    { struct: { OutOfFund: unitType } },
    { struct: { OutOfOffset: unitType } },
    { struct: { CallTooDeep: unitType } },
    { struct: { StackUnderflow: unitType } },
    { struct: { StackOverflow: unitType } },
    { struct: { InvalidJump: unitType } },
    { struct: { InvalidRange: unitType } },
    { struct: { DesignatedInvalid: unitType } },
    { struct: { CreateCollision: unitType } },
    { struct: { CreateContractLimit: unitType } },
    { struct: { InvalidCode: 'u8' } },
    { struct: { PCUnderflow: unitType } },
    { struct: { CreateEmpty: unitType } },
    { struct: { MaxNonce: unitType } },
    { struct: { UsizeOverflow: unitType } },
    { struct: { Other: 'string' } },
    { struct: { CreateContractStartingWithEF: unitType } },
  ],
};

const logsSchema = (withAddress: boolean): Schema => ({
  array: {
    type: {
      struct: {
        ...(withAddress ? addressField : {}),
        topics: { array: { type: { array: { len: 32, type: 'u8' } } } },
        data: bytesType,
      },
    },
  },
});

const submitResultLayouts: {
  accepts: (firstByte: number) => boolean;
  schema: Schema;
}[] = [
  {
    accepts: (firstByte) => firstByte === SUBMIT_RESULT_VERSION,
    schema: {
      struct: {
        version: 'u8',
        status: transactionStatusSchema,
        gas_used: 'u64',
        logs: logsSchema(true),
      },
    },
  },
  {
    accepts: (firstByte) => firstByte <= LEGACY_MAX_STATUS_INDEX,
    schema: {
      struct: {
        status: transactionStatusSchema,
        gas_used: 'u64',
        logs: logsSchema(false),
      },
    },
  },
  {
    accepts: (firstByte) => firstByte <= LEGACY_MAX_BOOL,
    schema: {
      struct: {
        status: 'bool',
        gas_used: 'u64',
        result: bytesType,
        logs: logsSchema(false),
      },
    },
  },
];
/* eslint-enable perfectionist/sort-objects */

type RawSubmitResult = {
  gas_used: bigint;
  logs: { address?: number[]; data: number[]; topics: number[][] }[];
  result?: number[];
  status: boolean | Record<string, unknown>;
  version?: number;
};

const bytesToHex = (bytes: number[]): string => hexlify(Uint8Array.from(bytes));

const normalizeSubmitResult = (
  result: RawSubmitResult,
): Record<string, unknown> => {
  const gasUsed = result.gas_used.toString();
  const logs = result.logs.map((log) => ({
    ...(log.address && { address: bytesToHex(log.address) }),
    data: bytesToHex(log.data),
    topics: log.topics.map(bytesToHex),
  }));

  if (typeof result.status === 'boolean') {
    /* eslint-disable perfectionist/sort-objects */
    return {
      status: result.status ? 'Succeed' : 'Failed',
      output: bytesToHex(result.result ?? []),
      gas_used: gasUsed,
      logs,
    };
    /* eslint-enable perfectionist/sort-objects */
  }

  const [kind, payload] = Object.entries(result.status)[0];

  return {
    ...(result.version !== undefined && { version: result.version }),
    status: kind,
    ...(Array.isArray(payload) && { output: bytesToHex(payload) }),
    ...((typeof payload === 'number' || typeof payload === 'string') && {
      reason: payload,
    }),
    gas_used: gasUsed,
    logs,
  };
};

export const isAuroraSubmitResult = (
  methodName: string | undefined,
  receiver: string,
): boolean =>
  receiver === 'aurora' &&
  (methodName === 'submit' ||
    methodName === 'submit_with_args' ||
    methodName === 'call');

export const decodeSubmitResult = (
  b64: string,
): null | Record<string, unknown> => {
  if (!isBase64(b64)) return null;
  try {
    const bytes = decodeBase64(b64);

    for (const { accepts, schema } of submitResultLayouts) {
      if (!accepts(bytes[0])) continue;
      try {
        const result = deserialize(schema, bytes) as RawSubmitResult;
        if (serialize(schema, result).length === bytes.length) {
          return normalizeSubmitResult(result);
        }
      } catch {}
    }

    return null;
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
