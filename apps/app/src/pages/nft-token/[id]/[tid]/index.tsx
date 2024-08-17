import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Layout from '@/components/Layouts';
import { Token } from '@/utils/types';
import { env } from 'next-runtime-env';
import QueryString from 'qs';
import fetcher from '@/utils/fetcher';
import Detail from '@/components/Tokens/NFT/Detail';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/common/Spinner';
const network = env('NEXT_PUBLIC_NETWORK_ID');
export const getServerSideProps: GetServerSideProps<{
  tokenInfo: any;
  txnsList: any;
  txnsCount: any;
  error: boolean;
  id: string;
  tid: string;
}> = async (context) => {
  const {
    query: { id, tid, ...query },
  }: any = context;
  const apiUrl = `nfts/${id}/tokens/${tid}`;
  const fetchUrl = query
    ? `${apiUrl}/txns?${QueryString.stringify(query)}`
    : `${apiUrl}/txns`;
  try {
    const [tokenData, txnsListResult, txnsCountResult] =
      await Promise.allSettled([
        fetcher(apiUrl),
        fetcher(fetchUrl),
        fetcher(`${apiUrl}/txns/count`),
      ]);
    const tokenInfo = tokenData.status === 'fulfilled' ? tokenData.value : null;
    const txnsList =
      txnsListResult.status === 'fulfilled' ? txnsListResult.value : null;
    const txnsCount =
      txnsCountResult.status === 'fulfilled' ? txnsCountResult.value : null;
    const error = txnsListResult.status === 'rejected';
    return {
      props: {
        tokenInfo,
        txnsList,
        txnsCount,
        error,
        id,
        tid,
      },
    };
  } catch (error) {
    console.error('Error fetching nft-token-details:', error);
    return {
      props: {
        tokenInfo: null,
        txnsList: null,
        txnsCount: null,
        error: true,
        id: null,
        tid: null,
      },
    };
  }
};
const NFTokenInfo = ({
  tokenInfo,
  txnsList,
  txnsCount,
  error,
  id,
  tid,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleRouteChangeStart = (url: string) => {
      if (url !== router.asPath) {
        timeout = setTimeout(() => {
          setLoading(true);
        }, 300);
      }
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeComplete);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeComplete);
    };
  }, [router]);

  const token: Token | null = tokenInfo?.tokens?.[0];
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
      <div className="relative">
        {loading && <Spinner />}
        <Detail
          tokenInfo={tokenInfo}
          txnsList={txnsList}
          txnsCount={txnsCount}
          error={error}
          id={id}
          tid={tid}
        />
      </div>
    </>
  );
};
NFTokenInfo.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default NFTokenInfo;
