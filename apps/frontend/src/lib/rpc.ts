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

export const viewFunction = async <T>(
  provider: Config['provider'],
  contract: string,
  method: string,
  args: unknown,
  finality?: Finality,
  blockId?: BlockId,
) => {
  const client = new NearRpcClient({
    endpoint: provider.url,
  });

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
): Promise<RpcTransactionResponse> => {
  const client = new NearRpcClient({ endpoint: provider.url });

  return experimentalTxStatus(client, {
    senderAccountId,
    txHash,
    waitUntil: 'NONE',
  });
};
