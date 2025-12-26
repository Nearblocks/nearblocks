import { Block, BlocksRes, Txn, TxnsRes } from 'nb-schemas';

import { fetcher } from '@/lib/fetcher';

export const fetchBlocks = async () => {
  const resp = await fetcher<BlocksRes>('/v3/blocks/latest');
  console.log(resp);
  return resp.data as Block[];
};

export const fetchTxns = async () => {
  const resp = await fetcher<TxnsRes>('/v3/txns/latest');
  console.log(resp);
  return resp.data as Txn[];
};
