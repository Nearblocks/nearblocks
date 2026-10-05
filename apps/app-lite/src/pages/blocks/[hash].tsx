import { useRouter } from 'next/router';

import Block from '@/components/Block';
import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const BlockPage: PageLayout = () => {
  const router = useRouter();
  const hash =
    typeof router.query.hash === 'string' ? router.query.hash : undefined;
  const rpcUrl = useRpcStore((state) => state.rpc);

  return (
    <>
      <Meta
        description={`Near Block Hash ${hash ?? ''}. The block height, timestamp, block gas used, gas price, author of the block are detailed on Near.`}
        title={`Near Block ${hash ?? ''} | Near Validate`}
      />
      <Block hash={hash} rpcUrl={rpcUrl} />
    </>
  );
};

BlockPage.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default BlockPage;
