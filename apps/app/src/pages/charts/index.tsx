import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';

const Charts = () => {
  const components = useBosComponents();

  return (
    <VmComponent
      src={components?.charts}
      props={{ poweredBy: false, network: networkId }}
    />
  );
};

export default Charts;
