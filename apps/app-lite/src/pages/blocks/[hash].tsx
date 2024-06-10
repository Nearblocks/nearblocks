import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import MainLayout from '@/components/Layouts/Main';
import BlockSkeleton from '@/components/Skeletons/Block';
import config from '@/config';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const Widgets = dynamic(() => import('@/components/Widgets'), { ssr: false });

const Block: PageLayout = () => {
  const router = useRouter();
  const { hash } = router.query;
  const loader = useRef<HTMLDivElement>(null);
  const rpcUrl = useRpcStore((state) => state.rpc);

  const onFinish = () => {
    if (loader.current) loader.current.style.display = 'none';
  };

  return (
    <div className="relative">
      <div className="absolute inset-0" ref={loader}>
        <BlockSkeleton />
      </div>
      <Widgets
        loader={<BlockSkeleton onFinish={onFinish} />}
        props={{ hash, rpcUrl }}
        src={`${config.account}/widget/lite.Block`}
      />
    </div>
  );
};

Block.getLayout = MainLayout;

export default Block;
