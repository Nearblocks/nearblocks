'use client';
import classNames from 'classnames';

import { Link } from '@/i18n/routing';

import Execution from './Execution';
import OverviewSkeleton from './Overview';
import ReceiptSkeleton from './Receipt';
import Summary from './Summary';
import Tree from './Tree';
import FaCheckCircle from '../../Icons/FaCheckCircle';
import { useConfig } from '@/hooks/app/useConfig';
import ActionMenuPopover from '../../common/ActionMenuPopover';

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
  const { networkId } = useConfig();
  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium inline-block whitespace-nowrap cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );
  return (
    <>
      <div className="container-xxl mx-auto px-5 -z">
        <>
          <div className="md:flex justify-between">
            <div className="w-full overflow-x-auto">
              <div className="flex  min-w-full min-h-fit pt-3">
                {tabs?.map(({ label, name }) => {
                  return (
                    <Link
                      className={`${getClassName(name === tab)} `}
                      href={
                        name === 'overview'
                          ? `/txns/${hash}`
                          : `/txns/${hash}?tab=${name}`
                      }
                      key={name}
                      prefetch={true}
                    >
                      <h2 className="!relative font-semibold">
                        {label}
                        {name === 'enhanced' && (
                          <div className="!absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md -mt-3 px-1">
                            NEW
                          </div>
                        )}
                      </h2>
                    </Link>
                  );
                })}
                <div className="flex h-full w-full justify-end">
                  <ActionMenuPopover positionClass="right-0">
                    <ul>
                      <li className=" hover:bg-gray-100 dark:hover:bg-black-200 rounded-md whitespace-nowrap text-nearblue-600 dark:text-neargray-10 dark:hover:text-green-250 p-1 pl-2">
                        <span className="hover:text-green-400 dark:hover:text-green-250 flex items-center text-xs">
                          <a
                            className={`inline-flex items-center whitespace-nowrap hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250`}
                            href={`https://lite.nearblocks.io/txns/${hash}?network=${networkId}`}
                            target="_blank"
                          >
                            Validate Transaction
                            <span className="w-4 ml-3 dark:text-green-250 inline-flex">
                              <FaCheckCircle />
                            </span>
                          </a>
                        </span>
                      </li>
                    </ul>
                  </ActionMenuPopover>
                </div>
              </div>
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
