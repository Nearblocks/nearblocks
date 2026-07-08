import {
  experimentalTxStatus,
  JsonRpcClientError,
  NearRpcClient,
  viewFunctionAsJson,
} from '@near-js/jsonrpc-client';
import {
  BlockId,
  Finality,
  RpcTransactionResponse,
} from '@near-js/jsonrpc-types';

import { Config } from './config';
import {
  ensureRpcSession,
  isProxyProvider,
  RPC_SESSION_ERROR_CODE,
} from './rpc-session';

export const encodeArgs = (args: unknown) => {
  return Buffer.from(JSON.stringify(args)).toString('base64');
};

export const rpcCall = async <T>(
  url: string,
  call: (client: NearRpcClient) => Promise<T>,
): Promise<T> => {
  const client = new NearRpcClient({ endpoint: url });

  if (!isProxyProvider(url)) return call(client);

  await ensureRpcSession();

  try {
    return await call(client);
  } catch (error) {
    if (
      error instanceof JsonRpcClientError &&
      error.code === RPC_SESSION_ERROR_CODE
    ) {
      await ensureRpcSession(true);
      return call(client);
    }

    throw error;
  }
};

export const viewFunction = async <T>(
  provider: Config['provider'],
  contract: string,
  method: string,
  args: unknown,
  finality?: Finality,
  blockId?: BlockId,
) => {
  return rpcCall(provider.url, (client) =>
    viewFunctionAsJson<T>(client, {
      accountId: contract,
      argsBase64: encodeArgs(args),
      blockId,
      finality,
      methodName: method,
    }),
  );
};

export const txnStatus = async (
  provider: Config['provider'],
  txHash: string,
  senderAccountId: string,
): Promise<RpcTransactionResponse> => {
  return rpcCall(provider.url, (client) =>
    experimentalTxStatus(client, {
      senderAccountId,
      txHash,
      waitUntil: 'NONE',
    }),
  );
};
