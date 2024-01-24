import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const TxnsChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'txns', poweredBy: false, network: networkId }}
    />
  );
};

TxnsChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default TxnsChart;
