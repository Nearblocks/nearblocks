import { VmComponent } from '@/components/vm/VmComponent';
import { networkId } from '@/utils/config';
import { useRouter } from 'next/router';
import { useBosComponents } from '@/hooks/useBosComponents';
import useTranslation from 'next-translate/useTranslation';
import Overview from '@/components/skeleton/common/Overview';

const NFTokenInfo = () => {
  const router = useRouter();
  const { id, tid } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-3">
      <VmComponent
        skeleton={<Overview />}
        src={components?.nftDetail}
        props={{
          network: networkId,
          t: t,
          id: id,
          tid: tid,
        }}
      />
    </div>
  );
};
export default NFTokenInfo;
