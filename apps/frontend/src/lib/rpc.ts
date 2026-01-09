import { NearRpcClient, viewFunctionAsJson } from '@near-js/jsonrpc-client';

import { useRpc } from '@/stores/rpc';

export const encodeArgs = (args: unknown) => {
  return Buffer.from(JSON.stringify(args)).toString('base64');
};

export const tokenBalance = async (contract: string, account: string) => {
  const provider = useRpc.getState().provider;

  console.log({ provider });

  const client = new NearRpcClient({
    endpoint: provider?.url ?? '',
  });

  const data = await viewFunctionAsJson<string>(client, {
    accountId: contract,
    argsBase64: encodeArgs({ account_id: account }),
    methodName: 'ft_balance_of',
  });

  return data;
};
