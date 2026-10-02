import { ErrorSuspense } from '@/components/error-suspense';
import { Execution } from '@/components/txns/txn/execution';
import { fetchTxnNearPrice, fetchTxnReceipts } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]/execution'>;

const ExecutionPage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);
  const pricePromise = receiptsPromise.then((receipts) =>
    fetchTxnNearPrice(receipts?.block.block_timestamp),
  );
  await holdNav();

  return (
    <ErrorSuspense fallback={<Execution loading />}>
      <Execution
        pricePromise={pricePromise}
        receiptsPromise={receiptsPromise}
        tid={tid}
      />
    </ErrorSuspense>
  );
};

export default ExecutionPage;
