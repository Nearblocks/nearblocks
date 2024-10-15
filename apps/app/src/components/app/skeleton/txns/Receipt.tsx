import React from 'react';
import { Tooltip } from '@reach/tooltip';
import Question from '../../Icons/Question';
import { useTranslations } from 'next-intl';

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
          <div className="flex flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label={t('txn.receipts.receipt.tooltip')}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txn.receipts.receipt.text.0') : 'Receipt'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-start p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label={t('txn.status.tooltip')}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txn.status.text.0') : 'Status'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full " />
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label={'Block height'}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txn.receipts.block.text.0') : 'Block'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  label={t('txn.receipts.from.tooltip')}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.receipts.from.text.0') : 'From'}
              </div>
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-full " />
              </div>
            </div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  label={t('txn.receipts.to.tooltip')}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.receipts.to.text.0') : 'To'}
              </div>
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-full " />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label={t('txn.receipts.burnt.tooltip')}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t
                ? t('txn.receipts.burnt.text.0')
                : 'Burnt Gas & Tokens by Receipt'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
            </div>
          </div>
          <div className="flex items-start flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label={t('txn.receipts.actions.tooltip')}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txn.receipts.actions.text.0') : 'Actions'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          </div>
          <div className="flex items-start flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label={t('txn.receipts.result.tooltip')}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txn.receipts.result.text.0') : 'Result'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          </div>
          <div className="flex items-start flex-wrap p-4">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
              <Tooltip
                label={t('txn.receipts.logs.tooltip')}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txn.receipts.logs.text.0') : 'Logs'}
            </div>
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
              <Loader wrapperClassName="flex w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptSkeleton;
