'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type RpcTriggerContextType = {
  shouldFetchRpc: boolean;
  triggerRpcFetch: () => void;
  resetRpcFetch: () => void;
  setShouldFetchRpc: (value: boolean) => void;
};

const RpcTriggerContext = createContext<RpcTriggerContextType | null>(null);

export const RpcTriggerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [shouldFetchRpc, setShouldFetchRpcState] = useState<boolean>(false);

  const triggerRpcFetch = useCallback(() => {
    setShouldFetchRpcState(true);
  }, []);

  const resetRpcFetch = useCallback(() => {
    setShouldFetchRpcState(false);
  }, []);

  const setShouldFetchRpc = useCallback((value: boolean) => {
    setShouldFetchRpcState(value);
  }, []);

  const value: RpcTriggerContextType = {
    shouldFetchRpc,
    triggerRpcFetch,
    resetRpcFetch,
    setShouldFetchRpc,
  };

  return (
    <RpcTriggerContext.Provider value={value}>
      {children}
    </RpcTriggerContext.Provider>
  );
};

export const useRpcTrigger = () => {
  const context = useContext(RpcTriggerContext);
  if (!context) {
    throw new Error('useRpcTrigger must be used within a RpcTriggerProvider');
  }
  return context;
};
