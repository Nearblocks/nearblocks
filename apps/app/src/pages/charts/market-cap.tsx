import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';

const MarketCapChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ chartTypes: 'market-cap', poweredBy: false, network: networkId }}
    />
  );
};

export default MarketCapChart;
