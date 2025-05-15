import classNames from 'classnames';
import React from 'react';
import { Link } from '@/i18n/routing';
import InventorySkeleton from '@/components/app/skeleton/nft/NFTInventory';
import TransferSkeleton from '@/components/app/skeleton/nft/NFTTransfers';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import Holders from '@/components/app/skeleton/ft/Holders';

interface Props {
  className?: string;
  error?: boolean;
  id: string;
  tab: string;
}
const NFTTokenTabSkeletion = ({ className, error, id, tab }: Props) => {
  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 dark:hover:bg-black-100 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );

  const tabs = [
    { label: 'Transfers', message: 'fts.ft.transfers', name: 'transfers' },
    { label: 'Holders', message: 'fts.ft.holders', name: 'holders' },
    { label: 'Inventory', message: 'fts.ft.info', name: 'inventory' },
  ];
  return (
    <div className={`w-full z-50 ${className}`}>
      <div className="block lg:flex lg:space-x-2 mb-4">
        <div className="w-full">
          <div className="flex">
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
          <div className="relative">
            <div
              className={`bg-white dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden`}
            >
              {error ? (
                <div className="w-full">
                  <ErrorMessage
                    icons={<FaInbox />}
                    message={''}
                    mutedText="Please try again later"
                    reset
                  />
                </div>
              ) : (
                <>
                  {tab === 'transfers' && <TransferSkeleton />}
                  {tab === 'holders' && <Holders nft />}
                  {tab === 'inventory' && <InventorySkeleton />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </div>
  );
};
NFTTokenTabSkeletion.displayName = 'Overview';
export default NFTTokenTabSkeletion;
