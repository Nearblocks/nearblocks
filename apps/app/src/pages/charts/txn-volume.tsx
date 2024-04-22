import Head from 'next/head';
import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Detail from '@/components/skeleton/charts/Detail';
import Notice from '@/components/common/Notice';
import { env } from 'next-runtime-env';
import { useTheme } from 'next-themes';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const TxnVolumeChart = () => {
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

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('charts:txnVolume.heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>{t('charts:txnVolume.metaTitle')}</title>
        <meta name="title" content={t('charts:txnVolume.metaTitle')} />
        <meta
          name="description"
          content={t('charts:txnVolume.metaDescription')}
        />
        <meta property="og:title" content={t('charts:txnVolume.metaTitle')} />
        <meta
          property="og:description"
          content={t('charts:txnVolume.metaDescription')}
        />
        <meta
          property="twitter:title"
          content={t('charts:txnVolume.metaTitle')}
        />
        <meta
          property="twitter:description"
          content={t('charts:txnVolume.metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/charts/txn-volume`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
              {t('charts:txnVolume.heading')}
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
                    chartTypes={'txn-volume'}
                    ref={heightRef}
                  />
                }
                defaultSkelton={<Detail chartTypes={'txn-volume'} />}
                onChangeHeight={onChangeHeight}
                props={{
                  chartTypes: 'txn-volume',
                  poweredBy: false,
                  network: networkId,
                  t: t,
                  theme: theme,
                }}
                loading={
                  <Detail
                    className="absolute"
                    chartTypes={'tn-volume'}
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

TxnVolumeChart.getLayout = (page: ReactElement) => (
  <Layout notice={<Notice />}>{page}</Layout>
);

export default TxnVolumeChart;
