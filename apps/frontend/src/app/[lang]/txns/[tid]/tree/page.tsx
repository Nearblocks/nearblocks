import { ErrorSuspense } from '@/components/error-suspense';
import { Tree } from '@/components/txns/txn/tree';
import { fetchTxnNearPrice, fetchTxnReceipts } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]/tree'>;

const TreePage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);
  const pricePromise = receiptsPromise.then((receipts) =>
    fetchTxnNearPrice(receipts?.block.block_timestamp),
  );
  await holdNav();

  return (
    <ErrorSuspense fallback={<Tree loading />}>
      <Tree
        pricePromise={pricePromise}
        receiptsPromise={receiptsPromise}
        tid={tid}
      />
    </ErrorSuspense>
  );
};

export default TreePage;
