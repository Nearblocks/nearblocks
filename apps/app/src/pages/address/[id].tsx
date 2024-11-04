import { useRouter } from 'next/router';
import { appUrl, networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Layout from '@/components/Layouts';
import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import { env } from 'next-runtime-env';
import Skeleton from '@/components/skeleton/common/Skeleton';
import SponserdText from '@/components/SponserdText';
import Balance from '@/components/Address/Balance';
import Buttons from '@/components/Address/Buttons';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import classNames from 'classnames';
import 'react-tabs/style/react-tabs.css';
import useRpc from '@/hooks/useRpc';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import {
  AccountDataInfo,
  ContractCodeInfo,
  FtInfo,
  SpamToken,
  TokenListInfo,
} from '@/utils/types';
import Big from 'big.js';
import Transactions from '@/components/Address/Transactions';
import queryString from 'qs';
import TokenTransactions from '@/components/Address/TokenTransactions';
import NFTTransactions from '@/components/Address/NFTTransactions';
import AccessKeys from '@/components/Address/AccessKeys';
import fetcher from '@/utils/fetcher';
import { useFetch } from '@/hooks/useFetch';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import Comment from '@/components/skeleton/common/Comment';
import { useAuthStore } from '@/stores/auth';
import ContractOverview from '@/components/Address/Contract/ContractOverview';
import ListCheck from '@/components/Icons/ListCheck';
import FaCheckCircle from '@/components/Icons/FaCheckCircle';
import { useRpcStore } from '@/stores/rpc';
import dynamic from 'next/dynamic';
import { getCookieFromRequest } from '@/utils/libs';
import { RpcProviders } from '@/utils/rpc';
import { fetchData } from '@/utils/fetchData';
import Receipts from '@/components/Address/Receipts';
import MultiChainTxns from '@/components/Address/MultiChainTxns';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');
const RpcMenu = dynamic(() => import('../../components/Layouts/RpcMenu'), {
  ssr: false,
});

const tabs = [
  'txns',
  'receipts',
  'tokentxns',
  'nfttokentxns',
  'accesskeys',
  'multichaintxns',
  'contract',
  'comments',
];

type TabType =
  | 'txns'
  | 'receipts'
  | 'tokentxns'
  | 'nfttokentxns'
  | 'accesskeys'
  | 'multichaintxns'
  | 'contract'
  | 'comments';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  accountDetails: any;
  contractData: any;
  tokenDetails: any;
  nftTokenDetails: any;
  parseDetails: any;
  inventoryDetails: any;
  data: any;
  dataCount: any;
  error: boolean;
  tab: string;
  latestBlocks: any;
  multiChainAccountsData: any;
}> = async (context) => {
  const {
    query: { id = '', tab = 'txns', ...qs },
    req,
  }: {
    query: {
      id?: string;
      query?: string;
      keyword?: string;
      filter?: string;
      tab?: TabType;
    };
    req: any;
  } = context;

  const address = id.toLowerCase();
  const rpcUrl = getCookieFromRequest('rpcUrl', req) || RpcProviders?.[0]?.url;

  const commonApiUrls = {
    account: id && `account/${address}?rpc=${rpcUrl}`,
    deployments: id && `account/${address}/contract/deployments?rpc=${rpcUrl}`,
    fts: id && `fts/${address}`,
    nfts: id && `nfts/${address}`,
    parse: id && `account/${address}/contract/parse?rpc=${rpcUrl}`,
    inventory: id && `account/${address}/inventory`,
    multiChainAccounts:
      id && `chain-abstraction/${address}/multi-chain-accounts`,
  };

  const urlMapping: Record<TabType, { api: string; count?: string }> = {
    txns: {
      api: `account/${address}/txns-only`,
      count: `account/${address}/txns-only/count`,
    },
    receipts: {
      api: `account/${address}/receipts`,
      count: `account/${address}/receipts/count`,
    },
    tokentxns: {
      api: `account/${address}/ft-txns`,
      count: `account/${address}/ft-txns/count`,
    },
    nfttokentxns: {
      api: `account/${address}/nft-txns`,
      count: `account/${address}/nft-txns/count`,
    },
    accesskeys: {
      api: `account/${address}/keys`,
      count: `account/${address}/keys/count`,
    },
    multichaintxns: {
      api: `chain-abstraction/${address}/txns`,
      count: `chain-abstraction/${address}/txns/count`,
    },
    contract: { api: '' },
    comments: { api: '' },
  };

  const apiUrls = urlMapping[tab as TabType];
  if (!apiUrls) {
    return { notFound: true };
  }

  const fetchCommonData = async (url: string | undefined) => {
    try {
      if (url) {
        const response = await fetcher(url);
        return response;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  };

  // Use Promise.allSettled but track the results better
  const [
    accountResult,
    deploymentResult,
    ftsResult,
    nftResult,
    parseResult,
    inventoryResult,
    multiChainAccountsResult,
  ] = await Promise.allSettled([
    fetchCommonData(commonApiUrls.account),
    fetchCommonData(commonApiUrls.deployments),
    fetchCommonData(commonApiUrls.fts),
    fetchCommonData(commonApiUrls.nfts),
    fetchCommonData(commonApiUrls.parse),
    fetchCommonData(commonApiUrls.inventory),
    fetchCommonData(commonApiUrls.multiChainAccounts),
  ]);

  const { statsDetails, latestBlocks } = await fetchData();

  const getResult = (result: PromiseSettledResult<any>) =>
    result.status === 'fulfilled' ? result.value : null;

  let dataResult = null;
  let dataCountResult = null;

  if (tab !== 'comments') {
    // Fetch tab-specific data with reduced overhead
    const tabApi = urlMapping[tab as TabType];
    const fetchUrl = `${tabApi.api}${
      qs ? `?${queryString.stringify(qs)}` : ''
    }`;
    const countUrl =
      tabApi.count &&
      `${tabApi.count}${qs ? `?${queryString.stringify(qs)}` : ''}`;

    // Fetch data in parallel but limit the number of calls
    const tabResults = await Promise.allSettled([
      fetchCommonData(fetchUrl),
      fetchCommonData(countUrl),
    ]);

    dataResult = getResult(tabResults[0]);
    dataCountResult = getResult(tabResults[1]);
  }

  // Return props with better error handling
  return {
    props: {
      statsDetails: statsDetails,
      accountDetails: getResult(accountResult),
      contractData: getResult(deploymentResult),
      tokenDetails: getResult(ftsResult),
      nftTokenDetails: getResult(nftResult),
      parseDetails: getResult(parseResult),
      inventoryDetails: getResult(inventoryResult),
      data: dataResult,
      dataCount: dataCountResult,
      error: !dataResult, // Set error to true only if dataResult is null
      tab,
      latestBlocks: latestBlocks,
      multiChainAccountsData: getResult(multiChainAccountsResult),
    },
  };
};

const Address = ({
  statsDetails,
  accountDetails,
  contractData,
  tokenDetails,
  nftTokenDetails,
  parseDetails,
  inventoryDetails,
  data,
  dataCount,
  error,
  tab,
  multiChainAccountsData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();
  const { ftBalanceOf, contractCode, viewAccessKeys, viewAccount } = useRpc();
  const [isloading, setIsLoading] = useState(true);
  const [contract, setContract] = useState<ContractCodeInfo | null>(null);
  const [ft, setFT] = useState<FtInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isContractLoading, setIsContractLoading] = useState(true);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [rpcError, setRpcError] = useState(false);
  const rpcUrl: string = useRpcStore((state) => state.rpc);
  const switchRpc: () => void = useRpcStore((state) => state.switchRpc);

  const components = useBosComponents();
  const { data: spamList } = useFetch(
    'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
  );
  const spamTokens: SpamToken = spamList;
  const contractInfo = parseDetails?.contract?.[0]?.contract;
  const schema = parseDetails?.contract?.[0]?.schema;
  const statsData = statsDetails?.stats?.[0];
  const accountData = accountDetails?.account?.[0];
  const deploymentData = contractData?.deployments?.[0];
  const tokenData = tokenDetails?.contracts?.[0];
  const nftTokenData = nftTokenDetails?.contracts?.[0];
  const inventoryData = inventoryDetails?.inventory;
  const multiChainAccounts = multiChainAccountsData?.multiChainAccounts;

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  const txns = data?.txns || [];
  const count = dataCount?.txns?.[0]?.count;
  const txnCursor = data?.cursor;

  const keys = data?.keys || [];
  const keysCount = dataCount?.keys?.[0]?.count || 0;

  useEffect(() => {
    const loadSchema = async () => {
      if (!id) return;

      try {
        setRpcError(false);
        const [code, keys, account]: any = await Promise.all([
          contractCode(id as string).catch((error: any) => {
            console.error(`Error fetching contract code for ${id}:`, error);
            return null;
          }),
          viewAccessKeys(id as string).catch((error: any) => {
            console.error(`Error fetching access keys for ${id}:`, error);
            return null;
          }),
          viewAccount(id as string).catch((error: any) => {
            console.error(`Error fetching account for ${id}:`, error);
            return null;
          }),
        ]);
        if (code && code?.code_base64) {
          setContract({
            block_hash: code.block_hash,
            block_height: code.block_height,
            code_base64: code.code_base64,
            hash: code.hash,
          });
          setIsContractLoading(false);
        } else {
          setContract(null);
          setIsContractLoading(false);
        }

        const locked = (keys.keys || []).every(
          (key: {
            access_key: {
              nonce: string;
              permission: string;
            };
            public_key: string;
          }) => key.access_key.permission !== 'FullAccess',
        );

        if (account) {
          setAccountView(account);
          setIsAccountLoading(false);
        } else {
          setAccountView(null);
          setIsAccountLoading(false);
        }
        setIsLocked(locked);
      } catch (error) {
        // Handle errors appropriately
        setRpcError(true);
        console.error('Error loading schema:', error);
      }
    };

    loadSchema();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, rpcUrl]);

  useEffect(() => {
    if (rpcError) {
      try {
        switchRpc();
      } catch (error) {
        setRpcError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
  }, [rpcError, switchRpc]);

  useEffect(() => {
    const loadBalances = async () => {
      const fts = inventoryData?.fts;
      if (!fts?.length) {
        if (fts?.length === 0) setIsLoading(false);
        setFT(null);
        return;
      }

      let total = Big(0);

      const tokens: TokenListInfo[] = [];

      const pricedTokens: TokenListInfo[] = [];

      await Promise.all(
        fts.map(async (ft: TokenListInfo) => {
          let sum = Big(0);
          let rpcAmount = Big(0);
          try {
            setRpcError(false);
            let amount = await ftBalanceOf(ft.contract, id as string);
            if (amount) {
              rpcAmount = ft?.ft_meta?.decimals
                ? Big(amount).div(Big(10).pow(+ft.ft_meta.decimals))
                : Big(0);
            }
          } catch (error) {
            console.log({ error });
            setRpcError(true);
          }

          if (ft?.ft_meta?.price) {
            sum = rpcAmount.mul(Big(ft?.ft_meta?.price));
            total = total.add(sum);

            return pricedTokens.push({
              ...ft,
              amountUsd: sum.toString(),
              rpcAmount: rpcAmount.toString(),
            });
          }

          return tokens.push({
            ...ft,
            amountUsd: sum.toString(),
            rpcAmount: rpcAmount.toString(),
          });
        }),
      );

      tokens.sort((a, b) => {
        const first = Big(a.rpcAmount);

        const second = Big(b.rpcAmount);

        if (first.lt(second)) return 1;
        if (first.gt(second)) return -1;

        return 0;
      });

      pricedTokens.sort((a, b) => {
        const first = Big(a.amountUsd);

        const second = Big(b.amountUsd);

        if (first.lt(second)) return 1;
        if (first.gt(second)) return -1;

        return 0;
      });

      setFT({
        amount: total.toString(),
        tokens: [...pricedTokens, ...tokens],
      });

      setIsLoading(false);
    };

    loadBalances().catch(console.log);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryData?.fts, id, rpcUrl]);

  const onTab = (index: number) => {
    const { id } = router.query;

    const hasContractTab =
      contractInfo && contractInfo?.methodNames?.length > 0;
    let actualTabName = tabs[index];
    let actualTabIndex = index;

    if (!hasContractTab && index > 5) {
      actualTabIndex = index;
      actualTabName = tabs[actualTabIndex + 1];
    }

    router.push({
      pathname: router.pathname,
      query: { id, tab: actualTabName },
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

  const thumbnail = `${ogUrl}/thumbnail/account?address=${id}&network=${network}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET ' : ''}
         ${t('address:metaTitle', { address: accountData?.account_id ?? '' })}`}
        </title>
        <meta
          name="title"
          content={t('address:metaTitle', {
            address: accountData?.account_id ?? '',
          })}
        />
        <meta
          name="description"
          content={t('address:metaDescription', {
            address: accountData?.account_id ?? '',
          })}
        />
        <meta
          property="og:title"
          content={t('address:metaTitle', {
            address: accountData?.account_id ?? '',
          })}
        />
        <meta
          property="og:description"
          content={t('address:metaDescription', {
            address: accountData?.account_id ?? '',
          })}
        />
        <meta
          property="twitter:title"
          content={t('address:metaTitle', {
            address: accountData?.account_id ?? '',
          })}
        />
        <meta
          property="twitter:description"
          content={t('address:metaDescription', {
            address: accountData?.account_id ?? '',
          })}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link
          rel="canonical"
          href={`${appUrl}/address/${accountData?.account_id}`}
        />
      </Head>

      <div className="relative container mx-auto px-3">
        <div className="flex items-center justify-between flex-wrap pt-4">
          {!id ? (
            <div className="w-80 max-w-xs px-3 py-5">
              <Skeleton className="h-7" />
            </div>
          ) : (
            <div className="flex md:flex-wrap w-full">
              <div className="flex justify-between md:items-center dark:text-neargray-10 border-b w-full mb-5 dark:border-black-200">
                <h1 className="py-2 break-all space-x-2 text-xl text-gray-700 leading-8 px-2  dark:text-neargray-10">
                  Near Account:&nbsp;
                  {id && (
                    <span className="text-green-500 dark:text-green-250">
                      @<span className="font-semibold">{id}</span>
                    </span>
                  )}
                  <Buttons address={id as string} />
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
                      <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full right-0 rounded-lg group-hover:block py-1 z-[99]">
                        <li className="pb-2">
                          <a
                            className={`flex items-center whitespace-nowrap px-2 pt-2 hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250`}
                            href={`https://nearvalidate.org/address/${id}?network=${networkId}`}
                            target="_blank"
                          >
                            Validate Account
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
          )}
          <div className="container mx-auto pl-2 pb-6 text-nearblue-600">
            <div className="min-h-[80px] md:min-h-[25px]">
              <SponserdText />
            </div>
          </div>
        </div>
        <Balance
          accountData={accountData}
          statsData={statsData}
          accountView={accountView}
          isAccountLoading={isAccountLoading}
          isLocked={isLocked}
          contract={contract}
          isContractLoading={isContractLoading}
          tokenData={tokenData}
          loading={false}
          inventoryData={inventoryData}
          spamTokens={spamTokens}
          isloading={isloading}
          inventoryLoading={false}
          ft={ft}
          deploymentData={deploymentData}
          nftTokenData={nftTokenData}
          multiChainAccounts={multiChainAccounts}
        />
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-10">
          <div className="w-full ">
            <>
              <div>
                <Tabs
                  onSelect={onTab}
                  selectedIndex={
                    tab === 'comments' &&
                    contractInfo?.methodNames?.length === undefined
                      ? tabs?.indexOf(tab) - 1
                      : tabs?.indexOf(tab)
                  }
                >
                  <TabList className="flex flex-wrap">
                    {[
                      { key: 0, label: t ? t('address:txns') : 'Transactions' },
                      { key: 1, label: 'Receipts' },
                      {
                        key: 2,
                        label: t ? t('address:tokenTxns') : 'Token Txns',
                      },
                      {
                        key: 3,
                        label: t ? t('address:nftTokenTxns') : 'NFT Token Txns',
                      },
                      {
                        key: 4,
                        label: t ? t('address:accessKeys') : 'Access Keys',
                      },
                      {
                        key: 5,
                        label: 'Multichain Transactions',
                      },
                      ...(contractInfo && contractInfo?.methodNames?.length > 0
                        ? [
                            {
                              key: 6,
                              label: (
                                <div className="flex h-full">
                                  <h2>Contract</h2>
                                  <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-11 -mt-3 px-1">
                                    NEW
                                  </div>
                                </div>
                              ),
                            },
                            {
                              key: 7,
                              label: t ? t('address:comments') : 'Comments',
                            },
                          ]
                        : [
                            {
                              key: 8,
                              label: t ? t('address:comments') : 'Comments',
                            },
                          ]),
                    ].map(({ key, label }) => (
                      <Tab
                        key={key}
                        className={getClassName(
                          tabs[key] ===
                            tabs[
                              tab === 'comments' &&
                              contractInfo?.methodNames?.length === undefined
                                ? tabs?.indexOf(tab) - 1
                                : tabs?.indexOf(tab)
                            ],
                        )}
                        selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                      >
                        <h2>{label}</h2>
                      </Tab>
                    ))}
                  </TabList>
                  <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
                    <TabPanel>
                      <Transactions
                        txns={txns}
                        count={count}
                        error={error}
                        cursor={txnCursor}
                        tab={tab}
                      />
                    </TabPanel>
                    <TabPanel>
                      <Receipts
                        txns={txns}
                        count={count}
                        error={error}
                        cursor={txnCursor}
                        tab={tab}
                      />
                    </TabPanel>
                    <TabPanel>
                      <TokenTransactions
                        txns={txns}
                        count={count}
                        error={error}
                        cursor={txnCursor}
                        tab={tab}
                      />
                    </TabPanel>
                    <TabPanel>
                      <NFTTransactions
                        txns={txns}
                        count={count}
                        error={error}
                        cursor={txnCursor}
                        tab={tab}
                      />
                    </TabPanel>
                    <TabPanel>
                      <AccessKeys
                        keys={keys}
                        count={keysCount}
                        error={error}
                        tab={tab}
                      />
                    </TabPanel>
                    <TabPanel>
                      <MultiChainTxns
                        txns={txns}
                        count={count}
                        error={error}
                        cursor={txnCursor}
                        tab={tab}
                      />
                    </TabPanel>
                    {contractInfo && contractInfo?.methodNames?.length > 0 && (
                      <TabPanel>
                        {tab === 'contract' ? (
                          <ContractOverview
                            schema={schema}
                            contract={contract as ContractCodeInfo}
                            contractInfo={contractInfo}
                            isLocked={isLocked}
                            deployments={contractData}
                            accountId={accountData?.account_id}
                          />
                        ) : (
                          <div className="w-full h-[500px]"></div>
                        )}
                      </TabPanel>
                    )}
                    <TabPanel>
                      <VmComponent
                        src={components?.commentsFeed}
                        defaultSkelton={<Comment />}
                        props={{
                          network: network,
                          path: `nearblocks.io/address/${id}`,
                          limit: 10,
                          requestSignInWithWallet,
                        }}
                        loading={<Comment />}
                      />
                    </TabPanel>
                  </div>
                </Tabs>
              </div>
            </>
          </div>
        </div>
        <div className="mb-10">
          {/* {
          <Widget
            src={`${ownerId}/widget/includes.Common.Banner`}
            props={{ type: 'center', userApiUrl: userApiUrl }}
          />
        } */}
        </div>
      </div>
    </>
  );
};

Address.getLayout = (page: ReactElement) => (
  <>
    <Layout
      statsDetails={page?.props?.statsDetails}
      latestBlocks={page?.props?.latestBlocks}
    >
      {page}
    </Layout>
  </>
);

export default Address;
