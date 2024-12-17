import { useEffect, useState } from 'react';

import { Wallet } from '@/components/app/wallet/near';
import { networkId } from '@/utils/app/config';

const useWallet = (): null | Wallet => {
  const [wallet, setWallet] = useState<null | Wallet>(null);

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
  }, []);

  return wallet; // Returns Wallet or null
};

export default useWallet;
