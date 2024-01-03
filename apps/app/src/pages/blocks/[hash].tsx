import { useRouter } from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import useTranslation from 'next-translate/useTranslation';
import { networkId } from '@/utils/config';
import Detail from '@/components/skeleton/common/Detail';

const Block = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { hash } = router.query;
  const components = useBosComponents();

  return (
    <div className="container mx-auto px-3">
      <VmComponent
        src={components?.blocksDetail}
        props={{
          hash: hash,
          network: networkId,
          t: t,
        }}
        spinner={<Detail />}
      />
    </div>
  );
};

export default Block;
