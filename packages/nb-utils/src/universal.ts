import { base58 } from '@scure/base';

export type GlobalContractReference = { account_id: string } | { hash: string };

export type UniversalStateInit = {
  access_keys: string[];
  code: GlobalContractReference | null;
  data: Record<string, string>;
};

const UNIVERSAL_ACCOUNT = /^0u[0-9a-hjkmnp-tv-z]{51}[0g]$/;

const KEY_PREFIXES: Record<number, { length: number; prefix: string }> = {
  0: { length: 32, prefix: 'ed25519:' },
  1: { length: 64, prefix: 'secp256k1:' },
  3: { length: 32, prefix: 'ml-dsa-65-hash:' },
};

export const isUniversalAccount = (value: unknown): value is string =>
  typeof value === 'string' && UNIVERSAL_ACCOUNT.test(value);

const createReader = (buffer: Buffer) => {
  let offset = 0;

  const take = (length: number) => {
    if (length < 0 || offset + length > buffer.length) {
      throw new RangeError('unexpected end of state init');
    }

    const bytes = buffer.subarray(offset, offset + length);

    offset += length;

    return bytes;
  };

  return {
    bytes: (length: number) => take(length),
    done: () => offset === buffer.length,
    u32: () => take(4).readUInt32LE(0),
    u8: () => take(1)[0],
  };
};

export const decodeUniversalStateInit = (
  stateInit: string,
): null | UniversalStateInit => {
  try {
    const reader = createReader(Buffer.from(stateInit, 'base64'));

    if (reader.u8() !== 0) return null;

    let code: GlobalContractReference | null = null;
    const hasCode = reader.u8();

    if (hasCode > 1) return null;

    if (hasCode === 1) {
      const kind = reader.u8();

      if (kind === 0) {
        code = { hash: base58.encode(reader.bytes(32)) };
      } else if (kind === 1) {
        code = {
          account_id: reader.bytes(reader.u32()).toString('utf8'),
        };
      } else {
        return null;
      }
    }

    const data: Record<string, string> = {};
    const dataLength = reader.u32();

    for (let i = 0; i < dataLength; i++) {
      const key = reader.bytes(reader.u32()).toString('base64');

      data[key] = reader.bytes(reader.u32()).toString('base64');
    }

    const accessKeys: string[] = [];
    const keysLength = reader.u32();

    for (let i = 0; i < keysLength; i++) {
      const key = KEY_PREFIXES[reader.u8()];

      if (!key) return null;

      accessKeys.push(
        `${key.prefix}${base58.encode(reader.bytes(key.length))}`,
      );
    }

    if (!reader.done()) return null;

    return { access_keys: accessKeys, code, data };
  } catch {
    return null;
  }
};
