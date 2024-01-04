import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';

const BlocksChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'blocks', poweredBy: false, network: networkId }}
    />
  );
};

export default BlocksChart;
