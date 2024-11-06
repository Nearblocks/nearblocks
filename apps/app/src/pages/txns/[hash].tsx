import { useRouter } from 'next/router';
import Head from 'next/head';
import { appUrl, networkId } from '@/utils/config';
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
import ListCheck from '@/components/Icons/ListCheck';
import { ExecutionOutcomeWithIdView } from '@/utils/types';
import FaCheckCircle from '@/components/Icons/FaCheckCircle';
import {
  calculateGasUsed,
  calculateTotalDeposit,
  calculateTotalGas,
  txnFee,
} from '@/utils/near';
import { useRpcStore } from '@/stores/rpc';
import dynamic from 'next/dynamic';
import { fetchData } from '@/utils/fetchData';

const RpcMenu = dynamic(() => import('../../components/Layouts/RpcMenu'), {
  ssr: false,
});
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
  }: any = context;

  try {
    const [dataResult] = await Promise.allSettled([fetcher(`txns/${hash}`)]);

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const error = dataResult.status === 'rejected';

    const txn = data && data?.txns?.[0];

    const { statsDetails, latestBlocks } = await fetchData();

    let price: number | null = null;
    if (txn?.block_timestamp) {
      const timestamp = new Date(nanoToMilli(txn?.block_timestamp));
      const currentDate = new Date();
      const currentDt =
        currentDate && currentDate?.toISOString()?.split('T')[0];
      const blockDt = timestamp && timestamp?.toISOString()?.split('T')[0];

      if (currentDt > blockDt) {
        const priceData = await fetcher(`stats/price?date=${blockDt}`);
        price = priceData?.stats?.[0]?.near_price || null;
      }
    }

    let isContract = null;
    if (txn?.receiver_account_id) {
      const [contractResult] = await Promise.allSettled([
        fetcher(`account/${txn?.receiver_account_id}`),
      ]);

      isContract =
        contractResult?.status === 'fulfilled' ? contractResult?.value : null;
    }

    return {
      props: {
        data,
        error,
        statsData: statsDetails,
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
  const [rpcData, setRpcData] = useState<any>({});
  const [rpcError, setRpcError] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { transactionStatus, getBlockDetails } = useRpc();
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);
  const [allRpcProviderError, setAllRpcProviderError] = useState(false);

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  const txn = data && data?.txns?.[0];

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
    if (txn?.outcomes?.status === null || data === null || error) {
      const delay = Math.min(1000 * 2 ** retryCount.current, 150000);
      timeoutRef.current = setTimeout(() => {
        router.replace(router.asPath);
        retryCount.current += 1;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, router, retryCount, rpcUrl]);

  useEffect(() => {
    if (rpcError) {
      try {
        switchRpc();
      } catch (error) {
        setRpcError(true);
        setAllRpcProviderError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
  }, [rpcError, switchRpc]);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      if (!txn) return;

      try {
        setRpcError(false);
        const res = await transactionStatus(
          txn.transaction_hash,
          txn.signer_account_id,
        );
        setRpcTxn(res);
      } catch {
        setRpcError(true);
      }
    };

    fetchTransactionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, rpcUrl]);

  useEffect(() => {
    const checkTxnExistence = async () => {
      if (txn === undefined || data === null || error) {
        try {
          setRpcError(false);
          const txnExists: any = await transactionStatus(hash, 'bowen');
          const status = txnExists?.status?.Failure ? false : true;
          let block: any = {};

          if (txnExists) {
            block = await getBlockDetails(
              txnExists.transaction_outcome.block_hash,
            );
          }

          const modifiedTxns = {
            transaction_hash: txnExists?.transaction_outcome?.id,
            included_in_block_hash: txnExists?.transaction_outcome?.block_hash,
            outcomes: { status: status },
            block: { block_height: block?.header?.height },
            block_timestamp: block?.header?.timestamp_nanosec,
            receiver_account_id: txnExists?.transaction?.receiver_id,
            signer_account_id: txnExists?.transaction?.signer_id,
            receipt_conversion_gas_burnt:
              txnExists?.transaction_outcome?.outcome?.gas_burnt?.toString(),
            receipt_conversion_tokens_burnt:
              txnExists.transaction_outcome?.outcome?.tokens_burnt,
            actions_agg: {
              deposit: calculateTotalDeposit(txnExists?.transaction?.actions),
              gas_attached: calculateTotalGas(txnExists?.transaction?.actions),
            },
            outcomes_agg: {
              transaction_fee: txnFee(
                (txnExists?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                  [],
                txnExists?.transaction_outcome?.outcome?.tokens_burnt ?? '0',
              ),
              gas_used: calculateGasUsed(
                (txnExists?.receipts_outcome as ExecutionOutcomeWithIdView[]) ??
                  [],
                txnExists?.transaction_outcome?.outcome?.gas_burnt ?? '0',
              ),
            },
          };
          if (txnExists) {
            setRpcTxn(txnExists);
            setRpcData(modifiedTxns);
          }
        } catch (error) {
          setRpcError(true);
        }
      }
    };

    checkTxnExistence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn, hash, rpcUrl]);

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
        <div className="flex justify-between dark:text-neargray-10 border-b w-full px-2 pt-3 dark:border-black-200">
          <h1 className="py-2 space-x-2 text-xl leading-8 text-nearblue-600 dark:text-neargray-10">
            {t ? t('txns:txn.heading') : 'Transaction Details'}
          </h1>

          <ul className="flex relative md:pt-0 pt-2 items-center text-gray-500 text-xs">
            <RpcMenu />
            <li className="ml-3 max-md:mb-2">
              <span className="group flex w-full relative h-full">
                <a
                  className={`md:flex justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline px-0 py-1`}
                  href="#"
                >
                  <div className="py-2 px-2 h-8 bg-gray-100 dark:bg-black-200 rounded border">
                    <ListCheck className="h-4 dark:filter dark:invert" />
                  </div>
                </a>
                <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full right-0 rounded-md group-hover:block py-1 z-[99]">
                  <li className="pb-2">
                    <a
                      className={`flex items-center whitespace-nowrap px-2 pt-2 hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250`}
                      href={`https://nearvalidate.org/txns/${hash}?network=${networkId}`}
                      target="_blank"
                    >
                      Validate Transaction
                      <span className="w-4 ml-3 dark:text-green-250">
                        <FaCheckCircle />
                      </span>
                    </a>
                  </li>
                </ul>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto pt-3 pb-6 px-5 text-nearblue-600">
        <div className="min-h-[44px] md:min-h-[25px]">
          <SponserdText />
        </div>
      </div>
      <div className="relative container mx-auto px-3">
        {/* <RpcMenu /> */}
        <Fragment key="hash">
          {rpcError && (error || allRpcProviderError) ? (
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
              <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
                <ErrorMessage
                  icons={<FileSlash />}
                  message="Sorry, we are unable to locate this transaction hash. Please try again later."
                  mutedText={hash || ''}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="md:flex justify-between">
                <div className="w-fit">
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
              </div>
              <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                <div className={`${tabIndex === 0 ? '' : 'hidden'} `}>
                  <Details
                    txn={txn ? txn : rpcData}
                    rpcTxn={rpcTxn}
                    statsData={statsData}
                    loading={rpcError || !rpcTxn}
                    isContract={contract}
                    price={price}
                  />
                </div>
                <div className={`${tabIndex === 1 ? '' : 'hidden'} `}>
                  <Receipt
                    txn={txn ? txn : rpcData}
                    rpcTxn={rpcTxn}
                    loading={rpcError || !rpcTxn}
                    statsData={statsData}
                  />
                </div>
                <div className={`${tabIndex === 2 ? '' : 'hidden'} `}>
                  <Execution
                    txn={txn ? txn : rpcData}
                    rpcTxn={rpcTxn}
                    statsData={statsData}
                  />
                </div>
                <div className={`${tabIndex === 3 ? '' : 'hidden'} `}>
                  <Tree txn={txn ? txn : rpcData} rpcTxn={rpcTxn} />
                </div>
                <div className={`${tabIndex === 4 ? '' : 'hidden'} `}>
                  <ReceiptSummary
                    txn={txn ? txn : rpcData}
                    rpcTxn={rpcTxn}
                    loading={rpcError || !rpcTxn}
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
