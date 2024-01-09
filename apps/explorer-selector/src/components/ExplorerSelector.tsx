import { useRouter } from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

const ExplorerSelector = () => {
  const components = useBosComponents();
  const router = useRouter();

  return (
    <div className="p-2">
      <VmComponent
        src={components?.home}
        props={{ path: router?.asPath, network: network }}
      />
    </div>
  );
};

export default ExplorerSelector;
