import { deserialize } from 'borsh';
import { decodeBase64, hexlify, Transaction } from 'ethers';

export type EvmFields = Record<string, unknown>;

type AuroraSubmitArgs = {
  gas_token_address?: null | number[];
  max_gas_price?: null | string;
  tx_data: number[];
};

const submitArgsSchema = {
  struct: Object.fromEntries([
    ['tx_data', { array: { type: 'u8' } }],
    ['max_gas_price', { option: 'u128' }],
    ['gas_token_address', { option: { array: { len: 20, type: 'u8' } } }],
  ]),
};

const isBase64 = (value: string) => {
  try {
    return btoa(atob(value)) === value;
  } catch {
    return false;
  }
};

const toPlainObject = (value: unknown): unknown => {
  if (typeof value === 'bigint') return value.toString();
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(toPlainObject);

  const getters = Object.entries(
    Object.getOwnPropertyDescriptors(Object.getPrototypeOf(value)),
  )
    .filter(([, descriptor]) => typeof descriptor.get === 'function')
    .map(([key]) => key);

  const source = getters.length
    ? getters.map((key) => [key, (value as Record<string, unknown>)[key]])
    : Object.entries(value);

  if (!source.length) return String(value);

  return Object.fromEntries(
    source
      .filter(([, item]) => item != null)
      .map(([key, item]) => [key, toPlainObject(item)]),
  );
};

const parseEvmTransaction = (input: Uint8Array): EvmFields | null => {
  try {
    return toPlainObject(Transaction.from(hexlify(input))) as EvmFields;
  } catch {
    return null;
  }
};

export const decodeSubmit = (b64: string): EvmFields | null => {
  if (!isBase64(b64)) return null;

  try {
    return parseEvmTransaction(decodeBase64(b64));
  } catch {
    return null;
  }
};

export const decodeSubmitWithArgs = (b64: string): EvmFields | null => {
  if (!isBase64(b64)) return null;

  try {
    const buffer = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const args = deserialize(submitArgsSchema, buffer) as AuroraSubmitArgs;

    return parseEvmTransaction(new Uint8Array(args.tx_data));
  } catch {
    return null;
  }
};
