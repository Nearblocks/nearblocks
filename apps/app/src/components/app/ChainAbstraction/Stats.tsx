'use client';
import { useTranslations } from 'next-intl';
import 'react-perfect-scrollbar/dist/css/styles.css';

import { Link } from '@/i18n/routing';

import MiniChart from '../Charts/MiniChart';
import BarChart from '../Icons/BarChart';
import Skeleton from '../skeleton/common/Skeleton';

interface StatsProps {
  dataChart: any;
  error: boolean;
  networksCount: number;
  txns24HrCount: string;
  txnsTotalCount: string;
}

const Stats = ({
  dataChart,
  error,
  networksCount,
  txns24HrCount,
  txnsTotalCount,
}: StatsProps) => {
  const t = useTranslations();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="w-full lg:col-span-2">
          <Link href="/charts/multi-chain-txns">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden p-5">
              <h2 className="dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold uppercase">
                {t ? t('totalTxns') : 'TOTAL TRANSACTIONS'}
              </h2>
              <div className="font-semibold text-xl text-gray-700 dark:text-neargray-10 flex flex-wrap items-center">
                {error ? (
                  <span className="w-full break-words">N/A</span>
                ) : !txnsTotalCount ? (
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="flex w-full items-center  justify-between">
                    <span className="flex-shrink-0">{txnsTotalCount}</span>
                    <div className="flex-grow flex justify-end w-10 h-10 ml-auto text-green-500  dark:text-green-250">
                      <MiniChart
                        chartsData={dataChart}
                        chartTypes={'multi-chain-txns'}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="w-full">
          <Link href="/charts/multi-chain-txns">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden p-5">
              <h2 className="dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold uppercase">
                {t ? t('volume') : 'VOLUME(24H)'}
              </h2>
              <div className="font-semibold text-xl text-gray-700 dark:text-neargray-10 flex flex-wrap items-center">
                {error ? (
                  <span className="w-full break-words">N/A</span>
                ) : !txns24HrCount ? (
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="flex w-full items-center  justify-between ">
                    <span className="flex-shrink-0">{txns24HrCount}</span>
                    <div className="flex-grow flex justify-end w-1/2 ml-auto text-green-500  dark:text-green-250">
                      <BarChart className="w-10 h-10" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="w-full">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl p-5">
            <h2 className="dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold uppercase">
              {t ? t('networks') : 'NETWORKS'}
            </h2>
            <div className="font-semibold text-xl text-gray-700 dark:text-neargray-10 flex flex-wrap items-center">
              {error ? (
                <span className="w-full break-words">N/A</span>
              ) : !networksCount ? (
                <div className="w-full break-words">
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="flex w-full items-center  justify-between">
                  <span className="flex-shrink-0">{networksCount}</span>
                  <div className="flex-grow flex justify-end w-1/2 ml-auto text-green-500  dark:text-green-250">
                    <BarChart className="w-10 h-10" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stats;
