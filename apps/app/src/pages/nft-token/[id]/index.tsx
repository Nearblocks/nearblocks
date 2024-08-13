import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import Overview from '@/components/Token/NFT/Overview';
import fetcher from '@/utils/fetcher';
import queryString from 'qs';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import classNames from 'classnames';
import Transfers from '@/components/Token/NFT/Transfers';
import Holders from '@/components/Token/NFT/Holders';
import Inventory from '@/components/Token/NFT/Inventory';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const tabs = ['transfers', 'holders', 'inventory', 'comments'];

export const getServerSideProps: GetServerSideProps<{
  tokenDetails: any;
  transfersDetails: any;
  holdersDetails: any;
  syncDetails: any;
  data: any;
  dataCount: any;
  error: boolean;
  tab: string;
}> = async (context) => {
  const {
    query: { id = '', tab = 'transfers', ...query },
  }: any = context;

  let txnApiUrl = '';
  let txnCountUrl = '';
  let fetchUrl = '';
  let countUrl = '';

  switch (tab) {
    case 'transfers':
      txnApiUrl = id && `nfts/${id}/txns`;
      txnCountUrl = id && `nfts/${id}/txns/count`;
      break;
    case 'holders':
      txnApiUrl = id && `nfts/${id}/holders`;
      txnCountUrl = id && `nfts/${id}/holders/count`;
      break;
    case 'inventory':
      txnApiUrl = `nfts/${id}/tokens`;
      txnCountUrl = id && `nfts/${id}/tokens/count`;
      query.per_page = '24';
      break;
    case 'comments':
      txnApiUrl = id && `account/${id}/contract/deployments`;
      break;
    default:
      return {
        notFound: true,
      };
  }

  fetchUrl = query
    ? `${txnApiUrl}?${queryString.stringify(query)}`
    : `${txnApiUrl}`;

  countUrl = `${txnCountUrl}`;

  try {
    const [
      tokenResult,
      transfersResult,
      holdersResult,
      syncResult,
      dataResult,
      dataCountResult,
    ] = await Promise.allSettled([
      fetcher(id && `nfts/${id}`),
      fetcher(id && `nfts/${id}/txns/count`),
      fetcher(id && `nfts/${id}/holders/count`),
      fetcher(`sync/status`),
      fetcher(fetchUrl),
      fetcher(countUrl),
    ]);

    const tokenDetails =
      tokenResult.status === 'fulfilled' ? tokenResult.value : null;
    const transfersDetails =
      transfersResult.status === 'fulfilled' ? transfersResult.value : null;
    const holdersDetails =
      holdersResult.status === 'fulfilled' ? holdersResult.value : null;
    const syncDetails =
      syncResult.status === 'fulfilled' ? syncResult.value : null;

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;

    const error = dataResult.status === 'rejected';

    return {
      props: {
        tokenDetails,
        transfersDetails,
        holdersDetails,
        syncDetails,
        data,
        dataCount,
        error,
        tab,
      },
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
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
            <div>
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
              </Tabs>
            </div>
          </div>
        </div>
        <div className="py-6"></div>
      </div>
    </>
  );
};

NFToken.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NFToken;
