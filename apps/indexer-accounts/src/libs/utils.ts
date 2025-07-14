import { createRequire } from 'module';

import { base58 } from '@scure/base';

import { ExecutionStatus } from 'nb-neardata';

const json = createRequire(import.meta.url)('nb-json');

export const jsonStringify = (args: unknown): string => json.stringify(args);

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
