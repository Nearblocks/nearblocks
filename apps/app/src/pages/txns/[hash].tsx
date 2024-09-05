import { useRouter } from 'next/router';
import Head from 'next/head';
import { appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import {
  Fragment,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { useAuthStore } from '@/stores/auth';
import SponserdText from '@/components/SponserdText';
import ErrorMessage from '@/components/common/ErrorMessage';
import FileSlash from '@/components/Icons/FileSlash';
import Details from '@/components/Transactions/Details';
import useHash from '@/hooks/useHash';
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
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { transactionStatus } = useRpc();
  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  const txn = data?.txns?.[0];

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
    if (txn?.outcomes?.status === null) {
      const delay = Math.min(1000 * 2 ** retryCount, 15000);
      timeoutRef.current = setTimeout(() => {
        router.replace(router.asPath);
        setRetryCount((prevCount) => prevCount + 1);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [txn, router, retryCount]);

  useEffect(() => {
    if (txn) {
      transactionStatus(txn.transaction_hash, txn.signer_account_id)
        .then(setRpcTxn)
        .catch(console.log);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn]);

  const contract = useMemo(
    () =>
      isContract?.account?.[0]?.code_hash !==
      '11111111111111111111111111111111',
    [isContract],
  );

  const buttonStyles = (selected: boolean) =>
    `relative text-nearblue-600  text-xs leading-4 font-medium inline-block cursor-pointer mb-3 mr-3 focus:outline-none ${
      selected
        ? 'rounded-lg bg-green-600 dark:bg-green-250 text-white'
        : 'hover:bg-neargray-800 bg-neargray-700 dark:text-neargray-10 dark:bg-black-200  rounded-lg hover:text-nearblue-600'
    }`;

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
              <div>
                <button
                  onClick={() => onTab(0)}
                  className={buttonStyles(hashes[0] === hashes[tabIndex])}
                >
                  <h2 className="p-2">
                    {t ? t('txns:txn.tabs.overview') : 'Overview'}
                  </h2>
                </button>
                <button
                  onClick={() => onTab(1)}
                  className={buttonStyles(hashes[1] === hashes[tabIndex])}
                >
                  <h2 className="p-2">
                    {t ? t('txns:txn.tabs.execution') : 'Execution Plan'}
                  </h2>
                </button>
                <button
                  onClick={() => onTab(2)}
                  className={buttonStyles(hashes[2] === hashes[tabIndex])}
                >
                  <h2 className="p-2">{'Enhanced Plan'}</h2>
                  <div className="absolute text-white bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md -top-1.5 -right-1.5 px-1">
                    NEW
                  </div>
                </button>{' '}
                <button
                  onClick={() => onTab(3)}
                  className={buttonStyles(hashes[3] === hashes[tabIndex])}
                >
                  <h2 className="p-2">Tree Plan</h2>
                </button>
                <button
                  onClick={() => onTab(4)}
                  className={buttonStyles(hashes[4] === hashes[tabIndex])}
                >
                  <h2 className="p-2">Receipt Summary</h2>
                </button>
                <button
                  onClick={() => onTab(5)}
                  className={buttonStyles(hashes[5] === hashes[tabIndex])}
                >
                  <h2 className="p-2">
                    {t ? t('txns:txn.tabs.comments') : 'Comments'}
                  </h2>
                </button>
              </div>
              <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                <div className={`${tabIndex === 0 ? '' : 'hidden'} `}>
                  <Details
                    txn={txn}
                    rpcTxn={rpcTxn}
                    statsData={statsData}
                    loading={error || !rpcTxn}
                    isContract={contract}
                    price={price}
                  />
                </div>
                <div className={`${tabIndex === 1 ? '' : 'hidden'} `}>
                  <Receipt
                    txn={txn}
                    rpcTxn={rpcTxn}
                    loading={error || !rpcTxn}
                  />
                </div>
                <div className={`${tabIndex === 2 ? '' : 'hidden'} `}>
                  <Execution txn={txn} rpcTxn={rpcTxn} />
                </div>
                <div className={`${tabIndex === 3 ? '' : 'hidden'} `}>
                  <Tree txn={txn} rpcTxn={rpcTxn} />
                </div>
                <div className={`${tabIndex === 4 ? '' : 'hidden'} `}>
                  <ReceiptSummary
                    txn={txn}
                    rpcTxn={rpcTxn}
                    loading={error || !rpcTxn}
                    statsData={statsData}
                  />
                </div>
                <div className={`${tabIndex === 5 ? '' : 'hidden'} `}>
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
                </div>
              </div>
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
