import 'react-perfect-scrollbar/dist/css/styles.css';
import useTranslation from 'next-translate/useTranslation';
import Skeleton from '../skeleton/common/Skeleton';
import BarChart from '../Icons/BarChart';
import MiniChart from '../Charts/MiniChart';
import Link from 'next/link';

interface StatsProps {
  txnsTotalCount: string;
  txns24HrCount: string;
  networksCount: number;
  dataChart: any;
  error: boolean;
}

const Stats = ({
  txnsTotalCount,
  txns24HrCount,
  networksCount,
  dataChart,
  error,
}: StatsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="w-full lg:col-span-2">
          <Link href="/charts/multi-chain-txns">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden p-5">
              <h2 className="dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold uppercase">
                {t ? t('multi-chain-txns:totalTxns') : 'TOTAL TRANSACTIONS'}
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
                        chartTypes={'multi-chain-txns'}
                        chartsData={dataChart}
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
                {t ? t('multi-chain-txns:volume') : 'VOLUME(24H)'}
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
              {t ? t('multi-chain-txns:networks') : 'NETWORKS'}
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
