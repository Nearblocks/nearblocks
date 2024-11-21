export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';

import MultiChainTxns from '@/components/app/ChainAbstraction/MultiChainTxns';
import Stats from '@/components/app/ChainAbstraction/Stats';
import { getRequest } from '@/utils/app/api';
import { appUrl, chain } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale });

  const metaTitle = `${t('metaTitle')} | NearBlocks`;

  const metaDescription = `${t('metaDescription')}`;

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    t('heading'),
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/multi-chain-txns`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [
        {
          alt: metaTitle,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: metaTitle,
    },
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function TransactionList(props: {
  params: Promise<{ hash?: string; locale: string }>;
  searchParams: Promise<{
    from?: string;
    multichain_address?: string;
    order: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale });
  const apiUrl = `chain-abstraction/txns`;
  const countUrl = `${apiUrl}/count`;
  const chartUrl = `charts`;
  const today = new Date();
  const beforeDate = today.toISOString().split('T')[0];
  const afterDate = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [data, dataCount, dataTxnsTotalCount, dataTxns24HrCount, dataChart] =
    await Promise.all([
      getRequest(apiUrl, searchParams),
      getRequest(countUrl, searchParams),
      getRequest(countUrl),
      getRequest(countUrl, { after_date: afterDate, before_date: beforeDate }),
      getRequest(chartUrl),
    ]);

  const count = dataCount?.txns[0]?.count;
  const txns = data?.txns;
  let cursor = data?.cursor;

  const txnsTotalCount = dataTxnsTotalCount?.txns[0]?.count;
  const txns24HrCount = dataTxns24HrCount?.txns[0]?.count;
  const networksCount = Object.keys(chain).length;

  return (
    <>
      <div className="h-24">
        <div className="container-xxl mx-auto px-5">
          <h1 className="pt-8 sm:!text-2xl text-xl text-gray-700 dark:text-neargray-10 ">
            {t ? t('heading') : 'Latest Multichain Transactions'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5">
        <div className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <Stats
              dataChart={dataChart}
              error={!data}
              networksCount={networksCount}
              txns24HrCount={txns24HrCount}
              txnsTotalCount={txnsTotalCount}
            />
            <div className="py-6"></div>
            <MultiChainTxns
              count={count}
              cursor={cursor}
              error={!data}
              isTab={false}
              tab={''}
              txns={txns}
            />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
