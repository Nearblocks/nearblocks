import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { NftTokens } from '@/components/nft-tokens';
import { fetchNFTTokenCount, fetchNFTTokens } from '@/data/nft-tokens';
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

  return (
    <>
      <h1 className="text-headline-lg mb-4">{t('title')}</h1>
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
