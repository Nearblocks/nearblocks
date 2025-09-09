import { getRequest } from '@/utils/app/api';

import ListActions from '@/components/app/Blocks/ListActions';

const List = async ({ cursor }: { cursor: string }) => {
  const data = await getRequest('v1/blocks', { cursor });
  const dataCount = await getRequest('v1/blocks/count');
  const receiptIndexerHealth =
    (await getRequest('v1/health/indexer-receipts')) || {};
  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }

  const firstBlock = data?.blocks?.[0];
  const hasReceipts =
    firstBlock?.block_height > receiptIndexerHealth?.height ? false : true;

  return (
    <ListActions
      data={data}
      error={!data}
      totalCount={dataCount}
      hasReceipts={hasReceipts}
    />
  );
};
export default List;
