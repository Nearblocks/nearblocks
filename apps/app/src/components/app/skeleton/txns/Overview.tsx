import { Tooltip } from '@reach/tooltip';
import { useTranslations } from 'next-intl';
import React from 'react';

import Question from '../../Icons/Question';

const Loader = ({ className, wrapperClassName }: any) => (
  <div
    className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${className} ${wrapperClassName}`}
  ></div>
);

const OverviewSkeleton = () => {
  const t = useTranslations();

  return (
    <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 dark:divide-black-200 divide-y">
      <div className="text-sm text-nearblue-600 dark:text-neargray-10">
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="Transaction Hash"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Txn Hash
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-xl" />
          </div>
        </div>

        <div className="flex flex-wrap items-start p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="Transaction Status"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Status
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-24" />
          </div>
        </div>

        <div className="flex flex-wrap pt-3 pb-3.5 px-4 mt-[0.38rem]">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="Block Height"
            >
              <div>
                <Question className="w-4 h-6 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.block.text.0') : 'Block Height'}
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-14" />
          </div>
        </div>

        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="Transaction Timestamp"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Timestamp
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-sm" />
          </div>
        </div>

        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="Shard Number"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Shard Number
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10">
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="From Address"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            From
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-xl" />
          </div>
        </div>

        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="To Address"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            To
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-xl" />
          </div>
        </div>
      </div>

      {/* Tokens Transferred section skeleton */}
      <div className="flex items-start flex-wrap p-4">
        <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            label="Tokens Transferred"
          >
            <div>
              <Question className="w-4 h-4 fill-current mr-1" />
            </div>
          </Tooltip>
          Tokens Transferred
        </div>
        <div className="w-full md:w-3/4">
          <Loader wrapperClassName="flex w-full max-w-xl" />
        </div>
      </div>

      <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10">
        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="Deposit Value"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Deposit Value
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-xs" />
          </div>
        </div>

        <div className="flex flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              label="Transaction Fee"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Transaction Fee
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-xs" />
          </div>
        </div>
      </div>

      {/* Ⓝ Price section skeleton */}
      <div className="flex flex-wrap p-4">
        <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            label="Ⓝ Price"
          >
            <div>
              <Question className="w-4 h-4 fill-current mr-1" />
            </div>
          </Tooltip>
          Ⓝ Price
        </div>
        <div className="w-full md:w-3/4">
          <Loader wrapperClassName="flex w-32" />
        </div>
      </div>

      {/* Transaction Actions section skeleton */}
      {/* <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10">
        <div className="flex items-start flex-wrap p-4">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
            <Tooltip
              label="Transaction Actions"
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Transaction Actions
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-xl" />
          </div>
        </div>
      </div> */}

      {/* More details section skeleton */}
      {/* <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 divide-y dark:border-black-200 border-b">
        <div>
          <div className="flex flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label="Gas"
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              Gas
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label="Burnt"
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              Burnt
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          </div>
        </div>
      </div> */}

      {/* "Click to see more" button skeleton */}
      {/* <div className="flex flex-wrap p-4">
        <div className="text-green-500 dark:text-green-250 flex items-center cursor-pointer">
          <Loader wrapperClassName="flex w-32 mr-2" />
        </div>
      </div> */}
    </div>
  );
};

export default OverviewSkeleton;
