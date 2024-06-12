import dynamic from 'next/dynamic';
import { useRef } from 'react';

import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import HomeSkeleton from '@/components/Skeletons/Home';
import config from '@/config';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const Widgets = dynamic(() => import('@/components/Widgets'), { ssr: false });

const Home: PageLayout = () => {
  const loader = useRef<HTMLDivElement>(null);
  const rpcUrl = useRpcStore((state) => state.rpc);

  const onFinish = () => {
    if (loader.current) loader.current.style.display = 'none';
  };

  return (
    <>
      <Meta
        description="Check real-time data on the NEAR blockchain"
        title="Near Stateless Explorer | NearBlocks Lite"
      />
      <div className="relative">
        <div className="absolute inset-0" ref={loader}>
          <HomeSkeleton />
        </div>
        <Widgets
          loader={<HomeSkeleton onFinish={onFinish} />}
          props={{ rpcUrl }}
          src={`${config.account}/widget/lite.Home`}
        />
      </div>
    </>
  );
};

Home.getLayout = MainLayout;

export default Home;
