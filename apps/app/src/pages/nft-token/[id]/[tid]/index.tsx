import Head from 'next/head';
import { VmComponent } from '@/components/vm/VmComponent';
import { apiUrl, networkId, appUrl } from '@/utils/config';
import { useRouter } from 'next/router';
import { useBosComponents } from '@/hooks/useBosComponents';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layouts';
import Detail from '@/components/skeleton/nft/Detail';
import { Token } from '@/utils/types';
import { env } from 'next-runtime-env';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const userApiUrl = env('NEXT_PUBLIC_USER_API_URL');
const NFTokenInfo = () => {
  const router = useRouter();
  const { id, tid } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const [token, setToken] = useState<Token | null>(null);

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

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch(`${apiUrl}nfts/${id}/tokens/${tid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const dataArray = await response.json();
        const data: any = dataArray?.tokens?.[0];
        if (response.status === 200) {
          setToken(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
      }
    }

    fetchToken();
  }, [id, tid]);

  const meta = useMemo(() => {
    const prefix = network === 'testnet' ? 'TESTNET ' : '';
    const title = token
      ? `NFT ${token.title || token.token} | ${token?.nft?.name}`
      : 'Token Info';

    const description = token
      ? `All the details about NFT ${
          token?.title || token?.token
        } from the ${token?.nft
          ?.name} collection : Owner, Contract address, token ID, token standard, description and metadata.`
      : 'Token Info';
    const suffix = ' | NearBlocks';

    return {
      title: prefix + title + suffix,
      description: description,
    };
  }, [token]);

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="title" content={meta.title} />
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="twitter:title" content={meta.title} />
        <meta property="twitter:description" content={meta.description} />
        <link rel="canonical" href={`${appUrl}/nft-token/${id}/${tid}`} />
      </Head>
      <div style={height} className="relative">
        <VmComponent
          skeleton={<Detail className="absolute" ref={heightRef} />}
          defaultSkelton={<Detail />}
          src={components?.nftDetail}
          onChangeHeight={onChangeHeight}
          props={{
            network: networkId,
            t: t,
            id: id,
            tid: tid,
            userApiUrl,
          }}
          loading={<Detail className="absolute" ref={heightRef} />}
        />
      </div>
    </>
  );
};
NFTokenInfo.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default NFTokenInfo;
