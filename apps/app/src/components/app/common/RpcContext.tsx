'use client';

import { RpcProvider } from '@/utils/types';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';

type RpcContextType = {
  providers: RpcProvider[];
  rpc: string;
  setRpc: (rpc: string) => void;
  switchRpc: () => void;
  addCustomRpc: (rpc: RpcProvider) => void;
  deleteCustomRpc: (rpcUrl: string) => void;
};

const RpcContext = createContext<RpcContextType | null>(null);

const loadCustomRpcs = (): RpcProvider[] => {
  try {
    const stored = localStorage.getItem('customRpcProviders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(
      'Failed to parse customRpcProviders from localStorage:',
      error,
    );
    return [];
  }
};

const saveCustomRpcs = (customRpcs: RpcProvider[]) => {
  try {
    localStorage.setItem('customRpcProviders', JSON.stringify(customRpcs));
  } catch (error) {
    console.error('Failed to save custom RPCs to localStorage:', error);
  }
};

export const RpcContextProvider = ({
  children,
  rpcProviders,
}: {
  children: React.ReactNode;
  rpcProviders: RpcProvider[];
}) => {
  const [rpc, setRpcState] = useState<string | null>(null);
  const [providers, setProviders] = useState<RpcProvider[]>(rpcProviders);
  const errorCountRef = useRef<number>(0);

  useEffect(() => {
    const defaultProviders = rpcProviders.map((provider) => ({
      ...provider,
      isCustom: false,
    }));

    const customProviders = loadCustomRpcs().map((provider) => ({
      ...provider,
      isCustom: true,
    }));

    setProviders([...defaultProviders, ...customProviders]);
  }, [rpcProviders]);

  const addCustomRpc = useCallback((newRpc: RpcProvider) => {
    const existingCustomRpcs = loadCustomRpcs();
    if (existingCustomRpcs.find((rpc) => rpc.url === newRpc.url)) {
      console.warn(`Custom RPC with URL "${newRpc.url}" already exists.`);
      return;
    }
    const updatedCustomRpcs = [...existingCustomRpcs, newRpc];
    saveCustomRpcs(updatedCustomRpcs);

    setProviders((prev) => [...prev, { ...newRpc, isCustom: true }]);
  }, []);

  const deleteCustomRpc = useCallback(
    (rpcUrl: string) => {
      const existingCustomRpcs = loadCustomRpcs();
      const updatedCustomRpcs = existingCustomRpcs.filter(
        (provider) => provider.url !== rpcUrl,
      );

      saveCustomRpcs(updatedCustomRpcs);
      setProviders((prev) => {
        const updatedProviders = prev.filter(
          (provider) => provider.url !== rpcUrl,
        );
        if (rpc === rpcUrl && updatedProviders.length > 0) {
          setRpcState(updatedProviders[0].url);
        }
        return updatedProviders;
      });
    },
    [rpc],
  );

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
    rpc: rpc ?? providers[0]?.url ?? '',
    setRpc,
    switchRpc,
    addCustomRpc,
    deleteCustomRpc,
  };

  return <RpcContext.Provider value={value}>{children}</RpcContext.Provider>;
};

export const useRpcProvider = () => {
  const context = useContext(RpcContext);
  if (!context) {
    throw new Error('useRpcProvider must be used within a RpcContextProvider');
  }
  return context;
};
