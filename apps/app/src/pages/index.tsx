import Skeleton from '@/components/skeleton/common/Skeleton';
import Latest from '@/components/skeleton/home/Latest';
import Overview from '@/components/skeleton/home/Overview';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import React, { useEffect, useRef, useState } from 'react';

const HomePage = () => {
  const components = useBosComponents();
  const overviewRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);
  const [overviewHeight, setOverviewHeight] = useState({});
  const [latestHeight, setLatestHeight] = useState({});

  useEffect(() => {
    const updateOuterDivHeight = () => {
      if (overviewRef.current && latestRef.current) {
        const overviewHeight = overviewRef.current.offsetHeight;
        const latestHeight = latestRef.current.offsetHeight;
        setOverviewHeight({ height: overviewHeight });
        setLatestHeight({ height: latestHeight });
      } else {
        setOverviewHeight({});
        setLatestHeight({});
      }
    };

    updateOuterDivHeight();
    window.addEventListener('resize', updateOuterDivHeight);

    return () => {
      window.removeEventListener('resize', updateOuterDivHeight);
    };
  }, []);

  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center justify-center bg-hero-pattern">
        <div className="container mx-auto px-3 pt-14 pb-8 mb-10 ">
          <div className="flex flex-col lg:flex-row pb-5">
            <div className="relative lg:w-3/5  flex-col">
              <h1 className="text-white text-2xl pb-3 flex flex-col">
                {t('home:heroTitle')}
              </h1>
              <div className=" h-12">
                <VmComponent
                  src={components?.search}
                  skeleton={
                    <div className="absolute  w-full ">
                      <Skeleton className="h-12" />
                    </div>
                  }
                  props={{
                    isHeader: false,
                    t: t,
                    network: networkId,
                  }}
                />
              </div>
              <div className="text-white"></div>
            </div>
          </div>
        </div>
      </div>

      <div style={overviewHeight} className=" relative -mt-14 ">
        <VmComponent
          src={components?.transactionsOverview}
          skeleton={<Overview ref={overviewRef} />}
          props={{ t: t, network: networkId }}
        />
      </div>

      <div className="py-8 relative"></div>
      <section>
        <div className="container mx-auto px-3  z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-full relative w-full">
              <div className=" bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  {t('home:latestBlocks')}
                </h2>

                <div style={latestHeight}>
                  <VmComponent
                    src={components?.blocksLatest}
                    skeleton={<Latest ref={latestRef} />}
                    props={{ t: t, network: networkId }}
                  />
                </div>
              </div>
            </div>
            <div className="h-full relative w-full">
              <div className=" bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  {t('home:latestTxns')}
                </h2>
                <div style={latestHeight}>
                  <VmComponent
                    skeleton={<Latest ref={latestRef} />}
                    src={components?.transactionsLatest}
                    props={{ t: t, network: networkId }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
