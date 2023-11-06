import { providers } from 'near-api-js';

import config from '#config';

export const provider = new providers.JsonRpcProvider({ url: config.rpcUrl });

export const bytesParse = (input: ArrayBuffer) =>
  JSON.parse(Buffer.from(input).toString());

export const bytesStringify = (input: any) =>
  Buffer.from(JSON.stringify(input)).toString('base64');

export const viewAccount = async (account: string) =>
  provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: account,
  });

export const viewAccessKeys = async (account: string) =>
  provider.query({
    request_type: 'view_access_key_list',
    finality: 'final',
    account_id: account,
  });

export const viewCode = async (contract: string) =>
  provider.query({
    request_type: 'view_code',
    finality: 'final',
    account_id: contract,
  });

export const callFunction = async (
  contract: string,
  method: string,
  args: any = {},
) =>
  provider.query({
    request_type: 'call_function',
    finality: 'final',
    account_id: contract,
    method_name: method,
    args_base64: bytesStringify(args),
  });
