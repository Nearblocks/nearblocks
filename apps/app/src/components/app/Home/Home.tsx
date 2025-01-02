import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from 'react-error-boundary';

import { getRequest } from '@/utils/app/api';

import Banner from '../Banner';
import ErrorMessage from '../common/ErrorMessage';
// import Banner from './Banner';
import Search from '../common/Search';
import FaInbox from '../Icons/FaInbox';
import SponserdText from '../SponserdText';
import HomeLatestBlocks from './LatestBlocks';
import HomeLatestTxns from './LatestTxns';
import HomeOverview from './Overview';

export default async function Home({
  locale,
  theme,
}: {
  locale: string;
  theme: string;
}) {
  const t = await getTranslations({ locale });

  const handleFilterAndKeyword = async (
    keyword: string,
    filter: string,
    returnPath: any,
  ) => {
    'use server';

    if (keyword.includes('.')) {
      keyword = keyword.toLowerCase();
    }

    const res = await getRequest(`search${filter}?keyword=${keyword}`);

    const data = {
      accounts: [],
      blocks: [],
      receipts: [],
      txns: [],
    };

    if (res?.blocks?.length) {
      if (returnPath) {
        return { path: res.blocks[0].block_hash, type: 'block' };
      }
      data.blocks = res.blocks;
    }

    if (res?.txns?.length) {
      if (returnPath) {
        return { path: res.txns[0].transaction_hash, type: 'txn' };
      }
      data.txns = res.txns;
    }

    if (res?.receipts?.length) {
      if (returnPath) {
        return {
          path: res.receipts[0].originated_from_transaction_hash,
          type: 'txn',
        };
      }
      data.receipts = res.receipts;
    }

    if (res?.accounts?.length) {
      if (returnPath) {
        return { path: res.accounts[0].account_id, type: 'address' };
      }
      data.accounts = res.accounts;
    }

    return returnPath ? null : data;
  };

  const errorBoundaryFallback = (
    <ErrorMessage
      icons={<FaInbox />}
      message={''}
      mutedText="Please try again later"
      reset
    />
  );
  return (
    <div>
      <div className="flex items-center justify-center bg-hero-pattern dark:bg-hero-pattern-dark">
        <div className="container-xxl w-full mx-auto px-5 py-14 mb-10">
          <div className="flex flex-col lg:flex-row pb-5 lg:!items-center">
            <div className="relative lg:w-3/5 flex-col">
              <h1 className="text-white dark:text-neargray-10 text-2xl font-medium pb-3 flex flex-col">
                {t('homePage.heroTitle')}
              </h1>
              <div className="h-12" suppressHydrationWarning={true}>
                <Search handleFilterAndKeyword={handleFilterAndKeyword} />
              </div>
              <div className="text-white"></div>
              <div className="text-white pt-3 min-h-[80px] md:min-h-[35px]">
                <SponserdText />
              </div>
            </div>
            <div className="lg:!flex hidden w-2/5 justify-center">
              <Banner type="right" />
            </div>
          </div>
        </div>
      </div>
      <ErrorBoundary
        fallback={
          <div className="relative -mt-14 ">
            <div className="container-xxl mx-auto px-5">
              <div className="h-56 flex justify-center items-center bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0 dark:bg-black-600">
                {errorBoundaryFallback}
              </div>
            </div>
          </div>
        }
      >
        <HomeOverview theme={theme} />
      </ErrorBoundary>
      <div className="py-8">
        <div className="lg:!hidden block container mx-auto px-3">
          <Banner type="center" />
        </div>
      </div>
      <section>
        <div className="container-xxl mx-auto px-5 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-full w-full">
              <div className=" bg-white soft-shadow dark:bg-black-600  rounded-xl overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-bold">
                  {t('homePage.latestBlocks')}
                </h2>
                <ErrorBoundary fallback={errorBoundaryFallback}>
                  <HomeLatestBlocks />
                </ErrorBoundary>
              </div>
            </div>
            <div className="h-full  w-full">
              <div className=" bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-extrabold">
                  {t('homePage.latestTxns')}
                </h2>
                <ErrorBoundary fallback={errorBoundaryFallback}>
                  <HomeLatestTxns />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
