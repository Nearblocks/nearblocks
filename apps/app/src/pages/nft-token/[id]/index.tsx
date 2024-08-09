import Head from 'next/head';
import { apiUrl, appUrl } from '@/utils/config';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import Layout from '@/components/Layouts';
import { Token } from '@/utils/types';
import { env } from 'next-runtime-env';
import Overview from '@/components/Token/NFT/Overview';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');
const NFToken = () => {
  const router = useRouter();
  const { id } = router.query;
  const [token, setToken] = useState<Token | null>(null);

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
      <div className="relative container mx-auto px-3">
        <Overview />
        <div className="py-8"></div>
      </div>
    </>
  );
};

NFToken.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NFToken;
