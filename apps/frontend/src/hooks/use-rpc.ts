import type {
  BlockId,
  Finality,
  RpcTransactionResponse,
} from '@near-js/jsonrpc-types';
import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';

import { txnStatus, viewFunction } from '@/lib/rpc';

import { useConfig } from './use-config';
import { useSettings } from './use-settings';

type ViewParams = {
  args?: unknown;
  blockId?: BlockId;
  contract: string;
  finality?: Finality;
  method: string;
};

type BatchViewParams = Array<{
  args?: unknown;
  blockId?: BlockId;
  contract: string;
  finality?: Finality;
  method: string;
}>;

const options: SWRConfiguration = {
  keepPreviousData: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
};

export const useView = <T = unknown>(params: null | ViewParams) => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const defaultProvider = useConfig((s) => s.config.provider);

  const shouldFetch = hydrated && params;
  const key = shouldFetch
    ? [
        'rpc-view',
        params.contract,
        params.method,
        params.args,
        params.finality,
        params.blockId,
      ]
    : null;

  return useSWR<T>(
    key,
    async () => {
      if (!params) throw new Error('Missing required params');

      return viewFunction<T>(
        provider || defaultProvider,
        params.contract,
        params.method,
        params.args ?? {},
        params.finality,
        params.blockId,
      );
    },
    options,
  );
};

export const useBatchView = <T = unknown>(params: BatchViewParams | null) => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const defaultProvider = useConfig((s) => s.config.provider);

  const shouldFetch = hydrated && params;
  const key = shouldFetch
    ? [
        'rpc-batch-view',
        ...params.map((param) => [
          param.contract,
          param.method,
          param.args,
          param.finality,
          param.blockId,
        ]),
      ]
    : null;

  return useSWR<T[]>(
    key,
    async () => {
      if (!params) throw new Error('Missing required params');

      return Promise.all(
        params.map((call) =>
          viewFunction<T>(
            provider || defaultProvider,
            call.contract,
            call.method,
            call.args ?? {},
            call.finality,
            call.blockId,
          ),
        ),
      );
    },
    options,
  );
};

export const useViewMutation = <T = unknown>() => {
  const provider = useSettings((s) => s.provider);
  const defaultProvider = useConfig((s) => s.config.provider);

  return useSWRMutation<T, Error, string, ViewParams>(
    'rpc-mutation',
    async (_key, { arg }) => {
      return viewFunction<T>(
        provider || defaultProvider,
        arg.contract,
        arg.method,
        arg.args ?? {},
        arg.finality,
        arg.blockId,
      );
    },
  );
};

type TxnStatusParams = {
  senderAccountId: string;
  txHash: string;
} | null;

export const useTxnStatus = (params: TxnStatusParams) => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const defaultProvider = useConfig((s) => s.config.provider);

  const shouldFetch = hydrated && params;
  const key = shouldFetch
    ? ['rpc-txn-status', params.txHash, params.senderAccountId]
    : null;

  return useSWR<RpcTransactionResponse>(
    key,
    async () => {
      if (!params) throw new Error('Missing required params');

      return txnStatus(
        provider || defaultProvider,
        params.txHash,
        params.senderAccountId,
      );
    },
    options,
  );
};
