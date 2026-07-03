import { createHash } from 'crypto';
import { createRequire } from 'module';

import { base58 } from '@scure/base';

import { ExecutionStatus } from 'nb-neardata';

const json = createRequire(import.meta.url)('nb-json');

const ML_DSA_HASH_DOMAIN = Buffer.from('near:ml-dsa-65-pubkey-hash:v1');

export const jsonStringify = (args: unknown): string => json.stringify(args);

// ML-DSA-65 keys are stored on the trie (and returned by RPC) as a short
// hash handle, not the full ~1952-byte key. Canonicalize to that handle so the
// value fits the access_keys btree index. Non-ML-DSA keys pass through unchanged.
export const normalizeAccessKey = (publicKey: string): string => {
  if (!publicKey.startsWith('ml-dsa-65:')) return publicKey; // ed25519/secp256k1, or already a handle
  const raw = base58.decode(publicKey.slice('ml-dsa-65:'.length));
  const digest = createHash('sha3-256')
    .update(ML_DSA_HASH_DOMAIN)
    .update(raw)
    .digest();
  return `ml-dsa-65-hash:${base58.encode(Uint8Array.from(digest))}`;
};

export const publicKeyFromImplicitAccount = (account: string) => {
  try {
    const publicKey = base58.encode(Buffer.from(account, 'hex'));

    return `ed25519:${publicKey}`;
  } catch (error) {
    return null;
  }
};

export const isNearImplicit = (account: string) =>
  account.length === 64 && /[a-f0-9]{64}/.test(account);

export const isEthImplicit = (account: string) =>
  account.length === 42 &&
  account.startsWith('0x') &&
  /^[a-f0-9]{40}$/.test(account.slice(2));

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};
