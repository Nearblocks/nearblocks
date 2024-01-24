import { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Overview from '@/components/skeleton/ft/Overview';
import { ReactElement } from 'react';
import Layout from '@/components/Layouts';

const Token = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
  return (
    <div className="relative container mx-auto px-3">
      <VmComponent
        skeleton={<Overview />}
        src={components?.ftOverview}
        props={{ id: id, t: t, network: networkId }}
      />
    </div>
  );
};

Token.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Token;
