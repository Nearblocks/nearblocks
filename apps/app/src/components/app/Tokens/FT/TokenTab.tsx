import classNames from 'classnames';

import { Link } from '@/i18n/routing';
import { getRequest } from '@/utils/app/api';
import { Token } from '@/utils/types';

import FAQ from './FAQ';
import Holders from './Holders';
import Info from './Info';
import Transfers from './Transfers';

type TabType = 'comments' | 'faq' | 'holders' | 'info' | 'transfers';

export default async function TokenTabs({
  id,
  searchParams,
}: {
  id: string;
  searchParams: any;
}) {
  const tab = searchParams?.tab || 'transfers';

  const tabApiUrls: Record<TabType, { api: string; count?: string }> = {
    comments: { api: '' },
    faq: { api: `v1/fts/${id}` },
    holders: {
      api: `v1/fts/${id}/holders`,
      count: `v1/fts/${id}/holders/count`,
    },
    info: { api: `v1/fts/${id}` },
    transfers: { api: `v1/fts/${id}/txns`, count: `v1/fts/${id}/txns/count` },
  };

  const tabApi = tabApiUrls[tab as TabType];
  const fetchUrl = `${tabApi.api}`;

  const [
    dataResult,
    transferResult,
    tokenDetails,
    syncDetails,
    holdersDetails,
    accountDetails,
    contractResult,
  ] = await Promise.all([
    getRequest(fetchUrl, searchParams, { next: { revalidate: 10 } }),
    getRequest(`v1/fts/${id}/txns/count`),
    getRequest(`v1/fts/${id}`),
    getRequest(`v1/sync/status`),
    getRequest(`v1/fts/${id}/holders/count`),
    getRequest(`v1/account/${id}`),
    getRequest(`v1/account/${id}/contract/deployments`),
  ]);
  const holder = dataResult?.holders || [];
  const holders = holdersDetails?.holders?.[0]?.count;
  const txns = dataResult?.txns || [];
  const txnCursor = dataResult?.cursor;
  const transfers = transferResult?.txns?.[0]?.count;
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

  if (dataResult.message === 'Error') {
    throw new Error(`Server Error : ${dataResult.error}`);
  }

  return (
    <div className="block lg:flex lg:space-x-2 mb-10">
      <div className="w-full ">
        <div className="flex flex-wrap ">
          {tabs?.map(({ label, name }) => {
            return (
              <Link
                className={getClassName(name === tab)}
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
          {tab === 'transfers' ? (
            <Transfers
              count={transfers}
              cursor={txnCursor}
              error={!txns}
              tab={tab}
              txns={txns}
            />
          ) : null}
          {tab === 'holders' ? (
            <Holders
              count={holders}
              error={!txns}
              holder={holder}
              status={status}
              tab={tab}
              token={token}
            />
          ) : null}
          {tab === 'info' ? (
            <Info error={!txns} tab={tab} token={token} />
          ) : null}
          {tab === 'faq' ? (
            <FAQ
              account={account}
              contract={contract}
              holdersCount={holders}
              holdersData={holder}
              id={id}
              tab={tab}
              token={token}
              transfers={transfers}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
