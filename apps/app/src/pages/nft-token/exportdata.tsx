import Layout from '@/components/Layouts';
import Export from '@/components/skeleton/common/Export';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useRef, useState } from 'react';

const ExportData = () => {
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const router = useRouter();
  const components = useBosComponents();
  const { address } = router.query;

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

  const onHandleDowload = (blobUrl: string, file: string): void => {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.setAttribute('download', file);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={height} className="relative">
      <VmComponent
        src={components?.exportData}
        skeleton={<Export className="absolute" ref={heightRef} />}
        defaultSkelton={<Export />}
        onChangeHeight={onChangeHeight}
        props={{
          network: networkId,
          id: address,
          onHandleDowload: onHandleDowload,
          exportType: 'NFT Token Transactions',
        }}
      />
    </div>
  );
};

ExportData.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default ExportData;
