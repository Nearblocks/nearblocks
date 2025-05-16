import { useTranslations } from 'next-intl';
import React from 'react';

import Tooltip from '@/components/app/common/Tooltip';
import Question from '@/components/app/Icons/Question';

const ReceiptSkeleton = () => {
  const t = useTranslations();

  const Loader = ({ className, wrapperClassName }: any) => (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${className} ${wrapperClassName}`}
    ></div>
  );

  return (
    <div className="text-sm text-nearblue-600 dark:text-neargray-10 dark:divide-black-200 divide-solid divide-gray-200 divide-y">
      <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
        <div className="border-l-4 border-green-400 dark:border-green-250 ml-8 my-2">
          <div className="flex flex-wrap px-4 py-3.5">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                className={'w-48 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.receipts.receipt.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txnDetails.receipts.receipt.text.0') : 'Receipt'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          </div>
          <div className="flex flex-wrap items-start px-4 py-3">
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
              <Loader wrapperClassName="flex w-16 " />
            </div>
          </div>
          <div className="flex flex-wrap px-4 py-3">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.block.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txnDetails.receipts.block.text.0') : 'Block'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-28" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap px-4 py-3">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.receipts.from.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.receipts.from.text.0') : 'From'}
              </div>
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-72 " />
              </div>
            </div>
            <div className="flex flex-wrap px-4 py-3">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.receipts.to.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.receipts.to.text.0') : 'To'}
              </div>
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-72 " />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap px-4 py-3">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.receipts.burnt.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t
                ? t('txnDetails.receipts.burnt.text.0')
                : 'Burnt Gas & Tokens by Receipt'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-36" />
            </div>
          </div>

          <div className="flex items-start flex-wrap px-4 py-2.5">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 sm:mt-1">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.receipts.actions.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txnDetails.receipts.actions.text.0') : 'Actions'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full my-1 max-w-xs" />
              <Loader wrapperClassName="flex w-full !h-32 mb-1" />
            </div>
          </div>

          <div className="flex items-start flex-wrap px-4 py-3.5">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={'Deposit value attached with the receipt'}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {'value'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-72" />
            </div>
          </div>

          <div className="flex items-start flex-wrap px-4 py-3.5">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.receipts.result.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txnDetails.receipts.result.text.0') : 'Result'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-72" />
            </div>
          </div>
          <div className="flex items-start flex-wrap px-4 py-3.5">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.receipts.logs.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txnDetails.receipts.logs.text.0') : 'Logs'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full !h-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptSkeleton;
