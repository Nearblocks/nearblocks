import { useRouter } from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import useTranslation from 'next-translate/useTranslation';
import { networkId } from '@/utils/config';
import Detail from '@/components/skeleton/common/Detail';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layouts';

const Block = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { hash } = router.query;
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
  return (
    <>
      <div style={height} className="relative container mx-auto px-3">
        <VmComponent
          src={components?.blocksDetail}
          props={{
            hash: hash,
            network: networkId,
            t: t,
          }}
          skeleton={
            <Detail className="absolute" ref={heightRef} network={networkId} />
          }
          defaultSkelton={<Detail network={networkId} />}
          onChangeHeight={onChangeHeight}
        />
      </div>{' '}
      <div className="py-8"></div>
    </>
  );
};

Block.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Block;
