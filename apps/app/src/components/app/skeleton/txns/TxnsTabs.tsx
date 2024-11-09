'use client';
import classNames from 'classnames';

import { Link } from '@/i18n/routing';

import Execution from './Execution';
import OverviewSkeleton from './Overview';
import ReceiptSkeleton from './Receipt';
import Summary from './Summary';
import Tree from './Tree';

const tabs = [
  { label: 'Overview', message: 'txn.tabs.overview', name: 'overview' },
  {
    label: 'Execution Plan',
    message: 'txn.tabs.execution',
    name: 'execution',
  },
  { label: 'Enhanced Plan', message: 'tokenTxns', name: 'enhanced' },
  { label: 'Tree Plan', message: 'nftTokenTxns', name: 'tree' },
  { label: 'Reciept Summary', message: 'accessKeys', name: 'summary' },
];

function TxnsTabsSkeleton({ hash, tab }: { hash: string; tab: string }) {
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
    <>
      <div className="relative container mx-auto px-3">
        <>
          <div className="md:flex justify-between">
            <div className="w-fit md:flex md:gap-2">
              {tabs?.map(({ label, name }) => {
                return (
                  <Link
                    className={getClassName(name === tab)}
                    href={
                      name === 'overview'
                        ? `/txns/${hash}`
                        : `/txns/${hash}?tab=${name}`
                    }
                    key={name}
                  >
                    <h2>
                      {label}
                      {name === 'enhanced' && (
                        <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md  -mt-3 px-1">
                          NEW
                        </div>
                      )}
                    </h2>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
            {tab === 'overview' ? <OverviewSkeleton /> : null}

            {tab === 'execution' ? <ReceiptSkeleton /> : null}

            {tab === 'enhanced' ? <Execution /> : null}
            {tab === 'tree' ? <Tree /> : null}
            {tab === 'summary' ? <Summary /> : null}
          </div>
        </>
      </div>
      <div className="py-8"></div>
    </>
  );
}

export default TxnsTabsSkeleton;
