import { useRouter } from 'next/router';
import { appUrl } from '@/utils/config';
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
import Overview from '@/components/Address/Contract/Overview';
import fetcher from '@/utils/fetcher';
import { useFetch } from '@/hooks/useFetch';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import Comment from '@/components/skeleton/common/Comment';
import { useAuthStore } from '@/stores/auth';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const tabs = [
  'txns',
  'tokentxns',
  'nfttokentxns',
  'accesskeys',
  'contract',
  'comments',
];

type TabType =
  | 'txns'
  | 'tokentxns'
  | 'nfttokentxns'
  | 'accesskeys'
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
}> = async (context) => {
  const {
    query: { id = '', tab = 'txns', ...query },
  }: { query: { id?: string; tab?: TabType } } = context;

  const address = id.toLowerCase();

  const commonApiUrls = {
    stats: 'stats',
    account: id && `account/${address}`,
    deployments: id && `account/${address}/contract/deployments`,
    fts: id && `fts/${address}`,
    nfts: id && `nfts/${address}`,
    parse: id && `account/${address}/contract/parse`,
    latestBlocks: `blocks/latest?limit=1`,
    inventory: id && `account/${address}/inventory`,
  };

  const urlMapping: Record<TabType, { api: string; count?: string }> = {
    txns: {
      api: `account/${address}/txns`,
      count: `account/${address}/txns/count`,
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
    contract: { api: `` },
    comments: { api: `` },
  };

  const apiUrls = urlMapping[tab as TabType];
  if (!apiUrls) {
    return { notFound: true };
  }

  const fetchData = async (url: string | undefined) =>
    url ? await fetcher(url) : null;

  try {
    const [
      statsResult,
      accountResult,
      deploymentResult,
      ftsResult,
      nftResult,
      parseResult,
      inventoryResult,
      latestBlocksResult,
    ] = await Promise.allSettled([
      fetchData(commonApiUrls.stats),
      fetchData(commonApiUrls.account),
      fetchData(commonApiUrls.deployments),
      fetchData(commonApiUrls.fts),
      fetchData(commonApiUrls.nfts),
      fetchData(commonApiUrls.parse),
      fetchData(commonApiUrls.inventory),
      fetchData(commonApiUrls.latestBlocks),
    ]);

    const getResult = (result: PromiseSettledResult<any>) =>
      result.status === 'fulfilled' ? result.value : null;

    let dataResult = null;
    let dataCountResult = null;

    if (tab !== 'comments') {
      // Fetch tab-specific data
      const tabApi = urlMapping[tab as TabType];
      const fetchUrl = `${tabApi.api}${
        query ? `?${queryString.stringify(query)}` : ''
      }`;
      const countUrl =
        tabApi.count &&
        `${tabApi.count}${query ? `?${queryString.stringify(query)}` : ''}`;

      [dataResult, dataCountResult] = await Promise.allSettled([
        fetchData(fetchUrl),
        fetchData(countUrl),
      ]);
    }

    return {
      props: {
        statsDetails: getResult(statsResult),
        accountDetails: getResult(accountResult),
        contractData: getResult(deploymentResult),
        tokenDetails: getResult(ftsResult),
        nftTokenDetails: getResult(nftResult),
        parseDetails: getResult(parseResult),
        inventoryDetails: getResult(inventoryResult),
        data: dataResult && getResult(dataResult),
        dataCount: dataCountResult && getResult(dataCountResult),
        error: !!(dataResult && dataResult.status === 'rejected'),
        tab,
        latestBlocks: getResult(latestBlocksResult),
      },
    };
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return {
      props: {
        statsDetails: null,
        accountDetails: null,
        contractData: null,
        tokenDetails: null,
        nftTokenDetails: null,
        parseDetails: null,
        inventoryDetails: null,
        data: null,
        dataCount: null,
        error: true,
        tab: 'txns',
        latestBlocks: null,
      },
    };
  }
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
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);
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

  const components = useBosComponents();
  const { data: spamList } = useFetch(
    'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
  );
  const spamTokensString = spamList && spamList.replace(/,\s*([}\]])/g, '$1');
  const spamTokens: SpamToken =
    spamTokensString && JSON.parse(spamTokensString);

  const contractInfo = parseDetails?.contract?.[0]?.contract;
  const schema = parseDetails?.contract?.[0]?.schema;
  const statsData = statsDetails?.stats?.[0];
  const accountData = accountDetails?.account?.[0];
  const deploymentData = contractData?.deployments?.[0];
  const tokenData = tokenDetails?.contracts?.[0];
  const nftTokenData = nftTokenDetails?.contracts?.[0];
  const inventoryData = inventoryDetails?.inventory;

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
        console.error('Error loading schema:', error);
      }
    };

    loadSchema();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
            let amount = await ftBalanceOf(ft.contract, id as string);
            if (amount) {
              rpcAmount = ft?.ft_meta?.decimals
                ? Big(amount).div(Big(10).pow(+ft.ft_meta.decimals))
                : Big(0);
            }
          } catch (error) {
            console.log({ error });
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
  }, [inventoryData?.fts, id]);

  useEffect(() => {
    if (tab) {
      const index = tabs.indexOf(tab as string);
      if (index !== -1) {
        const hasContractTab =
          contractInfo && contractInfo.methodNames.length > 0;
        let actualTabIndex = index;
        if (!hasContractTab && index > 4) {
          actualTabIndex = index - 1;
        }
        setTabIndex(actualTabIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const onTab = (index: number) => {
    const { id } = router.query;

    const hasContractTab = contractInfo && contractInfo.methodNames.length > 0;
    let actualTabName = tabs[index];
    let actualTabIndex = index;

    if (!hasContractTab && index > 3) {
      actualTabIndex = index;
      actualTabName = tabs[actualTabIndex + 1];
    }

    setTabIndex(actualTabIndex);

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
              <h1 className="py-2 break-all space-x-2 text-xl text-gray-700 leading-8 px-2 dark:text-neargray-10 border-b w-full mb-5 dark:border-black-200">
                Near Account:&nbsp;
                {id && (
                  <span className="text-green-500 dark:text-green-250">
                    @<span className="font-semibold">{id}</span>
                  </span>
                )}
                <Buttons address={id as string} />
              </h1>
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
        />
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-10">
          <div className="w-full ">
            <>
              <div>
                <Tabs onSelect={onTab} selectedIndex={tabIndex}>
                  <TabList className="flex flex-wrap">
                    {[
                      { key: 0, label: t ? t('address:txns') : 'Transactions' },
                      {
                        key: 1,
                        label: t ? t('address:tokenTxns') : 'Token Txns',
                      },
                      {
                        key: 2,
                        label: t ? t('address:nftTokenTxns') : 'NFT Token Txns',
                      },
                      {
                        key: 3,
                        label: t ? t('address:accessKeys') : 'Access Keys',
                      },
                      ...(contractInfo && contractInfo.methodNames.length > 0
                        ? [
                            {
                              key: 4,
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
                              key: 5,
                              label: t ? t('address:comments') : 'Comments',
                            },
                          ]
                        : [
                            {
                              key: 4,
                              label: t ? t('address:comments') : 'Comments',
                            },
                          ]),
                    ].map(({ key, label }) => (
                      <Tab
                        key={key}
                        className={getClassName(tabs[key] === tabs[tabIndex])}
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
                    {contractInfo && contractInfo.methodNames.length > 0 && (
                      <TabPanel>
                        {tab === 'contract' ? (
                          <Overview
                            schema={schema}
                            contract={contract as ContractCodeInfo}
                            contractInfo={contractInfo}
                            isLocked={isLocked}
                            deployments={contractData}
                          />
                        ) : (
                          <div className="w-full h-[500px]"></div>
                        )}
                      </TabPanel>
                    )}
                    <TabPanel>
                      {tab === 'comments' ? (
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
                      ) : (
                        <div className="w-full h-[500px]"></div>
                      )}
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
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default Address;
