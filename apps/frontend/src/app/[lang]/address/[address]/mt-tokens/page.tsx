import { MTTxns } from '@/components/address/mts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchMTTxnCount, fetchMTTxns } from '@/data/address/mts';

type Props = PageProps<'/[lang]/address/[address]/mt-tokens'>;

const MTTxnsPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const mtsPromise = fetchMTTxns(address, filters);
  const mtCountPromise = fetchMTTxnCount(address, filters);

  return (
    <ErrorSuspense fallback={<MTTxns loading />}>
      <MTTxns mtCountPromise={mtCountPromise} mtsPromise={mtsPromise} />
    </ErrorSuspense>
  );
};

export default MTTxnsPage;
