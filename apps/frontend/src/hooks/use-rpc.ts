import type {
  BlockId,
  Finality,
  RpcTransactionResponse,
} from '@near-js/jsonrpc-types';
import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';

import { txnStatus, viewFunction } from '@/lib/rpc';
import { sessionRequired } from '@/lib/session';

import { useConfig } from './use-config';
import { useSession } from './use-session';
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
  const config = useConfig((s) => s.config);
  const token = useSession((s) => s.token);
  const ready = useSession((s) => s.ready);

  const resolvedProvider = provider || config.provider;
  const required = sessionRequired(resolvedProvider.url, config);
  const gated = required && !ready;

  const shouldFetch = hydrated && params && !gated;
  const key = shouldFetch
    ? [
        'rpc-view',
        params.contract,
        params.method,
        params.args,
        params.finality,
        params.blockId,
        required ? token : null,
      ]
    : null;

  return useSWR<T>(
    key,
    async () => {
      if (!params) throw new Error('Missing required params');

      return viewFunction<T>(
        resolvedProvider,
        params.contract,
        params.method,
        params.args ?? {},
        params.finality,
        params.blockId,
        required ? token : undefined,
      );
    },
    options,
  );
};

export const useBatchView = <T = unknown>(params: BatchViewParams | null) => {
  const provider = useSettings((s) => s.provider);
  const hydrated = useSettings((s) => s.hydrated);
  const config = useConfig((s) => s.config);
  const token = useSession((s) => s.token);
  const ready = useSession((s) => s.ready);

  const resolvedProvider = provider || config.provider;
  const required = sessionRequired(resolvedProvider.url, config);
  const gated = required && !ready;

  const shouldFetch = hydrated && params && !gated;
  const key = shouldFetch
    ? [
        'rpc-batch-view',
        required ? token : null,
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
            resolvedProvider,
            call.contract,
            call.method,
            call.args ?? {},
            call.finality,
            call.blockId,
            required ? token : undefined,
          ),
        ),
      );
    },
    options,
  );
};

export const useViewMutation = <T = unknown>() => {
  const provider = useSettings((s) => s.provider);
  const config = useConfig((s) => s.config);
  const token = useSession((s) => s.token);
  const ready = useSession((s) => s.ready);

  const resolvedProvider = provider || config.provider;
  const required = sessionRequired(resolvedProvider.url, config);

  return useSWRMutation<T, Error, string, ViewParams>(
    'rpc-mutation',
    async (_key, { arg }) => {
      if (required && !ready) {
        throw new Error('RPC session not ready');
      }

      return viewFunction<T>(
        resolvedProvider,
        arg.contract,
        arg.method,
        arg.args ?? {},
        arg.finality,
        arg.blockId,
        required ? token : undefined,
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
  const config = useConfig((s) => s.config);
  const token = useSession((s) => s.token);
  const ready = useSession((s) => s.ready);

  const resolvedProvider = provider || config.provider;
  const required = sessionRequired(resolvedProvider.url, config);
  const gated = required && !ready;

  const shouldFetch = hydrated && params && !gated;
  const key = shouldFetch
    ? [
        'rpc-txn-status',
        params.txHash,
        params.senderAccountId,
        required ? token : null,
      ]
    : null;

  return useSWR<RpcTransactionResponse>(
    key,
    async () => {
      if (!params) throw new Error('Missing required params');

      return txnStatus(
        resolvedProvider,
        params.txHash,
        params.senderAccountId,
        required ? token : undefined,
      );
    },
    options,
  );
};
