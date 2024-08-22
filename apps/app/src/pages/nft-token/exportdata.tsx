import Layout from '@/components/Layouts';
import Export from '@/components/skeleton/common/Export';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { appUrl, networkId } from '@/utils/config';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';

export const getServerSideProps: GetServerSideProps<{
  statsDetails: any;
  latestBlocks: any;
}> = async () => {
  try {
    const [statsResult, latestBlocksResult] = await Promise.allSettled([
      fetcher(`stats`),
      fetcher(`blocks/latest?limit=1`),
    ]);

    const statsDetails =
      statsResult.status === 'fulfilled' ? statsResult.value : null;
    const latestBlocks =
      latestBlocksResult.status === 'fulfilled'
        ? latestBlocksResult.value
        : null;

    return {
      props: {
        statsDetails,
        latestBlocks,
      },
    };
  } catch (error) {
    console.error('Error fetching charts:', error);
    return {
      props: {
        statsDetails: null,
        latestBlocks: null,
      },
    };
  }
};

const ExportData = () => {
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const router = useRouter();
  const components = useBosComponents();
  const { address } = router.query;

  const title = 'Export NFT Token Transactions Data | Nearblocks';

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
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        <link rel="canonical" href={`${appUrl}/nft-token/exportdata`} />
      </Head>
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
          loading={<Export className="absolute" ref={heightRef} />}
        />
      </div>
    </>
  );
};

ExportData.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
  >
    {page}
  </Layout>
);

export default ExportData;
