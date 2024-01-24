import { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import Overview from '@/components/skeleton/common/Overview';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';

const Address = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();

  return (
    <div className="relative container mx-auto px-3">
      <VmComponent
        skeleton={<Overview border={true} />}
        src={components?.account}
        props={{
          id: id,
          network: networkId,
          t: t,
        }}
      />
    </div>
  );
};

Address.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Address;
