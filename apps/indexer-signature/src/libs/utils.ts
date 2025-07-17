import { createRequire } from 'module';

import { ExecutionStatus } from 'nb-blocks-minio';
import { logger } from 'nb-logger';

import sentry from '#libs/sentry';
import { MPCSignature } from '#types/types';

const require = createRequire(import.meta.url);
const json = require('nb-json');

export const jsonParse = (args: string) => json.parse(args);

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  json.parse(Buffer.from(args, 'base64').toString());

export const errorHandler = (error: Error) => {
  logger.error(error);
  sentry.captureException(error);
};

export const isExecutionSuccess = (status: ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};

// https://github.com/NearDeFi/chainsig.js/blob/main/src/utils/cryptography.ts#L14
export const toRSV = (signature: MPCSignature) => {
  // Handle NearNearMpcSignature
  if (
    'big_r' in signature &&
    typeof signature.big_r === 'object' &&
    'affine_point' in signature.big_r &&
    's' in signature &&
    typeof signature.s === 'object' &&
    'scalar' in signature.s
  ) {
    return {
      r: signature.big_r.affine_point.substring(2),
      s: signature.s.scalar,
      v: signature.recovery_id + 27,
    };
  }

  // Handle ChainSigNearMpcSignature
  if (
    'big_r' in signature &&
    typeof signature.big_r === 'string' &&
    's' in signature &&
    typeof signature.s === 'string'
  ) {
    return {
      r: signature.big_r.substring(2),
      s: signature.s,
      v: signature.recovery_id + 27,
    };
  }

  // Handle ChainSigEvmMpcSignature
  if (
    'bigR' in signature &&
    'x' in signature.bigR &&
    's' in signature &&
    typeof signature.s === 'bigint'
  ) {
    return {
      r: signature.bigR.x.toString(16).padStart(64, '0'),
      s: signature.s.toString(16).padStart(64, '0'),
      v: signature.recoveryId + 27,
    };
  }

  return undefined;
};
