'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Provider from '@/components/Layouts/Provider';
import useWallet from '@/hooks/app/useWallet';

import { NearContext } from '../wallet/near-context';
import Header from './Header';
import Footer from './Footer';
import { StatusInfo } from '@/utils/types';
import { toast } from 'react-toastify';
import { getSearchRoute, SearchToast } from '../common/Search';
import { useConfig } from '@/hooks/app/useConfig';
import { rpcSearch } from '@/utils/app/rpc';
import { useRpcStore } from '@/stores/app/rpc';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { useIntlRouter } from '@/i18n/routing';
import { handleFilterAndKeyword } from '@/utils/app/actions';
import useSearchHistory from '@/hooks/app/useSearchHistory';

interface LayoutProps {
  children: React.ReactNode;
  notice?: React.ReactNode;
  theme: string;
  stats: StatusInfo;
  sync: string;
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
  getLatestStats,
  getSyncStatus,
}: LayoutProps) => {
  const pathname = usePathname();
  const [signedAccountId, setSignedAccountId] = useState('');
  const wallet = useWallet();
  const { networkId } = useConfig();
  const searchParams = useSearchParams();
  const router = useIntlRouter();
  const query = searchParams?.get('q');
  const { getSearchResults, setSearchResults } = useSearchHistory();

  const initializedRef = useRef(false);
  const useRpcStoreWithProviders = () => {
    const setProviders = useRpcStore((state) => state.setProviders);
    const { RpcProviders } = useRpcProvider();

    useEffect(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setProviders(RpcProviders);
      }
    }, [RpcProviders, setProviders]);

    return useRpcStore((state) => state);
  };

  const { rpc: rpcUrl } = useRpcStoreWithProviders();

  useEffect(() => {
    if (wallet) {
      wallet.startUp(setSignedAccountId).catch((error) => {
        console.error('Error during wallet startup:', error);
      });
    }
  }, [wallet]);

  useEffect(() => {
    const redirect = (route: any) => {
      switch (route?.type) {
        case 'block':
          return router.push(`/blocks/${route?.path}`);
        case 'txn':
        case 'receipt':
          return router.push(`/txns/${route?.path}`);
        case 'address':
          return router.push(`/address/${route?.path}`);
        case 'token':
          return router.push(`/token/${route?.path}`);
        default:
          return toast.error(SearchToast(networkId));
      }
    };
    const loadResults = async (keyword: string) => {
      const cachedResults = await getSearchResults(keyword, '');
      if (cachedResults) {
        return redirect(getSearchRoute(cachedResults));
      } else {
        const data = await handleFilterAndKeyword(keyword, '');
        const route = getSearchRoute(data);
        if (route) {
          setSearchResults(keyword, '', data);
          return redirect(route);
        } else {
          const rpcData = await rpcSearch(rpcUrl, keyword);
          const rpcRoute = getSearchRoute(rpcData);
          if (rpcRoute) {
            setSearchResults(keyword, '', rpcData);
            return redirect(rpcRoute);
          } else {
            return toast.error(SearchToast(networkId));
          }
        }
      }
    };

    const keyword =
      typeof query === 'string' ? query?.replace(/[\s,]/g, '') : '';

    if (keyword) {
      loadResults(keyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
