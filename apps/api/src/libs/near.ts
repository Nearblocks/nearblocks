import { providers } from 'near-api-js';
import { QueryResponseKind } from 'near-api-js/lib/providers/provider.js';

import config from '#config';

export const provider = new providers.JsonRpcProvider({ url: config.rpcUrl });

export const bytesParse = (input: ArrayBuffer) =>
  JSON.parse(Buffer.from(input).toString());

export const bytesStringify = (input: unknown) =>
  Buffer.from(JSON.stringify(input)).toString('base64');

export const viewAccount = async (account: string) =>
  provider.query({
    account_id: account,
    finality: 'final',
    request_type: 'view_account',
  });

export const viewAccessKeys = async (account: string) =>
  provider.query({
    account_id: account,
    finality: 'final',
    request_type: 'view_access_key_list',
  });

export const viewCode = async (contract: string) =>
  provider.query({
    account_id: contract,
    finality: 'final',
    request_type: 'view_code',
  });

export const callFunction = async <T extends QueryResponseKind>(
  contract: string,
  method: string,
  args: unknown = {},
) =>
  provider.query<T>({
    account_id: contract,
    args_base64: bytesStringify(args),
    finality: 'final',
    method_name: method,
    request_type: 'call_function',
  });
