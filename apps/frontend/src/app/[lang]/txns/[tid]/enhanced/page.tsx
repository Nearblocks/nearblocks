import { ErrorSuspense } from '@/components/error-suspense';
import { Enhanced } from '@/components/txns/txn/enhanced';
import { fetchTxnNearPrice, fetchTxnReceipts } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]/enhanced'>;

const EnhancedPage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);
  const pricePromise = receiptsPromise.then((receipts) =>
    fetchTxnNearPrice(receipts?.block.block_timestamp),
  );
  await holdNav();

  return (
    <ErrorSuspense fallback={<Enhanced loading />}>
      <Enhanced
        pricePromise={pricePromise}
        receiptsPromise={receiptsPromise}
        tid={tid}
      />
    </ErrorSuspense>
  );
};

export default EnhancedPage;
