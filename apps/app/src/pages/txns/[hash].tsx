import { useRouter } from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Detail from '@/components/skeleton/common/Detail';

const Txn = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { hash } = router.query;
  const components = useBosComponents();

  return (
    <div className="container mx-auto px-3">
      <VmComponent
        src={components?.transactionsHash}
        props={{ hash: hash, network: networkId, t: t }}
        spinner={<Detail />}
      />
      <div className="py-8"></div>
    </div>
  );
};

export default Txn;
