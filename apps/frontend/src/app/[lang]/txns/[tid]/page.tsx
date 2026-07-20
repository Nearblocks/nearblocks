import { ErrorSuspense } from '@/components/error-suspense';
import { Overview } from '@/components/txns/txn';
import { Actions } from '@/components/txns/txn/actions';
import { fetchStats } from '@/data/layout';
import { fetchSpamTokens } from '@/data/spam-tokens';
import {
  fetchTxn,
  fetchTxnFTs,
  fetchTxnMTs,
  fetchTxnNFTs,
  fetchTxnReceipts,
} from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/txns/[tid]'>;

const TxnPage = async ({ params }: Props) => {
  const { tid } = await params;
  const txnPromise = fetchTxn(tid);
  const txnFTsPromise = fetchTxnFTs(tid);
  const txnMTsPromise = fetchTxnMTs(tid);
  const txnNFTsPromise = fetchTxnNFTs(tid);
  const txnReceiptsPromise = fetchTxnReceipts(tid);
  const statsPromise = fetchStats();
  const spamPatterns = await fetchSpamTokens();
  await holdNav();

  return (
    <div className="flex flex-col gap-4">
      <ErrorSuspense fallback={<Actions loading />}>
        <Actions
          ftsPromise={txnFTsPromise}
          mtsPromise={txnMTsPromise}
          receiptsPromise={txnReceiptsPromise}
          txnPromise={txnPromise}
        />
      </ErrorSuspense>
      <ErrorSuspense fallback={<Overview loading />}>
        <Overview
          receiptsPromise={txnReceiptsPromise}
          spamPatterns={spamPatterns}
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
