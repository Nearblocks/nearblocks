import Layout from '@/components/Layouts';
import Detail from '@/components/skeleton/charts/Detail';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import { useTheme } from 'next-themes';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { env } from 'next-runtime-env';
import Head from 'next/head';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const NewContractsChart = () => {
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
    t('Near New Contracts Chart'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {t(
            'Near New Contracts Chart : Info, Statistics, Growth | NearBlocks',
          )}
        </title>
        <meta
          name="title"
          content={t('Near New Contracts Chart | NearBlocks')}
        />
        <meta
          name="description"
          content={t(
            'Near blockchain New Contracts Chart shows the daily number of new contracts on the Near blockchain',
          )}
        />
        <meta
          property="og:title"
          content={t('Near New Contracts Chart | NearBlocks')}
        />
        <meta
          property="og:description"
          content={t(
            'Near blockchain New Contracts Chart shows the daily number of new contracts on the Near blockchain',
          )}
        />
        <meta
          property="twitter:title"
          content={t('Near New Contracts Chart | NearBlocks')}
        />
        <meta
          property="twitter:description"
          content={t(
            'Near blockchain New Contracts Chart shows the daily number of new contracts on the Near blockchain',
          )}
        />
        <meta property="twitter:image" content={thumbnail} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/charts/new-contracts`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white">
              {t('Near New Contracts Chart')}
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
                    chartTypes={'new-contracts'}
                    ref={heightRef}
                  />
                }
                defaultSkelton={<Detail chartTypes={'new-contracts'} />}
                onChangeHeight={onChangeHeight}
                props={{
                  chartTypes: 'new-contracts',
                  poweredBy: false,
                  network: networkId,
                  t: t,
                  theme: theme,
                }}
                loading={
                  <Detail
                    className="absolute"
                    chartTypes={'new-contracts'}
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

NewContractsChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NewContractsChart;
