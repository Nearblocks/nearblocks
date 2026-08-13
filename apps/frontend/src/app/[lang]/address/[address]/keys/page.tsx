import { AccessKeysRpc } from '@/components/address/keys-rpc';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchRpcKeyCount, fetchRpcKeys } from '@/data/address/keys-rpc';
import { holdNav } from '@/lib/hold-nav';

type Props = PageProps<'/[lang]/address/[address]/keys'>;

const KeysPage = async ({ params, searchParams }: Props) => {
  const [{ address }, filters] = await Promise.all([params, searchParams]);
  const keysPromise = fetchRpcKeys(address, filters);
  const keyCountPromise = fetchRpcKeyCount(address);
  await holdNav();

  return (
    <ErrorSuspense fallback={<AccessKeysRpc loading />}>
      <AccessKeysRpc
        keyCountPromise={keyCountPromise}
        keysPromise={keysPromise}
      />
    </ErrorSuspense>
  );
};

export default KeysPage;
