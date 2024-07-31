import type { NextPage } from 'next';

import type {
  RpcResultAccount,
  RpcResultBlock,
  RpcResultReceipt,
  RpcResultTxn,
} from 'nb-near';

export type PageLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export type SearchResult = {
  account: RpcResultAccount | undefined;
  block: RpcResultBlock | undefined;
  query: string | undefined;
  receipt: RpcResultReceipt | undefined;
  txn: RpcResultTxn | undefined;
};

export type SkeletonProps = {
  onFinish?: () => void;
};
