import { useRouter } from 'next/router';

import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import Txn from '@/components/Txn';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const TxnPage: PageLayout = () => {
  const router = useRouter();
  const hash =
    typeof router.query.hash === 'string' ? router.query.hash : undefined;
  const rpcUrl = useRpcStore((state) => state.rpc);

  return (
    <>
      <Meta
        description={`Near Blockchain detailed info for transaction ${hash ?? ''}.`}
        title={`Near Transaction ${hash ?? ''} | Near Validate`}
      />
      <Txn hash={hash} rpcUrl={rpcUrl} />
    </>
  );
};

TxnPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default TxnPage;
