import Head from 'next/head';
import { useTheme } from 'next-themes';

import Layout from '@/components/Layouts';
import Detail from '@/components/skeleton/charts/Detail';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Notice from '@/components/common/Notice';
import { env } from 'next-runtime-env';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const AddressesChart = () => {
  const { t } = useTranslation();
  const components = useBosComponents();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const { theme } = useTheme();
  const updateOuterDivHeight = () => {
    if (heightRef.current) {
      const Height = heightRef.current.offsetHeight;
      setHeight({ height: Height });
    } else {
      setHeight({});
    }
  };
  useEffect(() => {
    updateOuterDivHeight();
    window.addEventListener('resize', updateOuterDivHeight);

    return () => {
      window.removeEventListener('resize', updateOuterDivHeight);
    };
  }, []);

  const onChangeHeight = () => {
    setHeight({});
  };

  return (
    <>
      <Head>
        <title>{t('charts:addresses.metaTitle')}</title>
        <meta name="title" content={t('charts:addresses.metaTitle')} />
        <meta
          name="description"
          content={t('charts:addresses.metaDescription')}
        />
        <meta property="og:title" content={t('charts:addresses.metaTitle')} />
        <meta
          property="og:description"
          content={t('charts:addresses.metaDescription')}
        />
        <meta
          property="twitter:title"
          content={t('charts:addresses.metaTitle')}
        />
        <meta
          property="twitter:description"
          content={t('charts:addresses.metaDescription')}
        />
        <meta
          property="og:image"
          content={`${ogUrl}/thumbnail/chart?title=${t(
            'charts:addresses.heading',
          )}`}
        />
        <meta
          property="og:image:secure_url"
          content={`${ogUrl}/thumbnail/chart?title=${t(
            'charts:addresses.heading',
          )}`}
        />
        <meta
          name="twitter:image:src"
          content={`${ogUrl}/thumbnail/chart?title=${t(
            'charts:addresses.heading',
          )}`}
        />
        <link rel="canonical" href={`${appUrl}/charts/addresses`} />
      </Head>
      <section>
        <div className="bg-hero-pattern h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
              {t('charts:addresses.heading')}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48">
          <div className="container mx-auto px-3 -mt-36">
            <div style={height} className="relative">
              <VmComponent
                src={components?.charts}
                skeleton={
                  <Detail
                    className="absolute"
                    chartTypes={'addresses'}
                    ref={heightRef}
                  />
                }
                defaultSkelton={<Detail chartTypes={'addresses'} />}
                onChangeHeight={onChangeHeight}
                props={{
                  chartTypes: 'addresses',
                  poweredBy: false,
                  network: networkId,
                  t: t,
                  theme: theme,
                }}
                loading={
                  <Detail
                    className="absolute"
                    chartTypes={'addresses'}
                    ref={heightRef}
                  />
                }
              />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};

AddressesChart.getLayout = (page: ReactElement) => (
  <Layout notice={<Notice />}>{page}</Layout>
);

export default AddressesChart;
