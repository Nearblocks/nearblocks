'use client';
import classNames from 'classnames';
import { Link } from '@/i18n/routing';
import Tree from './Tree';
import Execution from './Execution';
import Summary from './Summary';
import OverviewSkeleton from './Overview';
import ReceiptSkeleton from './Receipt';

const tabs = [
  { name: 'overview', message: 'txn.tabs.overview', label: 'Overview' },
  {
    name: 'execution',
    message: 'txn.tabs.execution',
    label: 'Execution Plan',
  },
  { name: 'enhanced', message: 'tokenTxns', label: 'Enhanced Plan' },
  { name: 'tree', message: 'nftTokenTxns', label: 'Tree Plan' },
  { name: 'summary', message: 'accessKeys', label: 'Reciept Summary' },
];

function TxnsTabsSkeleton({ tab, hash }: { tab: string; hash: string }) {
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
    <>
      <div className="relative container mx-auto px-3">
        <>
          <div className="md:flex justify-between">
            <div className="w-fit md:flex md:gap-2">
              {tabs?.map(({ name, label }) => {
                return (
                  <Link
                    key={name}
                    href={
                      name === 'overview'
                        ? `/txns/${hash}`
                        : `/txns/${hash}?tab=${name}`
                    }
                    className={getClassName(name === tab)}
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
