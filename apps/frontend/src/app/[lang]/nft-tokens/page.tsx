import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokens } from '@/components/nft-tokens';
import { PageHeading } from '@/components/page-heading';
import { fetchNFTTokenCount, fetchNFTTokens } from '@/data/nft-tokens';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/nft-tokens'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'nfts');

  return {
    alternates: { canonical: '/nft-tokens' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const NftTokensPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'nfts');
  const filters = await searchParams;
  const nftTokensPromise = fetchNFTTokens(filters);
  const nftTokenCountPromise = fetchNFTTokenCount(filters);
  await holdNav();

  return (
    <>
      <PageHeading apiTag="nfts" title={t('title')} />
      <ErrorSuspense fallback={<NftTokens loading />}>
        <NftTokens
          nftTokenCountPromise={nftTokenCountPromise}
          nftTokensPromise={nftTokensPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default NftTokensPage;
