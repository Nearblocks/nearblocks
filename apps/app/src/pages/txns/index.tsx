import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';

const TransactionList = () => {
  const components = useBosComponents();

  return <VmComponent src={components?.transaction} />;
};

export default TransactionList;
