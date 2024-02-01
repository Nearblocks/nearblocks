import { networkId } from '@/utils/config';
import Skeleton from '../common/Skeleton';
import React, { Ref, forwardRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
interface Props {
  className?: string;
}
const Overview = forwardRef(
  ({ className }: Props, ref: Ref<HTMLDivElement>) => {
    const { t } = useTranslation('home');

    return (
      <div ref={ref} className={`w-full z-10 ${className}`}>
        <div className="container mx-auto px-3">
          <div className="bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0">
            <div
              className={`grid grid-flow-col grid-cols-1 ${
                networkId === 'mainnet'
                  ? 'grid-rows-3 lg:grid-cols-3'
                  : 'grid-rows-2 lg:grid-cols-2'
              } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x lg:py-3`}
            >
              {networkId === 'mainnet' && (
                <>
                  <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
                    <div className="flex flex-row py-5 lg:pb-5 lg:px-0">
                      <div className="items-center flex justify-left mr-3 ">
                        <Image
                          src="https://nearblocks.io/images/near price.svg"
                          alt={t('nearPrice')}
                          width="24"
                          height="24"
                        />
                      </div>
                      <div className="ml-2">
                        <p className="uppercase font-semibold text-nearblue-600 text-sm ">
                          {t('nearPrice')}
                        </p>
                        <div className="py-1">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row py-5 lg:pt-5 lg:px-0">
                      <div className="items-center flex justify-left mr-3 ">
                        <Image
                          src="https://nearblocks.io/images/market.svg"
                          alt={t('marketCap')}
                          width="24"
                          height="24"
                        />
                      </div>
                      <div className="ml-2">
                        <p className="uppercase font-semibold text-nearblue-600 text-sm">
                          {t('marketCap')}{' '}
                        </p>
                        <div className="py-1 ">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
                <div className="flex flex-row justify-between py-5 lg:pb-5 lg:px-0">
                  <div className="flex flex-row ">
                    <div className="items-center flex justify-left mr-3 ">
                      <Image
                        src="https://nearblocks.io/images/transactions.svg"
                        alt={t('transactions')}
                        width="24"
                        height="24"
                      />
                    </div>
                    <div className="ml-2">
                      <p className="uppercase font-semibold text-nearblue-600 text-sm">
                        {t('transactions')}
                      </p>
                      <div className="py-1">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <p className="uppercase font-semibold text-nearblue-600 text-sm">
                      {' '}
                      {t('gasPrice')}
                    </p>

                    <div className="py-1">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
                <div className="pt-1 flex flex-row justify-between align-center py-5 lg:pt-5 lg:px-0">
                  <div className="flex flex-row ">
                    <div className="items-center flex justify-left mr-3 ">
                      <Image
                        src="https://nearblocks.io/images/pickaxe.svg"
                        alt={t('activeValidator')}
                        width="24"
                        height="24"
                      />
                    </div>
                    <div className="ml-2">
                      <p className="uppercase font-semibold text-nearblue-600 text-sm">
                        {t('activeValidator')}
                      </p>
                      <div className="py-1">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <p className="uppercase font-semibold text-nearblue-600 text-sm">
                      {t('avgBlockTime')}
                    </p>
                    <div className="py-1">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:px-5">
                <div className="flex-1 py-5 lg:px-0">
                  <p className="uppercase font-semibold text-nearblue-600 text-sm">
                    {' '}
                    {t('transactionHistory', { days: 14 })}
                  </p>
                  <div className="mt-1">
                    <Skeleton className="h-28 " />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
Overview.displayName = 'Overview';
export default Overview;
