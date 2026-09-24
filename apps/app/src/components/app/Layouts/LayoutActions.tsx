'use client';

import { useSearchParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import Provider from '@/components/Layouts/Provider';
import useWallet from '@/hooks/app/useWallet';

import { NearContext } from '@/components/app/wallet/near-context';
import Header from '@/components/app/Layouts/Header';
import Footer from '@/components/app/Layouts/Footer';
import { Status, StatusInfo } from '@/utils/types';
import { toast } from 'react-toastify';
import { getSearchRoute, SearchToast } from '@/components/app/common/Search';
import { useConfig } from '@/hooks/app/useConfig';
import { usePathname, useIntlRouter } from '@/i18n/routing';
import { handleFilterAndKeyword } from '@/utils/app/actions';
import Cookies from 'js-cookie';
import Notice from '@/components/app/common/Notice';
import useSearchHistory from '@/hooks/app/useSearchHistory';
import { rpcSearchClient } from '@/utils/app/rpcClient';

interface LayoutProps {
  children: React.ReactNode;
  notice?: React.ReactNode;
  theme: string;
  statsPromise: Promise<StatusInfo>;
  syncPromise: Promise<Status>;
  accountId?: string;
  locale: string;
}

const LayoutActions = ({
  children,
  theme,
  accountId,
  locale,
  statsPromise,
  syncPromise,
}: LayoutProps) => {
  const stats = use(statsPromise);
  const sync = use(syncPromise);
  const pathname = usePathname();
  const [signedAccountId, setSignedAccountId] = useState('');
  const wallet = useWallet();
  const { networkId } = useConfig();
  const searchParams = useSearchParams();
  const router = useIntlRouter();
  const query = searchParams?.get('q');
  const [accountName, setAccountName] = useState<undefined | string>(accountId);
  const [isLoading, setIsLoading] = useState(true);
  const { getSearchResults, setSearchResults } = useSearchHistory();

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
    if (wallet) {
      wallet
        .startUp(setSignedAccountId, networkId)
        .catch((error) => {
          console.error('Error during wallet startup:', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [wallet, networkId]);

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
          await setSearchResults(data?.keyword, '', data?.data);
          return redirect(route);
        } else {
          const rpcData = await rpcSearchClient(keyword);
          const rpcRoute = rpcData?.data && getSearchRoute(rpcData?.data);
          if (rpcRoute) {
            await setSearchResults(rpcData?.keyword, '', rpcData?.data);
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
        {isChart ? <Notice sync={jobs?.daily_stats?.sync} /> : null}
        <Provider>
          <Header
            stats={stats}
            sync={indexers}
            theme={theme}
            accountId={accountName}
            locale={locale}
          />
          <main>{children}</main>
        </Provider>
        <Footer theme={theme} />
      </NearContext.Provider>
    </div>
  );
};

export default LayoutActions;
