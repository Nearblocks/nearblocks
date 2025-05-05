import { useEffect, useState } from 'react';

import { Wallet } from '@/components/app/wallet/near';
import { useConfig } from './useConfig';

const useWallet = (): null | Wallet => {
  const [wallet, setWallet] = useState<null | Wallet>(null);
  const { networkId } = useConfig();
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const walletInstance = new Wallet({ networkId });
        setWallet(walletInstance);
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      }
    };

    initializeWallet();
  }, [networkId]);

  return wallet; // Returns Wallet or null
};

export default useWallet;
