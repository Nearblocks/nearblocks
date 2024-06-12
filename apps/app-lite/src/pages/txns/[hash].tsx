import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useRef } from 'react';

import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import TxnSkeleton from '@/components/Skeletons/Txn';
import config from '@/config';
import { useRpcStore } from '@/stores/rpc';
import { PageLayout } from '@/types/types';

const Widgets = dynamic(() => import('@/components/Widgets'), { ssr: false });

const Txn: PageLayout = () => {
  const router = useRouter();
  const { hash } = router.query;
  const loader = useRef<HTMLDivElement>(null);
  const rpcUrl = useRpcStore((state) => state.rpc);

  const onFinish = () => {
    if (loader.current) loader.current.style.display = 'none';
  };

  return (
    <>
      <Meta
        description={`Near Blockchain detailed info for transaction ${hash}.`}
        title={`Near Transaction ${hash} | NearBlocks Lite`}
      />
      <div className="relative">
        <div className="absolute inset-0" ref={loader}>
          <TxnSkeleton />
        </div>
        <Widgets
          loader={<TxnSkeleton onFinish={onFinish} />}
          props={{ hash, rpcUrl }}
          src={`${config.account}/widget/lite.Txn`}
        />
      </div>
    </>
  );
};

Txn.getLayout = MainLayout;

export default Txn;
