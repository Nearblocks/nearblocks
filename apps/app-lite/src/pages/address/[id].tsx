import { useRouter } from 'next/router';

import Address from '@/components/Address';
import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import { useNetworkStore } from '@/stores/network';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const AddressPage: PageLayout = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const rpcUrl = useRpcStore((state) => state.rpc);
  const network = useNetworkStore((state) => state.network);

  return (
    <>
      <Meta
        description={`Near Account ${id ?? ''} page allows users to view account details and access keys.`}
        title={`Near Account ${id ?? ''} | Near Validate`}
      />
      <Address id={id} network={network} rpcUrl={rpcUrl} />
    </>
  );
};

AddressPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default AddressPage;
