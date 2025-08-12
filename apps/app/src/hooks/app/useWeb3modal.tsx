import { useMemo } from 'react';
import { useConfig } from '@/hooks/app/useConfig';
import { createWeb3Modal } from '@/components/app/wallet/web3modal';

export const useWeb3Modal = () => {
  const config = useConfig();

  const web3ModalInstances = useMemo(() => {
    if (!config?.networkId || !config?.projectId || !config?.EVMWalletChain) {
      return null;
    }

    return createWeb3Modal({
      networkId: config?.networkId,
      projectId: config?.projectId,
      EVMWalletChain: config?.EVMWalletChain,
    });
  }, [config?.networkId, config?.projectId, config?.EVMWalletChain]);

  return web3ModalInstances;
};
