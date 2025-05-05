'use client';
import { useConfig } from '@/hooks/app/useConfig';

import Skeleton from '../common/Skeleton';
import { useTranslations } from 'next-intl';

export default function HashLoading() {
  const { networkId } = useConfig();
  const t = useTranslations();

  return (
    <>
      <div className="md:flex items-center justify-between">
        <div className="w-40 max-w-xs pr-2 py-6">
          <Skeleton className="h-5" />
        </div>
      </div>
      <div className="bg-white text-sm text-nearblue-600 dark:text-neargray-10 dark:bg-black-600 dark:divide-black-200 divide-solid divide-gray-200 divide-y soft-shadow rounded-xl">
        {networkId === 'testnet' && (
          <div className="flex flex-wrap p-4 text-red-500">
            {t('testnetBlockNotice') || '[ This is a Testnet block only ]'}
          </div>
        )}
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.height') || 'Block Height'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-20 h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.hash') || 'Hash'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-sm h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.timestamp') || 'Timestamp'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-sm h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t ? t('block.transactions.0') : 'Transactions'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.author') || 'Author'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.gasUsed') || 'GAS Used'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.gasLimit') || 'Gas Limit'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.gasPrice') || 'GAS Price'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.gasFee') || 'Gas Fee'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs h-4" />
          </div>
        </div>
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {t('block.parenthash') || 'Parent Hash'}
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-sm h-4" />
          </div>
        </div>
        {networkId === 'mainnet' && (
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              {t('block.price') || 'Price'}
            </div>
            <div className="w-full md:w-3/4">
              <Skeleton className="flex w-full max-w-xs h-4" />
            </div>
          </div>
        )}
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">Shard Number</div>
          <div className="w-full md:w-3/4">
            <Skeleton className="flex w-full max-w-xs h-4" />
          </div>
        </div>
      </div>
    </>
  );
}
