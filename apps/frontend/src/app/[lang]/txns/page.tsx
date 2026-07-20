import { Metadata } from 'next';

import { Txns as AddressTxns } from '@/components/address/txns';
import { ErrorSuspense } from '@/components/error-suspense';
import { Link } from '@/components/link';
import { PageHeading } from '@/components/page-heading';
import { Txns } from '@/components/txns';
import {
  fetchTxnCount as fetchAddressTxnCount,
  fetchTxns as fetchAddressTxns,
} from '@/data/address/txns';
import { fetchTxnCount, fetchTxns, fetchTxnStats } from '@/data/txns';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/txns'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'txns');

  return {
    alternates: { canonical: '/txns' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const TxnsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'txns');
  const filters = await searchParams;
  const account =
    typeof filters.account === 'string' ? filters.account : undefined;

  if (account) {
    const txnsPromise = fetchAddressTxns(account, filters);
    const txnCountPromise = fetchAddressTxnCount(account, filters);
    await holdNav();

    return (
      <>
        <PageHeading
          apiTag="txns"
          title={
            <>
              {t('titleByAccount')}{' '}
              <Link
                className="text-link text-body-base break-all"
                href={`/address/${account}`}
              >
                {account}
              </Link>
            </>
          }
        />
        <ErrorSuspense
          fallback={<AddressTxns address={account} basePath="/txns" loading />}
        >
          <AddressTxns
            address={account}
            basePath="/txns"
            txnCountPromise={txnCountPromise}
            txnsPromise={txnsPromise}
          />
        </ErrorSuspense>
      </>
    );
  }

  const block = typeof filters.block === 'string' ? filters.block : undefined;
  const isFiltered = !!block;
  const txnsPromise = fetchTxns(filters);
  const txnCountPromise = fetchTxnCount(filters);
  const txnStatsPromise = isFiltered ? undefined : fetchTxnStats();
  await holdNav();

  const title = block ? (
    <>
      {t('titleByBlock')}{' '}
      <span className="text-muted-foreground text-body-base">
        {block.length > 12 ? `${block.slice(0, 8)}…${block.slice(-4)}` : block}
      </span>
    </>
  ) : (
    t('title')
  );

  return (
    <>
      <PageHeading apiTag="txns" title={title} />
      <ErrorSuspense fallback={<Txns loading showStats={!isFiltered} />}>
        <Txns
          showStats={!isFiltered}
          txnCountPromise={txnCountPromise}
          txnsPromise={txnsPromise}
          txnStatsPromise={txnStatsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TxnsPage;
