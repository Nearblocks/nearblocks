import { useRouter } from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';

const Address = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();

  return (
    <>
      <VmComponent src={components?.account} props={{ id: id }} />
    </>
  );
};

export default Address;
