import { AccessKeys } from '@/components/address/keys';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchKeyCount, fetchKeys } from '@/data/address/keys';

type Props = PageProps<'/[lang]/address/[address]/keys'>;

const KeysPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const keysPromise = fetchKeys(address, filters);
  const keyCountPromise = fetchKeyCount(address);

  return (
    <ErrorSuspense fallback={<AccessKeys loading />}>
      <AccessKeys keyCountPromise={keyCountPromise} keysPromise={keysPromise} />
    </ErrorSuspense>
  );
};

export default KeysPage;
