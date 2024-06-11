import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import MainLayout from '@/components/Layouts/Main';
import AddressSkeleton from '@/components/Skeletons/Address';
import config from '@/config';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const Widgets = dynamic(() => import('@/components/Widgets'), { ssr: false });

const Address: PageLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const loader = useRef<HTMLDivElement>(null);
  const rpcUrl = useRpcStore((state) => state.rpc);

  const onFinish = () => {
    if (loader.current) loader.current.style.display = 'none';
  };

  return (
    <div className="relative">
      <div className="absolute inset-0" ref={loader}>
        <AddressSkeleton />
      </div>
      <Widgets
        loader={<AddressSkeleton onFinish={onFinish} />}
        props={{ id, rpcUrl }}
        src={`${config.account}/widget/lite.Address`}
      />
    </div>
  );
};

Address.getLayout = MainLayout;

export default Address;
