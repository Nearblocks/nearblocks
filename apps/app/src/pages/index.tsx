import Head from 'next/head';
import Layout from '@/components/Layouts';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Latest from '@/components/skeleton/home/Latest';
import Overview from '@/components/skeleton/home/Overview';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl, apiUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { search } from '@/utils/search';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { env } from 'next-runtime-env';
import { useTheme } from 'next-themes';
import Banner from '@/components/Banner';
import SponserdText from '@/components/SponserdText';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');
const networkUrl =
  network === 'mainnet'
    ? 'https://testnet.nearblocks.io'
    : 'https://nearblocks.io';

const HomePage = () => {
  const components = useBosComponents();
  const router = useRouter();
  const overviewRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<HTMLDivElement>(null);
  const [overviewHeight, setOverviewHeight] = useState({});
  const [latestHeight, setLatestHeight] = useState({});
  const { theme } = useTheme();

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

  const SearchToast = () => {
    if (network === 'testnet') {
      return (
        <div>
          No results. Try on{' '}
          <Link href={env('NEXT_PUBLIC_MAINNET_URL') || ''} legacyBehavior>
            <a className="text-green-500">Mainnet</a>
          </Link>
        </div>
      );
    }

    return (
      <div>
        No results. Try on{' '}
        <Link href={env('NEXT_PUBLIC_TESTNET_URL') || ''} legacyBehavior>
          <a className="text-green-500">Testnet</a>
        </Link>
      </div>
    );
  };

  const { query }: any = router.query;
  const q = query?.replace(/[\s,]/g, '');

  useEffect(() => {
    const redirect = (route: any) => {
      switch (route?.type) {
        case 'block':
          return router.push(`/blocks/${route?.path}`);
        case 'txn':
        case 'receipt':
          return router.push(`/txns/${route?.path}`);
        case 'address':
          return router.push(`/address/${route?.path}`);
        default:
          return toast.error(SearchToast);
      }
    };
    const fetchData = () => {
      if (q) {
        search(q, 'all', true, apiUrl).then((data: any) => {
          redirect(data);
        });
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, apiUrl]);
  const thumbnail = `${ogUrl}/thumbnail/home?brand=near`;
  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('home:metaTitle')}`}
        </title>
        <meta name="title" content={t('home:metaTitle')} />
        <meta name="description" content={t('home:metaDescription')} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:title" content={t('home:metaTitle')} />
        <meta property="og:description" content={t('home:metaDescription')} />
        <meta property="twitter:title" content={t('home:metaTitle')} />
        <meta property="twitter:image" content={thumbnail} />
        <meta
          property="twitter:description"
          content={t('home:metaDescription')}
        />
        <link rel="canonical" href={`${appUrl}/`} />
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          href={
            network === 'testnet'
              ? '/opensearch_testnet.xml'
              : '/opensearch_mainnet.xml'
          }
          title="nearblocks"
        />
      </Head>
      <div>
        <ToastContainer />

        <div className="flex items-center justify-center bg-hero-pattern dark:bg-hero-pattern-dark">
          <div className="container mx-auto px-3 py-12 mb-10">
            <div className="flex flex-col lg:flex-row pb-5 lg:!items-center">
              <div className="relative lg:w-3/5 flex-col">
                <h1 className="text-white dark:text-neargray-10 text-2xl pb-3 flex flex-col">
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
                      networkUrl,
                    }}
                    loading={
                      <div className="absolute  w-full ">
                        <Skeleton className="h-12" />
                      </div>
                    }
                  />
                </div>
                <div className="text-white"></div>
                <div className="text-white pt-3">
                  <SponserdText />
                </div>
              </div>
              <div className="lg:!flex hidden w-2/5 justify-center">
                <Banner type="right" />
              </div>
            </div>
          </div>
        </div>
        <div style={overviewHeight} className="relative -mt-14 ">
          <VmComponent
            src={components?.transactionsOverview}
            skeleton={<Overview className="absolute" ref={overviewRef} />}
            defaultSkelton={<Overview />}
            props={{ t: t, network: networkId, theme: theme }}
            loading={<Overview className="absolute" ref={overviewRef} />}
          />
        </div>
        <div className="py-8">
          <div className="lg:!hidden block container mx-auto px-3">
            <Banner type="center" />
          </div>
        </div>
        <section>
          <div className="container mx-auto px-3  z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-full w-full">
                <div className=" bg-white soft-shadow dark:bg-black-600  rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b p-3 dark:border-black-200 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
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
                <div className=" bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden mb-6 md:mb-10">
                  <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
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
