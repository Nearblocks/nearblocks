import classNames from 'classnames';

import { Link } from '@/i18n/routing';
import { getRequest, getRequestBeta } from '@/utils/app/api';
import { Token } from '@/utils/types';

import FAQ from '@/components/app/Tokens/FT/FAQ';
import Holders from '@/components/app/Tokens/FT/Holders';
import Info from '@/components/app/Tokens/FT/Info';
import Transfers from '@/components/app/Tokens/FT/Transfers';

type TabType = 'faq' | 'holders' | 'info' | 'transfers';

export default async function TokenTabs({
  id,
  searchParams,
}: {
  id: string;
  searchParams: any;
}) {
  const tab = searchParams?.tab || 'transfers';
  const isValidTabType = (value: string): value is TabType => {
    return ['faq', 'holders', 'info', 'transfers'].includes(value);
  };
  const selectedTab: TabType = isValidTabType(tab) ? tab : 'transfers';

  const tabApiUrls: Record<TabType, { api: string; count?: string }> = {
    faq: { api: `v1/fts/${id}` },
    holders: {
      api: `v1/fts/${id}/holders`,
    },
    info: { api: `v1/fts/${id}` },
    transfers: {
      api: `v3/fts/${id}/txns`,
    },
  };

  const tabApi = tabApiUrls[selectedTab as TabType];
  const fetchUrl = `${tabApi?.api}`;

  const fetchData = (url: string, params: any, opts?: RequestInit) => {
    return url.startsWith('v3')
      ? getRequestBeta(url, params, opts)
      : getRequest(url, params, opts);
  };

  const [
    dataResult,
    transferCount,
    tokenDetails,
    syncDetails,
    holdersCount,
    accountDetails,
    contractResult,
  ] = await Promise.all([
    fetchData(fetchUrl, searchParams, { next: { revalidate: 10 } }),
    getRequestBeta(
      `v3/fts/${id}/txns/count${
        searchParams?.a ? `?account=${searchParams.a}` : ''
      }`,
    ),
    getRequest(`v1/fts/${id}`),
    getRequest(`v1/sync/status`),
    getRequest(`v1/fts/${id}/holders/count`),
    getRequest(`v1/account/${id}`),
    getRequest(`v1/account/${id}/contract/deployments`),
  ]);
  const holder = dataResult?.holders || [];
  const holders = holdersCount?.holders?.[0]?.count;
  const txns = dataResult?.data || [];
  const txnCursor = dataResult?.meta?.cursor;
  const transfers = transferCount?.data?.count;
  const token: Token = tokenDetails?.contracts?.[0];
  const status = syncDetails?.status?.aggregates?.ft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };
  const account = accountDetails?.account?.[0];
  const contract = contractResult?.deployments?.[0];
  const tabs = [
    { label: 'Transfers', message: 'fts.ft.transfers', name: 'transfers' },
    { label: 'Holders', message: 'fts.ft.holders', name: 'holders' },
    { label: 'Info', message: 'fts.ft.info', name: 'info' },
    { label: 'FAQ', message: 'fts.ft.faq', name: 'faq' },
  ];
  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 dark:hover:bg-black-100 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );

  if (dataResult.errors && dataResult.errors.length > 0) {
    throw new Error(`Server Error : ${dataResult.errors[0].message}`);
  }

  return (
    <div className="block lg:flex lg:space-x-2 mb-10">
      <div className="w-full ">
        <div className="flex flex-wrap ">
          {tabs?.map(({ label, name }) => {
            return (
              <Link
                className={getClassName(name === selectedTab)}
                href={
                  name === 'transfers'
                    ? `/token/${id}`
                    : `/token/${id}?tab=${name}`
                }
                key={name}
              >
                <h2>{label}</h2>
              </Link>
            );
          })}
        </div>
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
          {selectedTab === 'transfers' ? (
            <Transfers
              count={transfers}
              cursor={txnCursor}
              error={!txns}
              tab={selectedTab}
              txns={txns}
            />
          ) : null}
          {selectedTab === 'holders' ? (
            <Holders
              count={holders}
              error={!txns}
              holder={holder}
              status={status}
              tab={selectedTab}
              token={token}
            />
          ) : null}
          {selectedTab === 'info' ? (
            <Info error={!txns} tab={selectedTab} token={token} />
          ) : null}
          {selectedTab === 'faq' ? (
            <FAQ
              account={account}
              contract={contract}
              holdersCount={holders}
              holdersData={holder}
              id={id}
              tab={selectedTab}
              token={token}
              transfers={transfers}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
