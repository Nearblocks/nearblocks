'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import Provider from '@/components/Layouts/Provider';
import useWallet from '@/hooks/app/useWallet';

import { NearContext } from '../wallet/near-context';
import Header from './Header';
import Footer from './Footer';
import { Status, StatusInfo } from '@/utils/types';
import { toast } from 'react-toastify';
import { getSearchRoute, SearchToast } from '../common/Search';
import { useConfig } from '@/hooks/app/useConfig';
import { rpcSearch } from '@/utils/app/rpc';
import { useRpcStore } from '@/stores/app/rpc';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { useIntlRouter } from '@/i18n/routing';
import { handleFilterAndKeyword } from '@/utils/app/actions';
import useSearchHistory from '@/hooks/app/useSearchHistory';
import Cookies from 'js-cookie';
import Notice from '../common/Notice';

interface LayoutProps {
  children: React.ReactNode;
  notice?: React.ReactNode;
  theme: string;
  stats: StatusInfo;
  sync: Status;
  accountId?: string;
  getLatestStats: () => Promise<StatusInfo>;
  getSyncStatus: () => Promise<Status>;
}

const LayoutActions = ({
  children,
  theme,
  accountId,
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
  const [accountName, setAccountName] = useState<undefined | string>(accountId);
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);
  const useRpcStoreWithProviders = () => {
    const setProviders = useRpcStore((state) => state.setProviders);
    const { RpcProviders } = useRpcProvider();

    useEffect(() => {
      const manageAccountSession = () => {
        if (signedAccountId && signedAccountId.length > 0) {
          const currentCookie = Cookies.get('signedAccountId');
          if (currentCookie !== signedAccountId) {
            Cookies.set('signedAccountId', signedAccountId);
            setAccountName(signedAccountId);
          }
          return;
        }
        if (!isLoading && (!signedAccountId || signedAccountId.length === 0)) {
          Cookies.remove('signedAccountId');
          setAccountName(undefined);
        }
      };
      manageAccountSession();
      const interval = setInterval(manageAccountSession, 500);

      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signedAccountId, isLoading]);

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
      wallet
        .startUp(setSignedAccountId)
        .catch((error) => {
          console.error('Error during wallet startup:', error);
        })
        .finally(() => setIsLoading(false));
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
        const route = data?.data && getSearchRoute(data?.data);
        if (route) {
          setSearchResults(data?.keyword, '', data?.data);
          return redirect(route);
        } else {
          const rpcData = await rpcSearch(rpcUrl, keyword);
          const rpcRoute = rpcData?.data && getSearchRoute(rpcData?.data);
          if (rpcRoute) {
            setSearchResults(rpcData?.keyword, '', rpcData?.data);
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

  const isChart =
    pathname?.startsWith('/chart') || pathname?.startsWith('/charts/');
  const className =
    pathname === '/404'
      ? 'bg-white dark:bg-black-300'
      : 'bg-neargray-25 dark:bg-black-300 ';

  const { indexers, jobs } = sync;

  return (
    <div className={className}>
      <NearContext.Provider value={{ signedAccountId, wallet }}>
        {isChart ? (
          <Notice
            getSyncStatus={getSyncStatus}
            sync={jobs?.daily_stats?.sync}
          />
        ) : null}
        <Provider>
          <Header
            stats={stats}
            sync={indexers}
            theme={theme}
            accountId={accountName}
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
