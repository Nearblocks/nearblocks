import classNames from 'classnames';

import { Link } from '@/i18n/routing';
import { getRequest } from '@/utils/app/api';
import { Token } from '@/utils/types';

import NFTHolders from './NFTHolders';
import NFTInventory from './NFTInventory';
import NFTTransfers from './NFTTransfers';

type TabType = 'holders' | 'inventory' | 'transfers';

export default async function NFTTokenTab({
  id,
  searchParams,
}: {
  id: string;
  searchParams: any;
}) {
  const tab = searchParams?.tab || 'transfers';

  const tabApiUrls: Record<
    TabType,
    { api: string; count?: any; queryModifier?: () => void }
  > = {
    holders: { api: `nfts/${id}/holders`, count: `nfts/${id}/holders/count` },
    inventory: {
      api: `nfts/${id}/tokens`,
      count: `nfts/${id}/tokens/count`,
      queryModifier: () => {
        searchParams.per_page = '24';
      },
    },
    transfers: { api: `nfts/${id}/txns`, count: `nfts/${id}/txns/count` },
  };

  const tabApi = tabApiUrls[tab as TabType];
  tabApi?.queryModifier?.();

  const fetchUrl = `${tabApi?.api}`;
  const countUrl = tabApi?.count ? `${tabApi?.count}` : '';
  const [dataResult, dataCount, tokenDetails, syncDetails, holdersDetails] =
    await Promise.all([
      getRequest(fetchUrl, searchParams),
      getRequest(countUrl),
      getRequest(`nfts/${id}`),
      getRequest(`sync/status`),
      getRequest(`nfts/${id}/holders/count`),
    ]);
  const holder = dataResult?.holders || [];
  const holders = holdersDetails?.holders?.[0]?.count;
  const txns = dataResult?.txns || [];
  const txnCursor = dataResult?.cursor;
  const transferCount = dataCount?.txns?.[0]?.count;
  const token: Token = tokenDetails?.contracts?.[0];
  const status = syncDetails?.status?.aggregates.ft_holders || {
    height: '0',
    sync: true,
    timestamp: '',
  };
  const tokens = dataResult?.tokens || [];
  const inventoryCount = dataCount?.tokens?.[0]?.count;

  const tabs = [
    { label: 'Transfers', message: 'fts.ft.transfers', name: 'transfers' },
    { label: 'Holders', message: 'fts.ft.holders', name: 'holders' },
    { label: 'Inventory', message: 'fts.ft.info', name: 'inventory' },
  ];
  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );
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
                    ? `/nft-token/${id}`
                    : `/nft-token/${id}?tab=${name}`
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
            <NFTTransfers
              count={transferCount}
              cursor={txnCursor}
              error={!txns}
              tab={tab}
              txns={txns}
            />
          ) : null}
          {tab === 'holders' ? (
            <NFTHolders
              count={holders}
              error={!txns}
              holder={holder}
              status={status}
              tab={tab}
              tokens={token}
            />
          ) : null}
          {tab === 'inventory' ? (
            <NFTInventory
              count={inventoryCount}
              error={!txns}
              tab={tab}
              token={token}
              tokens={tokens}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
