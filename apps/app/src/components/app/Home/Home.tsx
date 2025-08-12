import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import Search from '@/components/app/common/Search';
import FaInbox from '@/components/app/Icons/FaInbox';
import HomeLatestTxns from '@/components/app/Home/LatestTxns';
import HomeOverview from '@/components/app/Home/Overview';
import { networkId } from '@/utils/app/config';
import LatestBlocks from '@/components/app/Blocks/Latest';
import { getRequestBeta } from '@/utils/app/api';

export default async function Home({
  locale,
  theme,
}: {
  locale: string;
  theme: string;
}) {
  const t = await getTranslations({ locale });

  const errorBoundaryFallback = (
    <div className="h-96 flex items-center">
      <ErrorMessage
        icons={<FaInbox />}
        message={''}
        mutedText="Please try again later"
        reset
      />
    </div>
  );
  return (
    <div>
      <div className="flex items-center justify-center bg-hero-pattern dark:bg-hero-pattern-dark">
        <div className="container-xxl w-full mx-auto px-5 py-10 mb-10">
          <div className="flex flex-col lg:flex-row sm:pb-5 lg:!items-center">
            <div className="relative lg:w-3/5 flex-col">
              <h1 className="text-white dark:text-neargray-10 text-2xl font-medium pb-3 flex flex-col">
                {t(
                  networkId === 'mainnet'
                    ? 'homePage.heroTitle'
                    : 'homePage.testnetHeroTitle',
                )}
              </h1>
              <div className="h-12" suppressHydrationWarning={true}>
                <Search />
              </div>
              <div className="text-white"></div>
            </div>
          </div>
        </div>
      </div>
      <ErrorBoundary
        fallback={
          <div className="relative -mt-14 ">
            <div className="container-xxl mx-auto px-5">
              <div className="h-45 flex justify-center items-center bg-white soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0 dark:bg-black-600">
                {errorBoundaryFallback}
              </div>
            </div>
          </div>
        }
      >
        <HomeOverview theme={theme} />
      </ErrorBoundary>
      <div className="py-2"></div>
      <section>
        <div className="container-xxl mx-auto px-5 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-full w-full">
              <div className=" bg-white soft-shadow dark:bg-black-600  rounded-xl overflow-hidden md:mb-10">
                <h2 className="border-b p-3 dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                  {t('homePage.latestBlocks')}
                </h2>
                <ErrorBoundary
                  fallback={
                    <div className="container-xxl mx-auto px-5">
                      <div className="flex justify-center items-center px-5 md:py lg:px-0 dark:bg-black-600 bg-white">
                        {errorBoundaryFallback}
                      </div>
                    </div>
                  }
                >
                  <div className="relative ">
                    <LatestBlocks
                      blocksPromise={getRequestBeta('v3/blocks/latest')}
                    />
                  </div>
                </ErrorBoundary>
              </div>
            </div>
            <div className="h-full  w-full">
              <div className=" bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                  {t('homePage.latestTxns')}
                </h2>
                <ErrorBoundary
                  fallback={
                    <div className="container-xxl mx-auto px-5">
                      <div className="flex justify-center items-center px-5 md:py lg:px-0 dark:bg-black-600 bg-white">
                        {errorBoundaryFallback}
                      </div>
                    </div>
                  }
                >
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
