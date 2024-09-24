import { providers } from 'near-api-js';
import {
  BlockId,
  BlockReference,
  QueryResponseKind,
} from 'near-api-js/lib/providers/provider.js';

import { Network } from 'nb-types';

import config from '#config';

export const rpcProviders =
  config.network === Network.MAINNET
    ? ([
        'https://archival-rpc.mainnet.near.org',
        'https://rpc.mainnet.near.org',
        'https://beta.rpc.mainnet.near.org',
        'https://free.rpc.fastnear.com',
        'https://near.lava.build',
        'https://near.lavenderfive.com/',
        'https://near.drpc.org',
      ] as const)
    : ([
        'https://archival-rpc.testnet.near.org',
        'https://rpc.testnet.near.org',
        'https://beta.rpc.testnet.near.org',
      ] as const);

export const getProvider = (url?: string) => {
  return new providers.JsonRpcProvider({ url: url ?? config.rpcUrl });
};

export const bytesParse = (input: ArrayBuffer) =>
  JSON.parse(Buffer.from(input).toString());

export const bytesStringify = (input: unknown) =>
  Buffer.from(JSON.stringify(input)).toString('base64');

export const viewAccount = async (
  provider: providers.JsonRpcProvider,
  account: string,
) =>
  provider.query({
    account_id: account,
    finality: 'final',
    request_type: 'view_account',
  });

export const viewAccessKeys = async (
  provider: providers.JsonRpcProvider,
  account: string,
) =>
  provider.query({
    account_id: account,
    finality: 'final',
    request_type: 'view_access_key_list',
  });

export const viewCode = async (
  provider: providers.JsonRpcProvider,
  contract: string,
) =>
  provider.query({
    account_id: contract,
    finality: 'final',
    request_type: 'view_code',
  });

export const callFunction = async <T extends QueryResponseKind>(
  provider: providers.JsonRpcProvider,
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

export const viewBlock = async (
  provider: providers.JsonRpcProvider,
  block: BlockId | BlockReference,
) => provider.block(block);
