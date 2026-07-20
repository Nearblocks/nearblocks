import { Receipts } from '@/components/address/receipts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchReceiptCount, fetchReceipts } from '@/data/address/receipts';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/receipts'>;

const ReceiptsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const receiptsPromise = fetchReceipts(address, filters);
  const receiptCountPromise = fetchReceiptCount(address, filters);
  await holdNav();

  return (
    <ErrorSuspense fallback={<Receipts loading />}>
      <Receipts
        receiptCountPromise={receiptCountPromise}
        receiptsPromise={receiptsPromise}
      />
    </ErrorSuspense>
  );
};

export default ReceiptsPage;
