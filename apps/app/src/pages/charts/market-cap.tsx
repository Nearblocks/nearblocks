import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const MarketCapChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'market-cap', poweredBy: false, network: networkId }}
    />
  );
};

MarketCapChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default MarketCapChart;
