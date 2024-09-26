import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import { HomeSkeleton } from '@/components/Skeletons/Home';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import config from '@/config';

const Widgets = dynamic(() => import('@/components/Widgets'), { ssr: false });

const Home: PageLayout = () => {
  const loader = useRef<HTMLDivElement>(null);
  const rpcUrl = useRpcStore((state) => state.rpc);

  return (
    <>
      <Meta
        description="Check real-time data on the NEAR blockchain"
        title="Near RPC based Explorer | NearBlocks Lite"
      />
      <div className="relative">
        <div className="absolute inset-0" ref={loader}>
          <HomeSkeleton />
        </div>
        <Widgets
          loader={<HomeSkeleton />}
          props={{ rpcUrl }}
          src={`${config.account}/widget/lite.Home`}
        />
      </div>
    </>
  );
};

Home.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Home;
