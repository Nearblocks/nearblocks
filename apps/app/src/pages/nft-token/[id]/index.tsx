import { VmComponent } from '@/components/vm/VmComponent';
import { networkId } from '@/utils/config';
import { useRouter } from 'next/router';
import { useBosComponents } from '@/hooks/useBosComponents';
import Overview from '@/components/skeleton/common/Overview';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layouts';

const NFToken = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const updateOuterDivHeight = () => {
    if (heightRef.current) {
      const Height = heightRef.current.offsetHeight;
      setHeight({ height: Height });
    } else {
      setHeight({});
    }
  };
  useEffect(() => {
    updateOuterDivHeight();
    window.addEventListener('resize', updateOuterDivHeight);

    return () => {
      window.removeEventListener('resize', updateOuterDivHeight);
    };
  }, []);
  const onChangeHeight = () => {
    setHeight({});
  };
  console.log(height);
  return (
    <div style={height} className="relative container mx-auto px-3">
      <VmComponent
        skeleton={<Overview nft={true} ref={heightRef} />}
        onChangeHeight={onChangeHeight}
        src={components?.nftOverview}
        props={{
          id: id,
          network: networkId,
        }}
      />
    </div>
  );
};

NFToken.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NFToken;
