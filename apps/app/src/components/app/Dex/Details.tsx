'use client';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

import TokenImage from '@/components/common/TokenImage';
import Arrow from '@/components/Icons/Arrow';
import { Link } from '@/i18n/routing';
import {
  dollarNonCentFormat,
  localFormat,
  priceFormat,
} from '@/utils/app/libs';
import { DexInfo, DexTransactionInfo } from '@/utils/types';

import LightweightChart from './LightweightChart';
import TokenTransfers from './TokenTransfers';

interface Props {
  dexInfo: { pairs: DexInfo[] };
  dexTxnsCount: {
    txns: { count: string }[];
  };
  dexTxnsList: {
    cursor: string;
    txns: DexTransactionInfo[];
  };
  error: boolean;
  id: string;
}

const DexDetails = ({
  dexInfo,
  dexTxnsCount,
  dexTxnsList,
  error,
  id,
}: Props) => {
  const dex: DexInfo = dexInfo?.pairs?.[0];

  useEffect(() => {
    Cookies?.set('pairs', id);
  }, [id]);

  return (
    <div className="container-xxl mx-auto px-5">
      <div className="flex items-center justify-between flex-wrap py-4">
        <div className="flex md:flex-wrap w-full">
          <div className="flex justify-between md:items-center dark:text-neargray-10 border-b w-full pb-4 dark:border-black-200">
            <h1 className="py-2 break-all text-xl text-gray-700 dark:text-neargray-10 leading-8 relative">
              <span className="inline-flex align-middle h-7 w-7">
                <TokenImage
                  alt={dex?.base_meta?.name}
                  className="w-7 h-7"
                  src={dex?.base_meta?.icon}
                />
              </span>
              <div className="inline-flex flex-col align-middle font-semibold ml-2">
                <Link
                  className="flex text-green dark:text-green-250 hover:no-underline text-lg"
                  href={`/token/${dex?.base}`}
                >
                  {dex?.base_meta?.symbol} ({dex?.base_meta?.name})
                  <span>
                    <Arrow className="-rotate-45 -mt-0 h-4 w-4 dark:text-neargray-10" />
                  </span>
                </Link>
                <Link
                  className="text-green dark:text-green-250 hover:no-underline text-sm pt-1"
                  href={`/token/${dex?.quote}`}
                >
                  {dex?.base_meta?.symbol} / ({dex?.quote_meta?.symbol})
                </Link>
              </div>
            </h1>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-12 mb-2 pt-4">
        <div className="md:col-span-4 lg:col-span-4">
          <div className="bg-white dark:bg-black-600 dark:border-black-200 dark:text-neargray-10 border rounded-xl soft-shadow">
            <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
              <div className="flex p-4">
                <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                  <span>
                    <h2 className="text-sm font-bold text-green dark:text-neargray-10">
                      Details
                    </h2>
                  </span>
                </div>
              </div>
              <div className="flex p-4">
                <div className="flex items-center w-full xl:w-1/2 mb-2 xl:mb-0 text-sm">
                  Token Price:
                </div>
                <div className="w-full xl:w-1/2 word-break text-sm">
                  {dex?.price_token === null ? (
                    <span className="text-xs">N/A</span>
                  ) : (
                    `$${priceFormat(dex?.price_token)}`
                  )}
                </div>
              </div>
              <div className="flex p-4">
                <div className="flex items-center w-full xl:w-1/2 mb-2 xl:mb-0 text-sm">
                  Amount :
                </div>
                <div className="w-full xl:w-1/2 word-break text-sm">
                  {dex?.price_usd === null ? (
                    <span className="text-xs">N/A</span>
                  ) : (
                    `$${priceFormat(dex?.price_usd)}`
                  )}
                </div>
              </div>
              <div className="flex p-4">
                <div className="flex items-center w-full xl:w-1/2 mb-2 xl:mb-0 text-sm">
                  Volume :
                </div>
                <div className="w-full xl:w-1/2 word-break text-sm">
                  {dex?.volume === null ||
                  dollarNonCentFormat(dex?.volume) === '0' ? (
                    <span className="text-xs">N/A</span>
                  ) : (
                    `$${dollarNonCentFormat(dex?.volume)}`
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-black-600 dark:border-black-200 dark:text-neargray-10 border rounded-xl soft-shadow mt-4">
            <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
              <div className="flex p-4">
                <div className="flex items-center w-full xl:w-1/2 mb-2 xl:mb-0 text-sm">
                  Total Txns:
                </div>
                <div className="w-full xl:w-1/2 word-break text-sm">
                  {dex?.txns === null ? (
                    <span className="text-xs">N/A</span>
                  ) : (
                    `${localFormat(dex?.txns)}`
                  )}
                </div>
              </div>
              <div className="flex p-4">
                <div className="flex items-center w-full xl:w-1/2 mb-2 xl:mb-0 text-sm">
                  Makers :
                </div>
                <div className="w-full xl:w-1/2 word-break text-sm">
                  {dex?.price_usd === null ? (
                    <span className="text-xs">N/A</span>
                  ) : (
                    `${localFormat(dex?.makers)}`
                  )}
                </div>
              </div>
              <div className="flex p-4 items-center">
                <div className="flex items-center text-sm text-gray-800 dark:text-neargray-10 w-full xl:w-1/2 mb-4 xl:mb-0">
                  Change:
                </div>
                <div className="flex flex-row w-full space-x-6">
                  <div className="text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-neargray-10  dark:hover:bg-gray-500 transition-all duration-300 px-4">
                    5m:{' '}
                    {dex?.change_5m === null ||
                    dollarNonCentFormat(dex?.change_5m) === '0' ? (
                      <span className="text-xs text-gray-500 dark:text-neargray-10">
                        N/A
                      </span>
                    ) : (
                      `${dollarNonCentFormat(dex?.change_5m)}`
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-neargray-10  dark:hover:bg-gray-500 transition-all duration-300 px-4">
                    1h:{' '}
                    {dex?.change_1h === null ||
                    dollarNonCentFormat(dex?.change_1h) === '0' ? (
                      <span className="text-xs text-gray-500 dark:text-neargray-10">
                        N/A
                      </span>
                    ) : (
                      `${dollarNonCentFormat(dex?.change_1h)}`
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-neargray-10  dark:hover:bg-gray-500 transition-all duration-300 px-4">
                    6h:{' '}
                    {dex?.change_6h === null ||
                    dollarNonCentFormat(dex?.change_6h) === '0' ? (
                      <span className="text-xs text-gray-500 dark:text-neargray-10">
                        N/A
                      </span>
                    ) : (
                      `${dollarNonCentFormat(dex?.change_6h)}`
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-neargray-10 dark:hover:bg-gray-500 transition-all duration-300 px-4">
                    1d:{' '}
                    {dex?.change_1d === null ||
                    dollarNonCentFormat(dex?.change_1d) === '0' ? (
                      <span className="text-xs text-gray-500 dark:text-neargray-10">
                        N/A
                      </span>
                    ) : (
                      `${dollarNonCentFormat(dex?.change_1d)}`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-8 lg:col-span-8 md:pl-4 lg:!pl-8">
          <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl soft-shadow p-3">
            <LightweightChart />
          </div>
        </div>
      </div>
      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            <TokenTransfers
              data={dexTxnsList}
              error={error}
              txnsCount={dexTxnsCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DexDetails;
