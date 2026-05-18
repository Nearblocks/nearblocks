import { Metadata } from 'next';

import { StakingTxns as AddressStakingTxns } from '@/components/address/staking';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { StakingTxns } from '@/components/staking';
import {
  fetchStaking as fetchAddressStaking,
  fetchStakingCount as fetchAddressStakingCount,
} from '@/data/address/staking';
import { fetchStaking, fetchStakingCount } from '@/data/staking';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/staking-txns'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'staking');

  return {
    alternates: { canonical: '/staking-txns' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const StakingTxnsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'staking');
  const filters = await searchParams;
  const account =
    typeof filters.account === 'string' ? filters.account : undefined;

  if (account) {
    const stakingPromise = fetchAddressStaking(account, filters);
    const stakingCountPromise = fetchAddressStakingCount(account, filters);

    return (
      <>
        <PageHeading apiTag="staking" title={t('title')} />
        <ErrorSuspense fallback={<AddressStakingTxns loading />}>
          <AddressStakingTxns
            address={account}
            basePath="/staking-txns"
            stakingCountPromise={stakingCountPromise}
            stakingPromise={stakingPromise}
          />
        </ErrorSuspense>
      </>
    );
  }

  const stakingPromise = fetchStaking(filters);
  const stakingCountPromise = fetchStakingCount(filters);

  return (
    <>
      <PageHeading apiTag="staking" title={t('title')} />
      <ErrorSuspense fallback={<StakingTxns loading />}>
        <StakingTxns
          stakingCountPromise={stakingCountPromise}
          stakingPromise={stakingPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default StakingTxnsPage;
