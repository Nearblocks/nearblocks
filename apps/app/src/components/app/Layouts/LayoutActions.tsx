'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import Provider from '@/components/Layouts/Provider';
import useWallet from '@/hooks/app/useWallet';

import { NearContext } from '../wallet/near-context';
import Header from './Header';
import Footer from './Footer';
import { StatusInfo } from '@/utils/types';

interface LayoutProps {
  children: React.ReactNode;
  notice?: React.ReactNode;
  theme: string;
  stats: StatusInfo;
  sync: string;
  handleFilterAndKeyword: (
    keyword: string,
    filter: string,
    returnPath: any,
  ) => any;
  token?: string;
  user?: string;
  role?: string;
  getLatestStats: () => Promise<StatusInfo>;
  getSyncStatus: () => Promise<string>;
}

const LayoutActions = ({
  children,
  notice,
  theme,
  token,
  stats,
  sync,
  handleFilterAndKeyword,
  getLatestStats,
  getSyncStatus,
}: LayoutProps) => {
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
        <Provider>
          <Header
            handleFilterAndKeyword={handleFilterAndKeyword}
            stats={stats}
            sync={sync}
            theme={theme}
            token={token}
            getLatestStats={getLatestStats}
            getSyncStatus={getSyncStatus}
          />
          <main>{children}</main>
        </Provider>
        <Footer theme={theme} />
      </NearContext.Provider>
    </div>
  );
};

export default LayoutActions;
