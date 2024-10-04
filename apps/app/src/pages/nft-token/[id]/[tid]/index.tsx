import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { ReactElement, useMemo } from 'react';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Layout from '@/components/Layouts';
import { Token } from '@/utils/types';
import { env } from 'next-runtime-env';
import QueryString from 'qs';
import fetcher from '@/utils/fetcher';
import Detail from '@/components/Tokens/NFT/Detail';
import { fetchData } from '@/utils/fetchData';

const network = env('NEXT_PUBLIC_NETWORK_ID');
export const getServerSideProps: GetServerSideProps<{
  tokenInfo: any;
  txnsList: any;
  txnsCount: any;
  error: boolean;
  id: string;
  tid: string;
  statsDetails: any;
  latestBlocks: any;
  searchRedirectDetails: any;
  searchResultDetails: any;
}> = async (context) => {
  const {
    query: { id, tid, query = '', filter = 'all', keyword = '', ...qs },
  }: any = context;
  const apiUrl = `nfts/${id}/tokens/${tid}`;
  const fetchUrl = qs
    ? `${apiUrl}/txns?${QueryString.stringify(qs)}`
    : `${apiUrl}/txns`;
  const q = query?.replace(/[\s,]/g, '');
  const key = keyword?.replace(/[\s,]/g, '');

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

    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    return {
      props: {
        tokenInfo,
        txnsList,
        txnsCount,
        error,
        id,
        tid,
        statsDetails,
        latestBlocks,
        searchRedirectDetails,
        searchResultDetails,
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
        statsDetails: null,
        latestBlocks: null,
        searchRedirectDetails: null,
        searchResultDetails: null,
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
NFTokenInfo.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);
export default NFTokenInfo;
