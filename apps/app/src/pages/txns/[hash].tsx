import { useRouter } from 'next/router';
import Head from 'next/head';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Detail from '@/components/skeleton/common/Detail';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';
import { useAuthStore } from '@/stores/auth';
import SponserdText from '@/components/SponserdText';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const Txn = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { hash } = router.query;
  const components = useBosComponents();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const pageTab = `${router?.query?.tab || 'overview'}`;

  let title = t('txns:txn.metaTitle', { txn: hash });
  title = `${network === 'testnet' ? 'TESTNET' : ''} ${title}`;
  const description = t('txns:txn.metaDescription', { txn: hash });
  const thumbnail = `${ogUrl}/thumbnail/txn?transaction_hash=${hash}&network=${network}&brand=near`;

  const onHandleTab = (hashValue: string) => {
    router.push(`/txns/${hash}?tab=${hashValue}`);
  };

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

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/txns/${hash}`} />
      </Head>
      <div className="md:flex items-center justify-between container mx-auto px-3">
        <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 pt-5 pb-2 border-b w-full">
          {t ? t('txns:txn.heading') : 'Transaction Details'}
        </h1>
      </div>
      <div className="container mx-auto pt-3 pb-6 px-5 text-nearblue-600">
        <SponserdText />
      </div>
      <div style={height} className="relative container mx-auto px-3">
        <VmComponent
          src={components?.transactionsHash}
          props={{
            hash: hash,
            network: networkId,
            t: t,
            onHandleTab: onHandleTab,
            requestSignInWithWallet,
            pageTab: pageTab,
          }}
          skeleton={
            <Detail
              className="absolute"
              txns={true}
              ref={heightRef}
              network={networkId}
              pageTab={pageTab}
            />
          }
          defaultSkelton={
            <Detail txns={true} network={networkId} pageTab={pageTab} />
          }
          onChangeHeight={onChangeHeight}
          loading={
            <Detail
              className="absolute"
              txns={true}
              ref={heightRef}
              network={networkId}
              pageTab={pageTab}
            />
          }
        />
      </div>
      <div className="py-8"></div>
    </>
  );
};

Txn.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Txn;
