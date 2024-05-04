import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Detail from '@/components/skeleton/charts/Detail';
import Notice from '@/components/common/Notice';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import { env } from 'next-runtime-env';

const TpsChart = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const components = useBosComponents();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});

  const ogUrl = env('NEXT_PUBLIC_OG_URL');

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
    'Near Transactions per Second Chart',
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>Near Transactions per Second Chart</title>
        <meta name="title" content="Near Transactions per Second Chart" />
        <meta
          name="description"
          content="Near Transactions per Second Chart shows the transactions occuring per second on Near blockchain."
        />
        <meta
          property="og:title"
          content="Near Transactions per Second Chart"
        />
        <meta
          property="og:description"
          content="Near Transactions per Second Chart shows the transactions occuring per second on Near blockchain."
        />
        <meta
          property="twitter:title"
          content="Near Transactions per Second Chart"
        />
        <meta
          property="twitter:description"
          content="Near Transactions per Second Chart shows the transactions occuring per second on Near blockchain."
        />
        <meta
          property="twitter:description"
          content="Near Transactions per Second Chart shows the transactions occuring per second on Near blockchain."
        />

        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/charts/tps`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
              Near Transactions per Second Chart
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48">
          <div className="container mx-auto px-3 -mt-36">
            <div style={height} className="relative">
              <VmComponent
                src={components?.tpsChart}
                skeleton={
                  <Detail
                    className="absolute"
                    chartTypes={'near-tps'}
                    ref={heightRef}
                  />
                }
                defaultSkelton={<Detail chartTypes={'near-tps'} />}
                onChangeHeight={onChangeHeight}
                props={{
                  chartTypes: 'near-tps',
                  poweredBy: false,
                  network: networkId,
                  t: t,
                  theme: theme,
                }}
                loading={
                  <Detail
                    className="absolute"
                    chartTypes={'near-tps'}
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

TpsChart.getLayout = (page: ReactElement) => (
  <Layout notice={<Notice />}>{page}</Layout>
);

export default TpsChart;
