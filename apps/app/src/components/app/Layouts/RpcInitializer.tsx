'use client';

import { useRpcStore } from '@/stores/app/rpc';
import { useEffect } from 'react';

type RpcProvider = {
  name: string;
  url: string;
};
interface Props {
  rpcCookie: string;
  rpcProviders: RpcProvider[];
}

export function RpcInitializer({ rpcCookie, rpcProviders }: Props) {
  const { initializeRpc } = useRpcStore();

  useEffect(() => {
    const initRpc = async () => {
      initializeRpc(rpcCookie, rpcProviders);
    };

    initRpc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
