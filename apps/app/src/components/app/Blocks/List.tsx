import { getRequest, getRequestBeta } from '@/utils/app/api';

import ListActions from '@/components/app/Blocks/ListActions';
import { Suspense } from 'react';
import ListSkeleton from '../skeleton/blocks/list';

const List = async ({ cursor }: { cursor: string }) => {
  const dataPromise = getRequestBeta('v3/blocks', { cursor });
  const countPromise = getRequestBeta('v3/blocks/count');
  const receiptIndexerHealth = getRequest('v1/health/indexer-receipts');

  return (
    <Suspense fallback={<ListSkeleton />}>
      <ListActions
        dataPromise={dataPromise}
        countPromise={countPromise}
        receiptIndexerHealthPromise={receiptIndexerHealth}
      />
    </Suspense>
  );
};
export default List;
