import classNames from 'classnames';
import { getRequest } from '@/utils/app/api';
import { Link } from '@/i18n/routing';
import { Token } from '@/utils/types';

import NFTTransfers from './NFTTransfers';
import NFTInventory from './NFTInventory';
import NFTHolders from './NFTHolders';

type TabType = 'transfers' | 'holders' | 'inventory';

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
    transfers: { api: `nfts/${id}/txns`, count: `nfts/${id}/txns/count` },
    holders: { api: `nfts/${id}/holders`, count: `nfts/${id}/holders/count` },
    inventory: {
      api: `nfts/${id}/tokens`,
      count: `nfts/${id}/tokens/count`,
      queryModifier: () => {
        searchParams.per_page = '24';
      },
    },
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
    { name: 'transfers', message: 'fts.ft.transfers', label: 'Transfers' },
    { name: 'holders', message: 'fts.ft.holders', label: 'Holders' },
    { name: 'inventory', message: 'fts.ft.info', label: 'Inventory' },
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
                    ? `/nft-token/${id}`
                    : `/nft-token/${id}?tab=${name}`
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
            <NFTTransfers
              txns={txns}
              count={transferCount}
              error={!txns}
              cursor={txnCursor}
              tab={tab}
            />
          ) : null}
          {tab === 'holders' ? (
            <NFTHolders
              tokens={token}
              status={status}
              holder={holder}
              count={holders}
              error={!txns}
              tab={tab}
            />
          ) : null}
          {tab === 'inventory' ? (
            <NFTInventory
              token={token}
              tokens={tokens}
              count={inventoryCount}
              error={!txns}
              tab={tab}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
