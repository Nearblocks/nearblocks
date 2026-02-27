import { ErrorSuspense } from '@/components/error-suspense';
import { Overview } from '@/components/txns/txn';
import { Actions } from '@/components/txns/txn/actions';
import { fetchStats } from '@/data/layout';
import {
  fetchTxn,
  fetchTxnFTs,
  fetchTxnMTs,
  fetchTxnNFTs,
  fetchTxnReceipts,
} from '@/data/txns';

type Props = PageProps<'/[lang]/txns/[tid]'>;

const TxnPage = async ({ params }: Props) => {
  const { tid } = await params;
  const txnPromise = fetchTxn(tid);
  const txnFTsPromise = fetchTxnFTs(tid);
  const txnMTsPromise = fetchTxnMTs(tid);
  const txnNFTsPromise = fetchTxnNFTs(tid);
  const txnReceiptsPromise = fetchTxnReceipts(tid);
  const statsPromise = fetchStats();

  return (
    <div className="flex flex-col gap-4">
      <ErrorSuspense fallback={<Actions loading />}>
        <Actions txnPromise={txnPromise} />
      </ErrorSuspense>
      <ErrorSuspense fallback={<Overview loading />}>
        <Overview
          receiptsPromise={txnReceiptsPromise}
          statsPromise={statsPromise}
          txnFTsPromise={txnFTsPromise}
          txnMTsPromise={txnMTsPromise}
          txnNFTsPromise={txnNFTsPromise}
          txnPromise={txnPromise}
        />
      </ErrorSuspense>
    </div>
  );
};

export default TxnPage;
