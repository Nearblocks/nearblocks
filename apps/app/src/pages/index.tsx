import Head from 'next/head';
import Layout from '@/components/Layouts';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Latest from '@/components/skeleton/home/Latest';
import Overview from '@/components/skeleton/home/Overview';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

const HomePage = () => {
  const components = useBosComponents();
  const router = useRouter();
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
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('home:metaTitle')}`}
        </title>
        <meta name="title" content={t('home:metaTitle')} />
        <meta name="description" content={t('home:metaDescription')} />
        <meta property="og:image" content="/thumbnail/thumbnail_homepage.png" />
        <meta property="og:title" content={t('home:metaTitle')} />
        <meta property="og:description" content={t('home:metaDescription')} />
        <meta property="twitter:title" content={t('home:metaTitle')} />
        <meta
          property="twitter:image"
          content="/thumbnail/thumbnail_homepage.png"
        />
        <meta
          property="twitter:description"
          content={t('home:metaDescription')}
        />
      </Head>
      <div>
        <div className="flex items-center justify-center bg-hero-pattern">
          <div className="container mx-auto px-3 pt-14 pb-8 mb-10 ">
            <div className="flex flex-col lg:flex-row pb-5">
              <div className="relative lg:w-3/5  flex-col">
                <h1 className="text-white text-2xl pb-3 flex flex-col">
                  {t('home:heroTitle')}
                </h1>
                <div className="h-12">
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
                      router,
                    }}
                    loading={
                      <div className="absolute  w-full ">
                        <Skeleton className="h-12" />
                      </div>
                    }
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
            skeleton={<Overview className="absolute" ref={overviewRef} />}
            defaultSkelton={<Overview />}
            props={{ t: t, network: networkId }}
            loading={<Overview className="absolute" ref={overviewRef} />}
          />
        </div>

        <div className="py-8 relative"></div>
        <section>
          <div className="container mx-auto px-3  z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-full w-full">
                <div className=" bg-white soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                    {t('home:latestBlocks')}
                  </h2>

                  <div style={latestHeight} className="relative">
                    <VmComponent
                      src={components?.blocksLatest}
                      skeleton={<Latest className="absolute" ref={latestRef} />}
                      defaultSkelton={<Latest />}
                      props={{ t: t, network: networkId }}
                      loading={<Latest className="absolute" ref={latestRef} />}
                    />
                  </div>
                </div>
              </div>
              <div className="h-full  w-full">
                <div className=" bg-white soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                    {t('home:latestTxns')}
                  </h2>
                  <div style={latestHeight} className="relative">
                    <VmComponent
                      skeleton={<Latest className="absolute" ref={latestRef} />}
                      defaultSkelton={<Latest />}
                      src={components?.transactionsLatest}
                      props={{ t: t, network: networkId }}
                      loading={<Latest className="absolute" ref={latestRef} />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

HomePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default HomePage;
