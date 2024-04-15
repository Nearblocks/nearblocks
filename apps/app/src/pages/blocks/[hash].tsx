import { useRouter } from 'next/router';
import Head from 'next/head';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import useTranslation from 'next-translate/useTranslation';
import { networkId, appUrl } from '@/utils/config';
import Detail from '@/components/skeleton/common/Detail';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';

const network = env('NEXT_PUBLIC_NETWORK_ID');

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
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'blocks:block.metaTitle',
            {
              block: hash,
            },
          )}`}
        </title>
        <meta
          name="title"
          content={t('blocks:block.metaTitle', { block: hash })}
        />
        <meta
          name="description"
          content={t('blocks:block.metaDescription', { block: hash })}
        />
        <meta
          property="og:title"
          content={t('blocks:block.metaTitle', { block: hash })}
        />
        <meta
          property="og:description"
          content={t('blocks:block.metaDescription', { block: hash })}
        />
        <meta
          property="twitter:title"
          content={t('blocks:block.metaTitle', { block: hash })}
        />
        <meta
          property="twitter:description"
          content={t('blocks:block.metaDescription', { block: hash })}
        />
        <link rel="canonical" href={`${appUrl}/blocks/${hash}`} />
      </Head>
      <div style={height} className="relative container mx-auto px-3">
        <VmComponent
          src={components?.blocksDetail}
          props={{
            hash: hash,
            network: networkId,
            t: t,
          }}
          loading={
            <Detail className="absolute" ref={heightRef} network={networkId} />
          }
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
