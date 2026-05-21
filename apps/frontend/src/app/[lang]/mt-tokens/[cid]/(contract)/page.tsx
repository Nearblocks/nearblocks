import { ErrorSuspense } from '@/components/error-suspense';
import { MtTokenTransfers } from '@/components/mt-tokens/transfers';
import {
  fetchMTContractTxnCount,
  fetchMTContractTxns,
} from '@/data/mt-tokens/contract';

type Props = PageProps<'/[lang]/mt-tokens/[cid]'>;

const MtTokenPage = async ({ params, searchParams }: Props) => {
  const [{ cid }, filters] = await Promise.all([params, searchParams]);
  const txnsPromise = fetchMTContractTxns(cid, filters);
  const txnCountPromise = fetchMTContractTxnCount(cid, filters).then(
    (r) => r.data ?? null,
  );

  return (
    <ErrorSuspense fallback={<MtTokenTransfers loading />}>
      <MtTokenTransfers
        txnCountPromise={txnCountPromise}
        txnsPromise={txnsPromise}
      />
    </ErrorSuspense>
  );
};

export default MtTokenPage;
