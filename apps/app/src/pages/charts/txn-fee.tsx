import Head from 'next/head';
import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Detail from '@/components/skeleton/charts/Detail';
import Notice from '@/components/common/Notice';

const TxnFeeChart = () => {
  const { t } = useTranslation();
  const components = useBosComponents();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
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
        <title>{t('charts:txnFee.metaTitle')}</title>
        <meta name="title" content={t('charts:txnFee.metaTitle')} />
        <meta name="description" content={t('charts:txnFee.metaDescription')} />
        <meta property="og:title" content={t('charts:txnFee.metaTitle')} />
        <meta
          property="og:description"
          content={t('charts:txnFee.metaDescription')}
        />
        <meta property="twitter:title" content={t('charts:txnFee.metaTitle')} />
        <meta
          property="twitter:description"
          content={t('charts:txnFee.metaDescription')}
        />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_OG_URL}/thumbnail/chart?title=${t(
            'charts:txnFee.heading',
          )}
        `}
        />
        <meta
          property="og:image:secure_url"
          content={`${process.env.NEXT_PUBLIC_OG_URL}/thumbnail/chart?title=${t(
            'charts:txnFee.heading',
          )}`}
        />
        <meta
          name="twitter:image:src"
          content={`${process.env.NEXT_PUBLIC_OG_URL}/thumbnail/chart?title=${t(
            'charts:txnFee.heading',
          )}`}
        />
      </Head>
      <section>
        <div className="bg-hero-pattern h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
              {t('charts:txnFee.heading')}
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
                    chartTypes={'txn-fee'}
                    ref={heightRef}
                  />
                }
                defaultSkelton={<Detail chartTypes={'txn-fee'} />}
                onChangeHeight={onChangeHeight}
                props={{
                  chartTypes: 'txn-fee',
                  poweredBy: false,
                  network: networkId,
                  t: t,
                }}
                loading={
                  <Detail
                    className="absolute"
                    chartTypes={'txn-fee'}
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

TxnFeeChart.getLayout = (page: ReactElement) => (
  <Layout notice={<Notice />}>{page}</Layout>
);

export default TxnFeeChart;
