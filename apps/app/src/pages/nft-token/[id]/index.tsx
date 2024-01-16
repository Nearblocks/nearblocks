import { VmComponent } from '@/components/vm/VmComponent';
import { networkId } from '@/utils/config';
import { useRouter } from 'next/router';
import { useBosComponents } from '@/hooks/useBosComponents';
import Overview from '@/components/skeleton/common/Overview';

const NFToken = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();
  return (
    <div className="container mx-auto px-3">
      <VmComponent
        skeleton={<Overview />}
        src={components?.nftOverview}
        props={{
          id: id,
          network: networkId,
        }}
      />
    </div>
  );
};
export default NFToken;
