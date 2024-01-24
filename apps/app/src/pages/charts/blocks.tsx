import Layout from '@/components/Layouts';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { ReactElement } from 'react';

const BlocksChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'blocks', poweredBy: false, network: networkId }}
    />
  );
};

BlocksChart.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default BlocksChart;
