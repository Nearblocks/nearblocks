import { VmComponent } from '@/components/vm/VmComponent';
import { networkId } from '@/utils/config';
import { useRouter } from 'next/router';
import { useBosComponents } from '@/hooks/useBosComponents';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layouts';
import Detail from '@/components/skeleton/nft/Detail';

const NFTokenInfo = () => {
  const router = useRouter();
  const { id, tid } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
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
  return (
    <div style={height} className="relative container mx-auto">
      <VmComponent
        skeleton={<Detail ref={heightRef} />}
        src={components?.nftDetail}
        onChangeHeight={onChangeHeight}
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
NFTokenInfo.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default NFTokenInfo;
