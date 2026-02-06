import { NearRpcClient, viewFunctionAsJson } from '@near-js/jsonrpc-client';
import { BlockId, Finality } from '@near-js/jsonrpc-types';
import { delay } from 'es-toolkit/promise';

import { usePreferences } from '@/stores/preferences';

export const encodeArgs = (args: unknown) => {
  return Buffer.from(JSON.stringify(args)).toString('base64');
};

const getProvider = async () => {
  const provider = usePreferences.getState().provider;

  if (!provider) {
    await delay(100);
    return getProvider();
  }

  return provider;
};

export const viewFunction = async <T>(
  contract: string,
  method: string,
  args: unknown,
  finality?: Finality,
  blockId?: BlockId,
) => {
  const provider = await getProvider();

  console.log(provider);

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
