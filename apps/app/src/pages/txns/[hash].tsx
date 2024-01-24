import { useRouter } from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Detail from '@/components/skeleton/common/Detail';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';

const Txn = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { hash } = router.query;
  const components = useBosComponents();

  return (
    <div className="relative container mx-auto">
      <VmComponent
        src={components?.transactionsHash}
        props={{ hash: hash, network: networkId, t: t }}
        skeleton={<Detail network={networkId} />}
      />
      <div className="py-8"></div>
    </div>
  );
};

Txn.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Txn;
