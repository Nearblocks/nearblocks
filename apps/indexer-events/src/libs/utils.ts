import { createRequire } from 'module';

import { types } from 'nb-lake';

const require = createRequire(import.meta.url);
const json = require('nb-json');

export const jsonParse = (args: string) => json.parse(args);

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  json.parse(Buffer.from(args, 'base64').toString());

export const isExecutionSuccess = (status: types.ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};
