import { useRouter } from 'next/router';
import Head from 'next/head';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { Fragment, ReactElement, useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { useAuthStore } from '@/stores/auth';
import SponserdText from '@/components/SponserdText';
import ErrorMessage from '@/components/common/ErrorMessage';
import FileSlash from '@/components/Icons/FileSlash';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Details from '@/components/Transactions/Details';
import useHash from '@/hooks/useHash';
import classNames from 'classnames';
import Receipt from '@/components/Transactions/Receipt';
import Execution from '@/components/Transactions/Execution';
import Tree from '@/components/Transactions/Tree';
import ReceiptSummary from '@/components/Transactions/ReceiptSummary';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import Comment from '@/components/skeleton/common/Comment';
import useRpc from '@/hooks/useRpc';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import fetcher from '@/utils/fetcher';
import { nanoToMilli } from '@/utils/libs';
import { Spinner } from '@/components/common/Spinner';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');
const hashes = [' ', 'execution', 'enhanced', 'tree', 'summary', 'comments'];

export const getServerSideProps: GetServerSideProps<{
  data: any;
  statsData: any;
  error: boolean;
  isContract: any;
  price: any;
  latestBlocks: any;
}> = async (context) => {
  const {
    query: { hash = '' },
  } = context;

  try {
    const [dataResult, statsDataResult, latestBlocksResult] =
      await Promise.allSettled([
        fetcher(`txns/${hash}`),
        fetcher(`stats`),
        fetcher(`blocks/latest?limit=1`),
      ]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const statsData =
      statsDataResult.status === 'fulfilled' ? statsDataResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    const error = dataResult.status === 'rejected';

    const txn = data?.txns?.[0];

    let price: number | null = null;
    if (txn?.block_timestamp) {
      const timestamp = new Date(nanoToMilli(txn.block_timestamp));
      const currentDate = new Date();
      const currentDt = currentDate.toISOString().split('T')[0];
      const blockDt = timestamp.toISOString().split('T')[0];

      if (currentDt > blockDt) {
        const priceData = await fetcher(`stats/price?date=${blockDt}`);
        price = priceData?.stats?.[0]?.near_price || null;
      }
    }
    const [contractResult] = await Promise.allSettled([
      fetcher(`account/${txn.receiver_account_id}`),
    ]);

    const isContract =
      contractResult.status === 'fulfilled' ? contractResult.value : null;
    return {
      props: {
        data,
        error,
        statsData,
        isContract,
        price,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      props: {
        data: null,
        error: true,
        statsData: null,
        isContract: false,
        price: null,
        latestBlocks: null,
      },
    };
  }
};

const Txn = ({
  data,
  error,
  statsData,
  isContract,
  price,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { t } = useTranslation();
  const components = useBosComponents();
  const { hash } = router.query;
  const [pageHash, setHash] = useHash();
  const [rpcTxn, setRpcTxn] = useState<any>({});
  const [tabIndex, setTabIndex] = useState(0);
  const { transactionStatus } = useRpc();
  const txn = data?.txns?.[0];
  const [loading, setLoading] = useState(false);

  let title = t('txns:txn.metaTitle', { txn: hash });
  title = `${network === 'testnet' ? 'TESTNET' : ''} ${title}`;
  const description = t('txns:txn.metaDescription', { txn: hash });
  const thumbnail = `${ogUrl}/thumbnail/txn?transaction_hash=${hash}&network=${network}&brand=near`;

  useEffect(() => {
    const index = hashes.indexOf(pageHash as string);

    setTabIndex(index === -1 ? 0 : index);
  }, [pageHash]);

  const onTab = (index: number) => setHash(hashes[index]);

  useEffect(() => {
    if (txn) {
      transactionStatus(txn.transaction_hash, txn.signer_account_id)
        .then(setRpcTxn)
        .catch(console.log);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, tabIndex]);

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  const contract = useMemo(
    () =>
      isContract.account?.[0]?.code_hash !== '11111111111111111111111111111111',
    [isContract],
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

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-3 focus:outline-none rounded-lg',
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
        <link rel="canonical" href={`${appUrl}/txns/${hash}`} />
      </Head>
      <div className="md:flex items-center justify-between container mx-auto px-3">
        <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 pt-5 pb-2 border-b w-full dark:border-black-200">
          {t ? t('txns:txn.heading') : 'Transaction Details'}
        </h1>
      </div>
      {loading && <Spinner />}
      <div className="container mx-auto pt-3 pb-6 px-5 text-nearblue-600">
        <div className="min-h-[80px] md:min-h-[25px]">
          <SponserdText />
        </div>
      </div>
      <div className="relative container mx-auto px-3">
        <Fragment key="hash">
          {error || !data ? (
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
                <ErrorMessage
                  icons={<FileSlash />}
                  message="Sorry, We are unable to locate this TxnHash"
                  mutedText={hash || ''}
                />
              </div>
            </div>
          ) : (
            <>
              <Tabs onSelect={(index) => onTab(index)} selectedIndex={tabIndex}>
                <TabList className={'flex flex-wrap'}>
                  <Tab
                    className={getClassName(hashes[0] === hashes[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>{t('txns:txn.tabs.overview')}</h2>
                  </Tab>
                  <Tab
                    className={getClassName(hashes[1] === hashes[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>{t('txns:txn.tabs.execution')}</h2>
                  </Tab>
                  <Tab
                    className={getClassName(hashes[2] === hashes[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <div className="flex h-full">
                      <h2>Enhanced Plan</h2>
                      <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-[4.7rem] -mt-4 px-1 ">
                        NEW
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    className={getClassName(hashes[3] === hashes[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>Tree Plan</h2>
                  </Tab>

                  <Tab
                    className={getClassName(hashes[4] === hashes[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>Receipt Summary</h2>
                  </Tab>
                  <Tab
                    className={getClassName(hashes[5] === hashes[tabIndex])}
                    selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                  >
                    <h2>{t('txns:txn.tabs.comments')}</h2>
                  </Tab>
                </TabList>
                <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                  <TabPanel>
                    <Details
                      txn={txn}
                      rpcTxn={rpcTxn}
                      statsData={statsData}
                      loading={error || !rpcTxn}
                      isContract={contract}
                      price={price}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Receipt
                      txn={txn}
                      rpcTxn={rpcTxn}
                      loading={error || !rpcTxn}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Execution txn={txn} rpcTxn={rpcTxn} />
                  </TabPanel>
                  <TabPanel>
                    <Tree txn={txn} rpcTxn={rpcTxn} />
                  </TabPanel>
                  <TabPanel>
                    <ReceiptSummary
                      txn={txn}
                      rpcTxn={rpcTxn}
                      loading={error || !rpcTxn}
                      statsData={statsData}
                    />
                  </TabPanel>
                  <TabPanel>
                    <VmComponent
                      src={components?.commentsFeed}
                      defaultSkelton={<Comment />}
                      props={{
                        network: network,
                        path: `nearblocks.io/txns/${hash}`,
                        limit: 10,
                        requestSignInWithWallet,
                      }}
                      loading={<Comment />}
                    />
                  </TabPanel>
                </div>
              </Tabs>
            </>
          )}
        </Fragment>
      </div>
      <div className="py-8"></div>
    </>
  );
};

Txn.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsData}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);
export default Txn;
