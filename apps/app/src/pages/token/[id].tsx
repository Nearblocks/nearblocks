import { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Overview from '@/components/skeleton/ft/Overview';

import Layout from '@/components/Layouts';
import { ReactElement, useEffect, useRef, useState } from 'react';
const Token = () => {
  const router = useRouter();
  const { id } = router.query;
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
    <div style={height} className="relative container mx-auto px-3">
      <VmComponent
        skeleton={<Overview ref={heightRef} />}
        onChangeHeight={onChangeHeight}
        src={components?.ftOverview}
        props={{ id: id, t: t, network: networkId }}
      />
    </div>
  );
};

Token.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Token;
