import { ErrorSuspense } from '@/components/error-suspense';
import { Execution } from '@/components/txns/txn/execution';
import { fetchStats } from '@/data/layout';
import { fetchTxnReceipts } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]/execution'>;

const ExecutionPage = async ({ params }: Props) => {
  const { tid } = await params;
  const receiptsPromise = fetchTxnReceipts(tid);
  const statsPromise = fetchStats();
  await holdNav();

  return (
    <ErrorSuspense fallback={<Execution loading />}>
      <Execution
        receiptsPromise={receiptsPromise}
        statsPromise={statsPromise}
        tid={tid}
      />
    </ErrorSuspense>
  );
};

export default ExecutionPage;
