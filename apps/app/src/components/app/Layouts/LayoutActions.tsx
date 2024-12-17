'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import useWallet from '@/hooks/app/useWallet';

import { NearContext } from '../wallet/near-context';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  notice?: React.ReactNode;
  theme: string;
}

const LayoutActions = ({ children, notice, theme }: LayoutProps) => {
  const pathname = usePathname();
  const [signedAccountId, setSignedAccountId] = useState('');
  const wallet = useWallet();

  useEffect(() => {
    if (wallet) {
      wallet.startUp(setSignedAccountId).catch((error) => {
        console.error('Error during wallet startup:', error);
      });
    }
  }, [wallet]);

  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300 ';

  return (
    <div className={className}>
      <NearContext.Provider value={{ signedAccountId, wallet }}>
        {notice}
        <main>{children}</main>
        <Footer theme={theme} />
      </NearContext.Provider>
    </div>
  );
};

export default LayoutActions;
