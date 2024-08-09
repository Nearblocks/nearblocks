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
import { fetcher } from '@/hooks/useFetch';
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
  tab: any;
}> = async (context) => {
  const {
    query: { id = '', tab = 'txns', ...query },
  }: any = context;

  let txnApiUrl = '';
  let txnCountUrl = '';
  let fetchUrl = '';
  let countUrl = '';

  switch (tab) {
    case 'txns':
      txnApiUrl = id && `account/${id}/txns`;
      txnCountUrl = id && `account/${id}/txns/count`;
      break;
    case 'tokentxns':
      txnApiUrl = id && `account/${id}/ft-txns`;
      txnCountUrl = id && `account/${id}/ft-txns/count`;
      break;
    case 'nfttoken id && txns':
      txnApiUrl = `account/${id}/nft-txns`;
      txnCountUrl = id && `account/${id}/nft-txns/count`;
      break;
    case 'accesskeys':
      txnApiUrl = id && `account/${id}/keys`;
      txnCountUrl = id && `account/${id}/keys/count`;
      break;
    default:
      return {
        notFound: true,
      };
  }

  fetchUrl = query
    ? `${txnApiUrl}?${queryString.stringify(query)}`
    : `${txnApiUrl}`;

  countUrl = query
    ? `${txnCountUrl}?${queryString.stringify(query)}`
    : `${txnCountUrl}`;

  try {
    const [
      statsResult,
      accountResult,
      deploymentResult,
      ftsResult,
      nftResult,
      parseResult,
      inventoryResult,
      dataResult,
      dataCountResult,
    ] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(id && `account/${id}`),
      fetcher(id && `account/${id}/contract/deployments`),
      fetcher(id && `fts/${id}`),
      fetcher(id && `nfts/${id}`),
      fetcher(id && `account/${id}/contract/parse`),
      fetcher(id && `account/${id}/inventory`),
      fetcher(fetchUrl),
      fetcher(countUrl),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const accountDetails =
      accountResult.status === 'fulfilled' ? accountResult.value : null;
    const contractData =
      deploymentResult.status === 'fulfilled' ? deploymentResult.value : null;
    const tokenDetails =
      ftsResult.status === 'fulfilled' ? ftsResult.value : null;
    const nftTokenDetails =
      nftResult.status === 'fulfilled' ? nftResult.value : null;
    const parseDetails =
      parseResult.status === 'fulfilled' ? parseResult.value : null;
    const inventoryDetails =
      inventoryResult.status === 'fulfilled' ? inventoryResult.value : null;

    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;

    const error = dataResult.status === 'rejected';

    return {
      props: {
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
  const [ft, setFT] = useState<FtInfo>({} as FtInfo);
  const [isLocked, setIsLocked] = useState(false);
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [isAccountLoading, setIsAccountLoading] = useState(false);
  const [accountView, setAccountView] = useState<AccountDataInfo | null>(null);
  const [spamTokens, setSpamTokens] = useState<SpamToken>({ blacklist: [] });

  const contractInfo = parseDetails?.contract?.[0]?.contract;
  const schema = parseDetails?.contract?.[0]?.schema;
  const statsData = statsDetails?.stats?.[0];
  const accountData = accountDetails?.account?.[0];
  const deploymentData = contractData?.deployments?.[0];
  const tokenData = tokenDetails?.contracts?.[0];
  const nftTokenData = nftTokenDetails?.contracts?.[0];
  const inventoryData = inventoryDetails?.inventory;

  const txns = data?.txns || [];
  const count = dataCount?.txns?.[0]?.count;
  const txnCursor = data?.cursor;

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
        }
        setIsLocked(locked);
      } catch (error) {
        // Handle errors appropriately
        console.error('Error loading schema:', error);
      }

      fetcher(
        'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
      )
        .then((data) => {
          setSpamTokens(data);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          // Handle error accordingly
        });
    };

    loadSchema();
  }, [id]);

  useEffect(() => {
    const loadBalances = async () => {
      const fts = inventoryData?.fts;
      if (!fts?.length) {
        if (fts?.length === 0) setIsLoading(false);
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
  }, [inventoryData?.fts, id]);

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

  const thumbnail = `${ogUrl}/thumbnail/account?address=${id}&network=${network}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET ' : ''}
         ${t('address:metaTitle', { address: id })}`}
        </title>
        <meta name="title" content={t('address:metaTitle', { address: id })} />
        <meta
          name="description"
          content={t('address:metaDescription', { address: id })}
        />
        <meta
          property="og:title"
          content={t('address:metaTitle', { address: id })}
        />
        <meta
          property="og:description"
          content={t('address:metaDescription', { address: id })}
        />
        <meta
          property="twitter:title"
          content={t('address:metaTitle', { address: id })}
        />
        <meta
          property="twitter:description"
          content={t('address:metaDescription', { address: id })}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/address/${id}`} />
      </Head>
      <div className="relative container mx-auto px-3">
        <div className="flex items-center justify-between flex-wrap pt-4">
          {!id ? (
            <div className="w-80 max-w-xs px-3 py-5">
              <Skeleton className="h-7" />
            </div>
          ) : (
            <div className="flex md:flex-wrap w-full">
              <h1 className="py-2 break-all space-x-2 text-xl text-gray-700 leading-8 px-2 dark:text-neargray-10 border-b w-full mb-5">
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
            <SponserdText />
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
                <Tabs
                  onSelect={(index) => onTab(index)}
                  selectedIndex={tabIndex}
                >
                  <TabList className={'flex flex-wrap'}>
                    <Tab
                      className={getClassName(tabs[0] === tabs[tabIndex])}
                      selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                    >
                      <h2>{t ? t('address:txns') : 'Transactions'}</h2>
                    </Tab>
                    <Tab
                      className={getClassName(tabs[1] === tabs[tabIndex])}
                      selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                    >
                      <h2>{t ? t('address:tokenTxns') : 'Token Txns'}</h2>
                    </Tab>
                    <Tab
                      className={getClassName(tabs[2] === tabs[tabIndex])}
                      selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                    >
                      <h2>
                        {t ? t('address:nftTokenTxns') : 'NFT Token Txns'}
                      </h2>
                    </Tab>
                    <Tab
                      className={getClassName(tabs[3] === tabs[tabIndex])}
                      selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                    >
                      <h2>{t ? t('address:accessKeys') : 'Access Keys'}</h2>
                    </Tab>
                    {contractInfo && contractInfo?.methodNames?.length > 0 && (
                      <Tab
                        className={getClassName(tabs[4] === tabs[tabIndex])}
                        selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                      >
                        <div className="flex h-full">
                          <h2>Contract</h2>
                          <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-11 -mt-3 px-1 ">
                            NEW
                          </div>
                        </div>
                      </Tab>
                    )}
                    <Tab
                      className={getClassName(tabs[5] === tabs[tabIndex])}
                      selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                    >
                      <h2>{t ? t('address:comments') : 'Comments'}</h2>
                    </Tab>
                  </TabList>
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
                  <TabPanel>{/* <AccessKeys /> */}</TabPanel>
                  <TabPanel>
                    {/* <Overview
                    schema={schema}
                    contract={contract as ContractCodeInfo}
                    contractInfo={contractInfo}
                    isLocked={isLocked}
                  /> */}
                  </TabPanel>
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

Address.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Address;
