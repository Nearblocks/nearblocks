import { ErrorSuspense } from '@/components/error-suspense';
import { MtFtTransfers } from '@/components/mt-tokens/token/ft-transfers';
import {
  fetchMTTokenTxnCount,
  fetchMTTokenTxns,
} from '@/data/mt-tokens/contract';

type Props = {
  params: Promise<{ cid: string; lang: string; tid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FtTokenTransfersPage = async ({ params, searchParams }: Props) => {
  const [{ cid, tid }, filters] = await Promise.all([params, searchParams]);
  const txnsPromise = fetchMTTokenTxns(cid, tid, filters);
  const txnCountPromise = fetchMTTokenTxnCount(cid, tid, filters);

  return (
    <ErrorSuspense fallback={<MtFtTransfers loading />}>
      <MtFtTransfers
        txnCountPromise={txnCountPromise}
        txnsPromise={txnsPromise}
      />
    </ErrorSuspense>
  );
};

export default FtTokenTransfersPage;
