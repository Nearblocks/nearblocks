import { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import Overview from '@/components/skeleton/common/Overview';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Layout from '@/components/Layouts';
import { useAuthStore } from '@/stores/auth';
import Head from 'next/head';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { env } from 'next-runtime-env';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const Address = () => {
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

  const requestSignInWithWallet = useAuthStore(
    (store) => store.requestSignInWithWallet,
  );

  const signedIn = useAuthStore((store) => store.signedIn);
  const account = useAuthStore((store) => store.account);
  const logOut = useAuthStore((store) => store.logOut);

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET ' : ''}
         ${t('address:metaTitle', { address: id })}`}
        </title>
        <meta name="title" content={t('address:metaTitle', { address: id })} />
        <meta
          name="description"
          content={t('address:metaDescription', { address: id })}
        />
        <meta
          property="og:title"
          content={t('address:metaTitle', { address: id })}
        />
        <meta
          property="og:description"
          content={t('address:metaDescription', { address: id })}
        />
        <meta
          property="twitter:title"
          content={t('address:metaTitle', { address: id })}
        />
        <meta
          property="twitter:description"
          content={t('address:metaDescription', { address: id })}
        />
        <meta
          property="og:image"
          content={`${ogUrl}/thumbnail/account?address=${id}&network=${network}`}
        />
        <meta
          property="og:image:secure_url"
          content={`${ogUrl}/thumbnail/account?address=${id}&network=${network}`}
        />
        <meta
          name="twitter:image:src"
          content={`${ogUrl}/thumbnail/account?address=${id}&network=${network}`}
        />
        <link rel="canonical" href={`${appUrl}/address/${id}`} />
      </Head>
      <div style={height} className="relative container mx-auto px-3">
        <VmComponent
          skeleton={<Overview className="absolute pr-6" ref={heightRef} />}
          defaultSkelton={<Overview />}
          onChangeHeight={onChangeHeight}
          src={components?.account}
          props={{
            id: id,
            network: networkId,
            t: t,
            requestSignInWithWallet: requestSignInWithWallet,
            signedIn: signedIn,
            accountId:
              account && account?.loading === false ? account?.accountId : null,
            logOut: logOut,
          }}
          loading={<Overview className="absolute pr-6" ref={heightRef} />}
        />
      </div>
    </>
  );
};

Address.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Address;
