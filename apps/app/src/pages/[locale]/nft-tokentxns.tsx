import Head from 'next/head';
import { appUrl } from '@/utils/config';
import { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import fetcher from '@/utils/fetcher';
import { ReactElement } from 'react';
import { env } from 'next-runtime-env';
import queryString from 'qs';
import Layout from '@/components/Layouts';
import TransfersList from '@/components/Tokens/NFTTransfers';
import { fetchData } from '@/utils/fetchData';
import { useTranslations } from 'next-intl';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

export const getServerSideProps: GetServerSideProps<{
  data: any;
  dataCount: any;
  syncDetails: any;
  error: boolean;
  statsDetails: any;
  latestBlocks: any;
  searchResultDetails: any;
  searchRedirectDetails: any;
  messages: any;
}> = async (context) => {
  const {
    query: { keyword = '', query = '', filter = 'all', ...qs },
  }: any = context;

  const apiUrl = 'nfts/txns';
  const fetchUrl = qs ? `nfts/txns?${queryString.stringify(qs)}` : `${apiUrl}`;

  const key = keyword?.replace(/[\s,]/g, '');
  const q = query?.replace(/[\s,]/g, '');

  try {
    const [dataResult, dataCountResult, syncResult] = await Promise.allSettled([
      fetcher(fetchUrl),
      fetcher('nfts/txns/count'),
      fetcher(`sync/status`),
    ]);
    const data = dataResult.status === 'fulfilled' ? dataResult.value : null;
    const dataCount =
      dataCountResult.status === 'fulfilled' ? dataCountResult.value : null;
    const syncDetails =
      syncResult.status === 'fulfilled' ? syncResult.value : null;
    const error = dataResult.status === 'rejected';

    const {
      statsDetails,
      latestBlocks,
      searchResultDetails,
      searchRedirectDetails,
    } = await fetchData(q, key, filter);

    const locale = context?.params?.locale;

    const [commonMessages, tokenMessages, txnsMessages] = await Promise.all([
      import(`nearblocks-trans-next-intl/${locale || 'en'}/common.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/token.json`),
      import(`nearblocks-trans-next-intl/${locale || 'en'}/txns.json`),
    ]);

    const messages = {
      ...commonMessages.default,
      ...tokenMessages.default,
      ...txnsMessages.default,
    };

    return {
      props: {
        data,
        dataCount,
        syncDetails,
        error,
        statsDetails,
        latestBlocks,
        searchResultDetails,
        searchRedirectDetails,
        messages,
      },
    };
  } catch (error) {
    console.error('Error fetching nftTransfers:', error);
    return {
      props: {
        data: null,
        dataCount: null,
        syncDetails: null,
        error: true,
        statsDetails: null,
        latestBlocks: null,
        searchResultDetails: null,
        searchRedirectDetails: null,
        messages: null,
      },
    };
  }
};

const NftToxenTxns = ({
  data,
  dataCount,
  syncDetails,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const t = useTranslations();

  const status: {
    height: 0;
    sync: true;
  } = syncDetails?.status?.indexers?.events;

  const thumbnail = `${ogUrl}/thumbnail/basic?title=Latest%20Near%20NEP-171%20Token%20Transfers&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('nfts.metaTitle')} `}
        </title>
        <meta name="title" content={t('nfts.metaTitle')} />
        <meta name="description" content={t('nfts.metaDescription')} />
        <meta property="og:title" content={t('nfts.metaTitle')} />
        <meta property="og:description" content={t('nfts.metaDescription')} />
        <meta property="twitter:title" content={t('nfts.metaTitle')} />
        <meta
          property="twitter:description"
          content={t('nfts.metaDescription')}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/nft-tokentxns`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              {t ? t('nfts.heading') : 'Non-Fungible Token Transfers'}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48 ">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <TransfersList
                data={data}
                totalCount={dataCount}
                error={error}
                status={status}
              />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};
NftToxenTxns.getLayout = (page: ReactElement) => (
  <Layout
    statsDetails={page?.props?.statsDetails}
    latestBlocks={page?.props?.latestBlocks}
    searchResultDetails={page?.props?.searchResultDetails}
    searchRedirectDetails={page?.props?.searchRedirectDetails}
  >
    {page}
  </Layout>
);
export default NftToxenTxns;
