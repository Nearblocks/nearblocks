'use client';

import { useTranslations } from 'next-intl';

import Search from '../../common/Search';
import Latest from './Latest';
import HomeOverview from './Overview';

const HomePageSkeleton = ({
  error,
  theme,
}: {
  error?: boolean;
  theme: string;
}) => {
  const t = useTranslations();

  return (
    <div>
      <div className="flex items-center justify-center bg-hero-pattern dark:bg-hero-pattern-dark">
        <div className="container-xxl w-full mx-auto px-5 py-10 mb-10">
          <div className="flex flex-col lg:flex-row sm:pb-5 lg:!items-center">
            <div className="relative lg:w-3/5 flex-col">
              <h1 className="text-white dark:text-neargray-10 text-2xl font-medium pb-3 flex flex-col">
                {t('homePage.heroTitle')}
              </h1>
              <div className="h-12" suppressHydrationWarning={true}>
                <Search disabled />
              </div>
              <div className="text-white"></div>
              {/*  <div className="text-white pt-3 min-h-[80px] md:min-h-[35px]"></div> */}
            </div>
            {/*   <div className="lg:!flex hidden w-2/5 justify-center"></div> */}
          </div>
        </div>
      </div>
      <div className="relative -mt-14 ">
        <HomeOverview theme={theme} />
      </div>
      <div className="py-2">
        <div className="lg:!hidden block container mx-auto px-3 py-2"></div>
      </div>
      <section>
        <div className="container-xxl mx-auto px-5 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-full w-full">
              <div className=" bg-white soft-shadow dark:bg-black-600  rounded-xl overflow-hidden md:mb-10">
                <h2 className="border-b p-3 dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                  {t('homePage.latestBlocks')}
                </h2>
                <div className="relative">
                  <Latest error={error} />
                </div>
              </div>
            </div>
            <div className="h-full  w-full">
              <div className=" bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                  {t('homePage.latestTxns')}
                </h2>
                <div className="relative">
                  <Latest error={error} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePageSkeleton;
