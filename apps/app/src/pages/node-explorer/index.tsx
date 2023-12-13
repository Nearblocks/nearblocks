import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';

const Blocks = () => {
  const components = useBosComponents();

  return <VmComponent src={components?.nodeExplorer} />;
};

export default Blocks;
