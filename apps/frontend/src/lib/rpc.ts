import {
  experimentalTxStatus,
  NearRpcClient,
  viewFunctionAsJson,
} from '@near-js/jsonrpc-client';
import {
  BlockId,
  Finality,
  RpcTransactionResponse,
} from '@near-js/jsonrpc-types';

import { Config } from './config';

export const encodeArgs = (args: unknown) => {
  return Buffer.from(JSON.stringify(args)).toString('base64');
};

/**
 * Build a NearRpcClient, attaching the proxy session credential as the
 * `x-rpc-session` header when present. Immutable: a fresh client per call,
 * no mutation of any shared instance.
 */
const createClient = (endpoint: string, sessionToken?: null | string) =>
  new NearRpcClient({
    endpoint,
    headers: sessionToken ? { 'x-rpc-session': sessionToken } : undefined,
  });

export const viewFunction = async <T>(
  provider: Config['provider'],
  contract: string,
  method: string,
  args: unknown,
  finality?: Finality,
  blockId?: BlockId,
  sessionToken?: null | string,
) => {
  const client = createClient(provider.url, sessionToken);

  const data = await viewFunctionAsJson<T>(client, {
    accountId: contract,
    argsBase64: encodeArgs(args),
    blockId,
    finality,
    methodName: method,
  });

  return data;
};

export const txnStatus = async (
  provider: Config['provider'],
  txHash: string,
  senderAccountId: string,
  sessionToken?: null | string,
): Promise<RpcTransactionResponse> => {
  const client = createClient(provider.url, sessionToken);

  return experimentalTxStatus(client, {
    senderAccountId,
    txHash,
    waitUntil: 'NONE',
  });
};
