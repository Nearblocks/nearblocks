import Head from 'next/head';
import { VmComponent } from '@/components/vm/VmComponent';
import { apiUrl, networkId, appUrl } from '@/utils/config';
import { useRouter } from 'next/router';
import { useBosComponents } from '@/hooks/useBosComponents';
import Overview from '@/components/skeleton/nft/Overview';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layouts';
import { Token } from '@/utils/types';
import { env } from 'next-runtime-env';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');
const NFToken = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();
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
    async function fetchToken() {
      try {
        const response = await fetch(`${apiUrl}nfts/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const dataArray = await response.json();
        const data: any = dataArray?.contracts?.[0];
        if (response.status === 200) {
          setToken(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
      }
    }

    fetchToken();
  }, [id]);

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    token ? `${token.name} (${token.symbol}) ` : ''
  }NFT Stats, Holders & Transactions | NearBlocks`;
  const description = token
    ? `All you need to know about the ${token.name} NFT Collection : Statistics, total supply, number of holders, latest transactions & meta-data.`
    : '';
  const thumbnail = `${ogUrl}/thumbnail/nft-token?token=${token?.name}&network=${network}&brand=near`;

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
        <link rel="canonical" href={`${appUrl}/nft-token/${id}`} />
      </Head>
      <div style={height} className="relative container mx-auto px-3">
        <VmComponent
          skeleton={<Overview className="absolute pr-6" ref={heightRef} />}
          defaultSkelton={<Overview />}
          onChangeHeight={onChangeHeight}
          src={components?.nftOverview}
          props={{
            id: id,
            network: networkId,
          }}
          loading={<Overview className="absolute pr-6" ref={heightRef} />}
        />{' '}
        <div className="py-8"></div>
      </div>
    </>
  );
};

NFToken.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NFToken;
