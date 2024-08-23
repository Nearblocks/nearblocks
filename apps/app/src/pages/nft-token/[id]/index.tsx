import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import Overview from '@/components/Tokens/NFT/Overview';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import classNames from 'classnames';
import Transfers from '@/components/Tokens/NFT/Transfers';
import Holders from '@/components/Tokens/NFT/Holders';
import Inventory from '@/components/Tokens/NFT/Inventory';
import { Spinner } from '@/components/common/Spinner';
import { VmComponent } from '@/components/vm/VmComponent';
import Comment from '@/components/skeleton/common/Comment';
import { useBosComponents } from '@/hooks/useBosComponents';
import { useAuthStore } from '@/stores/auth';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const tabs = ['transfers', 'holders', 'inventory', 'comments'];

type TabType = 'transfers' | 'holders' | 'inventory' | 'comments';

export const getServerSideProps: GetServerSideProps<{
  tokenDetails: any;
  transfersDetails: any;
  holdersDetails: any;
  syncDetails: any;
  data: any;
  dataCount: any;
  error: boolean;
  tab: string;
  statsDetails: any;
  latestBlocks: any;
}> = async (context) => {
  const {
    query: { id = '', tab = 'transfers', ...query },
  }: { query: { id?: string; tab?: TabType } & Record<string, any> } = context;

  const urlMapping: Record<
    string,
    { api: string; count?: string; queryModifier?: () => void }
  > = {
    transfers: { api: `nfts/${id}/txns`, count: `nfts/${id}/txns/count` },
    holders: { api: `nfts/${id}/holders`, count: `nfts/${id}/holders/count` },
    inventory: {
      api: `nfts/${id}/tokens`,
      count: `nfts/${id}/tokens/count`,
      queryModifier: () => {
        query.per_page = '24';
      },
    },
    comments: { api: `account/${id}/contract/deployments` },
  };

  const apiUrls = urlMapping[tab as TabType];
  if (!apiUrls) {
    return { notFound: true };
  }

  apiUrls.queryModifier?.();

  const fetchUrl = `${apiUrls.api}${
    query ? `?${queryString.stringify(query)}` : ''
  }`;
  const countUrl = apiUrls.count && `${apiUrls.count}`;

  const fetchData = async (url: string | undefined) =>
    url ? await fetcher(url) : null;

  try {
    const [
      tokenResult,
      transfersResult,
      holdersResult,
      syncResult,
      dataResult,
      dataCountResult,
      statsResult,
      latestBlocksResult,
    ] = await Promise.allSettled([
      fetchData(id && `nfts/${id}`),
      fetchData(id && `nfts/${id}/txns/count`),
      fetchData(id && `nfts/${id}/holders/count`),
      fetchData(`sync/status`),
      fetchData(fetchUrl),
      fetchData(countUrl),
      fetchData(`stats`),
      fetchData(`blocks/latest?limit=1`),
    ]);

    const getResult = (result: PromiseSettledResult<any>) =>
      result.status === 'fulfilled' ? result.value : null;

    return {
      props: {
        tokenDetails: getResult(tokenResult),
        transfersDetails: getResult(transfersResult),
        holdersDetails: getResult(holdersResult),
        syncDetails: getResult(syncResult),
        data: getResult(dataResult),
        dataCount: getResult(dataCountResult),
        error: dataResult.status === 'rejected',
        tab,
        statsDetails: getResult(statsResult),
        latestBlocks: getResult(latestBlocksResult),
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tokenDetails: null,
        transfersDetails: null,
        holdersDetails: null,
        syncDetails: null,
        data: null,
        dataCount: null,
        error: true,
        tab: 'transfers',
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const NFToken = ({
  tokenDetails,
  transfersDetails,
  holdersDetails,
  syncDetails,
  data,
  dataCount,
  error,
  tab,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { id } = router.query;
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const components = useBosComponents();

  const token = tokenDetails?.contracts?.[0];
  const transfers = transfersDetails?.txns?.[0]?.count;
  const holders = holdersDetails?.holders?.[0]?.count;

  const txns = data?.txns || [];
  const count = dataCount?.txns?.[0]?.count;
  const txnCursor = data?.cursor;

  const holder = data?.holders || [];
  const holderCount = dataCount?.holders?.[0]?.count;
  const status = syncDetails?.status?.aggregates.nft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleRouteChangeStart = (url: string) => {
      if (url !== router.asPath) {
        timeout = setTimeout(() => {
          setLoading(true);
        }, 300);
      }
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  const tokens = data?.tokens || [];
  const inventoryCount = dataCount?.tokens?.[0]?.count;

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    token ? `${token.name} (${token.symbol}) ` : ''
  }NFT Stats, Holders & Transactions | NearBlocks`;
  const description = token
    ? `All you need to know about the ${token.name} NFT Collection : Statistics, total supply, number of holders, latest transactions & meta-data.`
    : '';
  const thumbnail = `${ogUrl}/thumbnail/nft-token?token=${token?.name}&network=${network}&brand=near`;

  useEffect(() => {
    if (tab) {
      const index = tabs.indexOf(tab as string);
      if (index !== -1) {
        setTabIndex(index);
      }
    }
  }, [tab]);

  const onTab = (index: number) => {
    setTabIndex(index);
    const { id } = router.query;
    const newQuery = { id, tab: tabs[index] };
    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
        'bg-green-600 dark:bg-green-250 text-white': selected,
      },
    );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/nft-token/${id}`} />
      </Head>
      {loading && <Spinner />}
      <div className="relative container mx-auto px-3">
        <Overview
          token={token}
          status={status}
          transfers={transfers}
          holders={holders}
        />
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <Tabs onSelect={(index) => onTab(index)} selectedIndex={tabIndex}>
              <TabList className={'flex flex-wrap'}>
                <Tab
                  className={getClassName(tabs[0] === tabs[tabIndex])}
                  selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                >
                  <h2>Transfers</h2>
                </Tab>
                <Tab
                  className={getClassName(tabs[1] === tabs[tabIndex])}
                  selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                >
                  <h2>Holders</h2>
                </Tab>
                <Tab
                  className={getClassName(tabs[2] === tabs[tabIndex])}
                  selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                >
                  <h2>Inventory</h2>
                </Tab>
                <Tab
                  className={getClassName(tabs[3] === tabs[tabIndex])}
                  selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                >
                  <h2>Comments</h2>
                </Tab>
              </TabList>
              <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                <TabPanel>
                  <Transfers
                    txns={txns}
                    count={count}
                    error={error}
                    cursor={txnCursor}
                    tab={tab}
                  />
                </TabPanel>
                <TabPanel>
                  <Holders
                    tokens={token}
                    status={status}
                    holder={holder}
                    count={holderCount}
                    error={error}
                    tab={tab}
                  />
                </TabPanel>
                <TabPanel>
                  <Inventory
                    token={token}
                    tokens={tokens}
                    count={inventoryCount}
                    error={error}
                    tab={tab}
                  />
                </TabPanel>
                <TabPanel>
                  <VmComponent
                    src={components?.commentsFeed}
                    defaultSkelton={<Comment />}
                    props={{
                      network: network,
                      path: `nearblocks.io/nft-token/${id}`,
                      limit: 10,
                      requestSignInWithWallet,
                    }}
                    loading={<Comment />}
                  />
                </TabPanel>
              </div>
            </Tabs>
          </div>
        </div>
        <div className="py-6"></div>
      </div>
    </>
  );
};

NFToken.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default NFToken;
