'use client';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { useRpcStore } from '@/stores/app/rpc';
import { useLayoutEffect } from 'react';

export function RpcInitializer() {
  const { RpcProviders } = useRpcProvider();
  const { initializeRpc } = useRpcStore();

  useLayoutEffect(() => {
    initializeRpc(RpcProviders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
