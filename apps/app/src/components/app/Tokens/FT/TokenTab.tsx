import classNames from 'classnames';
import { getRequest } from '@/utils/app/api';
import { Link } from '@/i18n/routing';
import Transfers from './Transfers';
import { Token } from '@/utils/types';
import Holders from './Holders';
import Info from './Info';
import FAQ from './FAQ';

type TabType = 'transfers' | 'holders' | 'info' | 'faq' | 'comments';

export default async function TokenTabs({
  id,
  searchParams,
}: {
  id: string;
  searchParams: any;
}) {
  const tab = searchParams?.tab || 'transfers';

  const tabApiUrls: Record<TabType, { api: string; count?: string }> = {
    transfers: { api: `fts/${id}/txns`, count: `fts/${id}/txns/count` },
    holders: { api: `fts/${id}/holders`, count: `fts/${id}/holders/count` },
    info: { api: `fts/${id}` },
    faq: { api: `fts/${id}` },
    comments: { api: '' },
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
    getRequest(fetchUrl, searchParams),
    getRequest(`fts/${id}/txns/count`),
    getRequest(`fts/${id}`),
    getRequest(`sync/status`),
    getRequest(`fts/${id}/holders/count`),
    getRequest(`account/${id}`),
    getRequest(`account/${id}/contract/deployments`),
  ]);
  const holder = dataResult?.holders || [];
  const holders = holdersDetails?.holders?.[0]?.count;
  const txns = dataResult?.txns || [];
  const txnCursor = dataResult?.cursor;
  const transfers = transferResult?.txns?.[0]?.count;
  const token: Token = tokenDetails?.contracts?.[0];
  const status = syncDetails?.status?.aggregates.ft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };
  const account = accountDetails?.account?.[0];
  const contract = contractResult?.deployments?.[0];

  const tabs = [
    { name: 'transfers', message: 'fts.ft.transfers', label: 'Transfers' },
    { name: 'holders', message: 'fts.ft.holders', label: 'Holders' },
    { name: 'info', message: 'fts.ft.info', label: 'Info' },
    { name: 'faq', message: 'fts.ft.faq', label: 'FAQ' },
  ];
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
    <div className="block lg:flex lg:space-x-2 mb-10">
      <div className="w-full ">
        <div className="flex flex-wrap ">
          {tabs?.map(({ name, label }) => {
            return (
              <Link
                key={name}
                href={
                  name === 'transfers'
                    ? `/token/${id}`
                    : `/token/${id}?tab=${name}`
                }
                className={getClassName(name === tab)}
              >
                <h2>{label}</h2>
              </Link>
            );
          })}
        </div>
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
          {tab === 'transfers' ? (
            <Transfers
              txns={txns}
              count={transfers}
              error={!txns}
              cursor={txnCursor}
              tab={tab}
            />
          ) : null}
          {tab === 'holders' ? (
            <Holders
              token={token}
              status={status}
              holder={holder}
              count={holders}
              error={!txns}
              tab={tab}
            />
          ) : null}
          {tab === 'info' ? (
            <Info token={token} error={!txns} tab={tab} />
          ) : null}
          {tab === 'faq' ? (
            <FAQ
              id={id}
              token={token}
              account={account}
              contract={contract}
              transfers={transfers}
              holdersData={holder}
              holdersCount={holders}
              tab={tab}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
