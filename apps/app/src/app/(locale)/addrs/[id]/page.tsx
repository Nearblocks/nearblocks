import Balance from '@/app/_components/Address/Balance';
import Buttons from '@/app/_components/Address/Button';
import BalanceSkeleton from '@/app/_components/skeleton/address/balance';
import TabPanelGeneralSkeleton from '@/app/_components/skeleton/address/dynamicTab';
import SponserdText from '@/app/_components/SponserdText';
import { appUrl } from '@/app/utils/config';
import Transactions from '@/app/_components/Address/Transactions';
import { Suspense } from 'react';
import TokenTransactions from '@/app/_components/Address/TokenTransactions';
import NFTTransactions from '@/app/_components/Address/NFTTransactions';
import Link from 'next/link';
import { getRequest } from '@/app/utils/api';
import classNames from 'classnames';
import AccessKeys from '@/app/_components/Address/AccessKeys';
import Overview from '@/app/_components/Address/Contract/Overview';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

// Simulated absence of the translation function
const t = (key: string, p?: any): string | undefined => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : key; // Return undefined to simulate absence
};

const getMetaContent = (
  t: (key: string, params?: any) => string | undefined,
  key: string,
  params?: any,
) => t(key, params) || 'Near Account | NearBlocks';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const title = getMetaContent(t, 'address:metaTitle', { address: '' });
  const description = getMetaContent(t, 'address:metaDescription', {
    address: '',
  });
  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
    getMetaContent(t, 'address:heading', { address: '' }),
  )}&brand=near`;

  return {
    title: `${network === 'testnet' ? 'TESTNET ' : ''}${title}`,
    description,
    openGraph: { title, description, images: [thumbnail] },
    twitter: { title, description, images: [thumbnail] },
    alternates: { canonical: `${appUrl}/address/${params.locale}` },
  };
}

const getClassName = (selected: boolean) =>
  classNames(
    'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
    {
      'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
        !selected,
      'bg-green-600 dark:bg-green-250 text-white': selected,
    },
  );

export default async function ({
  params: { id },
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab: string; cursor?: string; p?: string; order: string };
}) {
  const parse = await getRequest(`account/${id}/contract/parse`);

  const tab = searchParams?.tab;

  console.log({ tab });

  const tabs = [
    { name: 'txns', label: 'Transactions' },
    { name: 'tokentxns', label: 'Token Txns' },
    { name: 'nfttokentxns', label: 'NFT Token Txns' },
    { name: 'accesskeys', label: 'Access Keys' },
    { name: 'contract', label: 'Contract' },
  ];

  return (
    <>
      <div className="relative container mx-auto px-3 mb-10">
        <div className="flex items-center justify-between flex-wrap pt-4">
          <div className="flex md:flex-wrap w-full">
            <h1 className="py-2 break-all space-x-2 text-xl text-gray-700 leading-8 px-2 dark:text-neargray-10 border-b w-full mb-5 dark:border-black-200">
              Near Account:&nbsp;
              {id && (
                <span className="text-green-500 dark:text-green-250">
                  @<span className="font-semibold">{id}</span>
                </span>
              )}
              <Buttons address={id as string} />
            </h1>
          </div>
          <div className="container mx-auto pl-2 pb-6 text-nearblue-600">
            <div className="min-h-[80px] md:min-h-[25px]">
              <SponserdText />
            </div>
          </div>
        </div>
        <Suspense fallback={<BalanceSkeleton />}>
          <Balance id={id} />
        </Suspense>

        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-10">
          <div className="w-full ">
            <div className="flex flex-wrap ">
              {tabs?.map(({ name, label }) => {
                const hasContractTab =
                  parse?.contract?.[0]?.contract &&
                  parse?.contract?.[0]?.contract?.methodNames.length > 0;

                if (!hasContractTab && name === 'contract') return null;

                return (
                  <Link
                    key={name}
                    href={`/addrs/${id}?tab=${name}&order=desc`}
                    className={getClassName(name === tab)}
                  >
                    <h2>
                      {t(`address:${name}`) || label}
                      {name === 'contract' && (
                        <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md  -mt-3 px-1">
                          NEW
                        </div>
                      )}
                    </h2>
                  </Link>
                );
              })}
            </div>
            <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
              {!tab || tab === 'txns' ? (
                <Suspense
                  fallback={<TabPanelGeneralSkeleton tab={tab || 'txns'} />}
                >
                  <Transactions id={id} searchParams={searchParams} />
                </Suspense>
              ) : null}

              {tab === 'tokentxns' ? (
                <Suspense fallback={<TabPanelGeneralSkeleton tab={tab} />}>
                  <TokenTransactions id={id} searchParams={searchParams} />
                </Suspense>
              ) : null}

              {tab === 'nfttokentxns' ? (
                <Suspense fallback={<TabPanelGeneralSkeleton tab={tab} />}>
                  <NFTTransactions id={id} searchParams={searchParams} />
                </Suspense>
              ) : null}

              {tab === 'accesskeys' ? (
                <Suspense fallback={<TabPanelGeneralSkeleton tab={tab} />}>
                  <AccessKeys id={id} searchParams={searchParams} />
                </Suspense>
              ) : null}

              {tab === 'contract' ? (
                <Suspense fallback={<TabPanelGeneralSkeleton tab={tab} />}>
                  <Overview id={id} searchParams={searchParams} />
                </Suspense>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
