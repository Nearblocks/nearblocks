import { useTranslations } from 'next-intl';
import React from 'react';

import Tooltip from '../../common/Tooltip';
import Question from '../../Icons/Question';
import { useConfig } from '@/hooks/app/useConfig';

const Loader = ({ className, wrapperClassName }: any) => (
  <div
    className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${className} ${wrapperClassName}`}
  ></div>
);

const OverviewSkeleton = () => {
  const t = useTranslations();
  const { networkId } = useConfig();

  return (
    <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 dark:divide-black-200 divide-y">
      <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
        {networkId === 'testnet' && (
          <div className="flex flex-wrap px-4 py-3.5 text-red-500">
            {t ? t('testnetNotice') : '[ This is a Testnet transaction only ]'}
          </div>
        )}
        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.hash.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.hash.text.0') : 'Txn Hash'}
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-xl" />
          </div>
        </div>

        <div className="flex flex-wrap items-start px-4 py-[0.77rem]">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.status.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.status.text.0') : 'Status'}
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-24" />
          </div>
        </div>

        <div className="flex flex-wrap px-4 py-[0.77rem]">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.block.tooltip')}
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

        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.timestamp.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.timestamp.text.0') : 'Timestamp'}
          </div>
          <div className="w-full md:w-3/4">
            <Loader wrapperClassName="flex w-full max-w-sm" />
          </div>
        </div>

        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={
                'The shard number in which the transaction was executed in'
              }
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
        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.from.tooltip')}
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

        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.to.tooltip')}
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
      <div className="flex items-start flex-wrap px-4 py-3.5">
        <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
          <Tooltip
            className={'w-96 left-25 max-w-[200px]'}
            tooltip={'List of tokens transferred in the transaction'}
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

      <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 py-1">
        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.deposit.tooltip')}
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

        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.fee.tooltip')}
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
      <div className="flex flex-wrap px-4 py-3.5">
        <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
          <Tooltip
            className={'w-96 left-25 max-w-[200px]'}
            tooltip={t('txnDetails.price.tooltip')}
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
              className={"w-96 left-25 max-w-[200px]"}
              tooltip={'Highlighted events of the transaction'}
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
                className={"w-96 left-25 max-w-[200px]"}
                tooltip={t('txnDetails.gas.tooltip')}
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
                className={"w-96 left-25 max-w-[200px]"}
                tooltip={t('txnDetails.burnt.tooltip')}
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
