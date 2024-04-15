import Layout from '@/components/Layouts';
import Detail from '@/components/skeleton/charts/Detail';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { useTheme } from 'next-themes';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';

const ActiveAccountsChart = () => {
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
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white">
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
              defaultSkelton={<Detail chartTypes={'active-account-daily'} />}
              onChangeHeight={onChangeHeight}
              props={{
                chartTypes: 'active-account-daily',
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
  );
};

ActiveAccountsChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default ActiveAccountsChart;
