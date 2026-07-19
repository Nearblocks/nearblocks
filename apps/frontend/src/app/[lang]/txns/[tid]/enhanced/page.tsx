import { ErrorSuspense } from '@/components/error-suspense';
import { Enhanced } from '@/components/txns/txn/enhanced';
import { fetchStats } from '@/data/layout';
import { fetchTxnReceipts } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]/enhanced'>;

const EnhancedPage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);
  const statsPromise = fetchStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<Enhanced loading />}>
      <Enhanced
        receiptsPromise={receiptsPromise}
        statsPromise={statsPromise}
        tid={tid}
      />
    </ErrorSuspense>
  );
};

export default EnhancedPage;
