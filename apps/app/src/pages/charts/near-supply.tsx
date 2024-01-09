import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';

const NearSupplyChart = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{
        chartTypes: 'near-supply',
        poweredBy: false,
        network: networkId,
      }}
    />
  );
};

export default NearSupplyChart;
