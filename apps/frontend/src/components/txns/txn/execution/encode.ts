import { deepUnescape } from './utils';

export type Encoding = 'base64' | 'hex' | 'json' | 'raw' | 'utf8';

export const base64ToBytes = (b64: string): null | Uint8Array => {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
};

export const utf8ToBytes = (text: string): Uint8Array =>
  new TextEncoder().encode(text);

export const bytesToUtf8 = (bytes: Uint8Array): string =>
  new TextDecoder('utf-8', { fatal: false }).decode(bytes);

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const bytesToBase64 = (bytes: Uint8Array): string => {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

// Treats arrays and objects as "having content" only when non-empty;
// primitives (string/number/boolean) always count, null/undefined never do.
export const hasJsonValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

// Renders a value in the requested encoding. `value` is already-decoded JSON
// (object, array, or primitive); `base64` is the raw byte payload when present.
// Either source may be supplied — `value` is preferred for JSON, `base64` for
// the byte-oriented encodings.
export const encodeValue = (
  encoding: Exclude<Encoding, 'raw'>,
  base64: string | undefined,
  value: unknown,
  hasValue: boolean,
): string => {
  try {
    const bytes = base64
      ? base64ToBytes(base64)
      : hasValue
      ? utf8ToBytes(JSON.stringify(deepUnescape(value)))
      : null;

    if (encoding === 'json') {
      if (hasValue) return JSON.stringify(deepUnescape(value), null, 2);
      if (bytes) {
        const text = bytesToUtf8(bytes);
        try {
          return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          return text;
        }
      }
      return '';
    }
    if (!bytes) return '<invalid encoding>';
    if (encoding === 'utf8') return bytesToUtf8(bytes);
    if (encoding === 'hex') return bytesToHex(bytes);
    return bytesToBase64(bytes);
  } catch {
    return '<unable to decode>';
  }
};
