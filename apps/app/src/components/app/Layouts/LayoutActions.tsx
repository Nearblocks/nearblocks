'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { networkId } from '@/utils/app/config';
import { NearContext, Wallet } from '@/wallets/near';

import Footer from './Footer';

const wallet = new Wallet({ networkId: networkId });

interface LayoutProps {
  children: React.ReactNode;
  notice?: React.ReactNode;
  theme?: string;
}

const LayoutActions = ({ children, notice, theme }: LayoutProps) => {
  const pathname = usePathname();
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => {
    wallet.startUp(setSignedAccountId);
  }, []);

  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300	';

  return (
    <div className={className}>
      <NearContext.Provider
        value={{
          signedAccountId: signedAccountId || '',
          wallet: wallet ?? undefined,
        }}
      >
        {notice}
        <main>{children}</main>
        <Footer theme={theme} />
      </NearContext.Provider>
    </div>
  );
};

export default LayoutActions;
