import type { NextPage } from 'next';

import type { RpcResultAccount, RpcResultBlock, RpcResultTxn } from 'nb-near';

export type PageLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export type SearchResult = {
  account: RpcResultAccount | undefined;
  block: RpcResultBlock | undefined;
  query: string | undefined;
  txn: RpcResultTxn | undefined;
};
