import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';

const NodeExplorer = () => {
  const components = useBosComponents();

  return <VmComponent src={components?.nodeExplorer} />;
};

export default NodeExplorer;
