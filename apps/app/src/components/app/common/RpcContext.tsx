'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';

export type RpcProvider = {
  name: string;
  url: string;
};

type RpcContextType = {
  providers: RpcProvider[];
  rpc: string;
  setRpc: (rpc: string) => void;
  switchRpc: () => void;
};

const RpcContext = createContext<RpcContextType | null>(null);

export const RpcContextProvider = ({
  children,
  rpcProviders: providers,
}: {
  children: React.ReactNode;
  rpcProviders: RpcProvider[];
}) => {
  const [rpc, setRpcState] = useState<string | null>(null);
  const errorCountRef = useRef<number>(0);

  const setRpc = useCallback((newRpc: string) => {
    setRpcState(newRpc);
    errorCountRef.current = 0;
  }, []);

  const switchRpc = useCallback(() => {
    if (providers?.length > 0) {
      if (errorCountRef.current >= providers.length) {
        console.log('All RPC providers have resulted in errors.');
        return;
      }
      setRpcState((currentRpc) => {
        const currentIndex = providers.findIndex(
          (provider) => provider.url === currentRpc,
        );
        const safeIndex = currentIndex === -1 ? 0 : currentIndex;
        const nextIndex = (safeIndex + 1) % providers.length;
        const nextRpc = providers[nextIndex].url;
        return nextRpc;
      });

      errorCountRef.current += 1;
      if (errorCountRef.current >= providers.length) {
        console.log('All RPC providers have resulted in errors.');
      }
    }
  }, [providers]);

  const value: RpcContextType = {
    providers,
    rpc: rpc ?? providers[0]?.url,
    setRpc,
    switchRpc,
  };

  return <RpcContext.Provider value={value}>{children}</RpcContext.Provider>;
};

export const useRpcProvider = () => {
  const context = useContext(RpcContext);
  if (!context) {
    throw new Error('useRpcStore must be used within a RpcContextProvider');
  }
  return context;
};
