import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const NearPriceChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'near-price', poweredBy: false, network: networkId }}
    />
  );
};

NearPriceChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NearPriceChart;
