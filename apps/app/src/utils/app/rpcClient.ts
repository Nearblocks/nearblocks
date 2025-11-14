import { SearchResult } from '@/utils/types';
import { networkId, fastNearRpcKey } from '@/utils/app/config';
import { isValidAccount } from '@/utils/app/libs';
import { fetchJsonRpc } from '@/hooks/app/useRpc';
import { NearRpcClient, experimentalTxStatus } from '@near-js/jsonrpc-client';
import type { RpcTransactionResponse } from '@near-js/jsonrpc-types';

const MIN_HASH_LENGTH = 43;

type RpcQueryResponse = {
  statusCode: number;
  data?: any;
  error?: any;
};

export type SearchResponse =
  | { data: SearchResult; keyword: string; loading: boolean }
  | { data: null; loading: boolean };

const getRpcProviders = () => {
  return networkId === 'mainnet'
    ? [
        `https://archival-rpc.mainnet.fastnear.com${
          fastNearRpcKey ? `?apiKey=${fastNearRpcKey}` : ''
        }`,
        'https://free.rpc.fastnear.com',
        'https://near.lava.build',
      ]
    : [
        `https://archival-rpc.testnet.fastnear.com${
          fastNearRpcKey ? `?apiKey=${fastNearRpcKey}` : ''
        }`,
      ];
};

const getFirstHealthyRpc = async (): Promise<string | null> => {
  const providers = getRpcProviders();
  for (const url of providers) {
    try {
      const { statusCode } = await fetchJsonRpc(url, [null], 'status');
      if (statusCode === 200) return url;
    } catch (_) {}
  }
  return providers[0] || null;
};

async function getTxnStatus(
  rpcUrl: string,
  hash: string,
): Promise<RpcTransactionResponse | null> {
  try {
    const client = new NearRpcClient({ endpoint: rpcUrl });
    const res: RpcTransactionResponse = await experimentalTxStatus(client, {
      txHash: hash,
      senderAccountId: 'bowen',
      waitUntil: 'NONE',
    });
    return res ?? null;
  } catch (_) {
    return null;
  }
}

export const rpcSearchClient = async (
  keyword: string,
): Promise<SearchResponse> => {
  const data: SearchResult = {
    accounts: [],
    blocks: [],
    receipts: [],
    tokens: [],
    txns: [],
    mtTokens: [],
  };

  const rpc = (await getFirstHealthyRpc()) as string | null;
  if (!rpc) return { data: null, loading: false };

  const isQueryLong = keyword?.length >= MIN_HASH_LENGTH;

  const tasks: Array<Promise<unknown> | undefined> = [
    isValidAccount(keyword.toLowerCase())
      ? fetchJsonRpc(rpc, {
          request_type: 'view_account',
          finality: 'final',
          account_id: keyword.toLowerCase(),
        })
      : undefined,
    isQueryLong
      ? fetchJsonRpc(rpc, { block_id: keyword }, 'block')
      : !isNaN(+keyword)
      ? fetchJsonRpc(rpc, { block_id: +keyword }, 'block')
      : undefined,
    isQueryLong ? getTxnStatus(rpc, keyword) : undefined,
  ];

  const [accountRes, blockRes, txnRes] = (await Promise.all(tasks)) as [
    RpcQueryResponse | undefined,
    RpcQueryResponse | undefined,
    RpcTransactionResponse | null | undefined,
  ];

  if (accountRes && accountRes?.statusCode === 200 && accountRes?.data) {
    data.accounts = [{ account_id: keyword.toLowerCase() }];
  }

  if (blockRes && blockRes?.statusCode === 200 && blockRes?.data?.result) {
    data.blocks = [
      {
        block_hash: blockRes?.data.result?.header?.hash,
        block_height: blockRes?.data?.result?.header?.height,
      },
    ];
  }

  if (
    txnRes &&
    txnRes?.finalExecutionStatus &&
    txnRes?.finalExecutionStatus !== 'NONE'
  ) {
    data.txns = [{ transaction_hash: keyword }];
  }

  const hasValidData = Object.values(data).some(
    (value) => Array.isArray(value) && value?.length > 0,
  );
  return hasValidData
    ? { data, keyword, loading: false }
    : { data: null, loading: false };
};
