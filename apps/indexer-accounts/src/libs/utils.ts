import { createRequire } from 'module';
import { createHash } from 'node:crypto';

import { base58 } from '@scure/base';

import { ExecutionStatus } from 'nb-neardata';

const json = createRequire(import.meta.url)('nb-json');

const ML_DSA_65_PREFIX = 'ml-dsa-65:';
const ML_DSA_65_HASH_DOMAIN_TAG = 'near:ml-dsa-65-pubkey-hash:v1';

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const normalizePublicKey = (publicKey: string): string => {
  if (!publicKey.startsWith(ML_DSA_65_PREFIX)) {
    return publicKey;
  }

  const raw = base58.decode(publicKey.slice(ML_DSA_65_PREFIX.length));
  const hash = createHash('sha3-256')
    .update(Buffer.from(ML_DSA_65_HASH_DOMAIN_TAG))
    .update(raw)
    .digest();

  return `ml-dsa-65-hash:${base58.encode(hash)}`;
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
