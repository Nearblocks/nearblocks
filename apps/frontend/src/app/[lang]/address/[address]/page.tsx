import { Txns } from '@/components/address/txns';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchTxnCount, fetchTxns } from '@/data/address/txns';

type Props = PageProps<'/[lang]/address/[address]'>;

const AddressPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const txnsPromise = fetchTxns(address, filters);
  const txnCountPromise = fetchTxnCount(address, filters);

  return (
    <ErrorSuspense fallback={<Txns loading />}>
      <Txns txnCountPromise={txnCountPromise} txnsPromise={txnsPromise} />
    </ErrorSuspense>
  );
};

export default AddressPage;
