import { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import TokensSkeleton from '@/components/app/skeleton/ft/Tokens';
import { appUrl, networkId } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = 'Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks';
  const metaDescription =
    'A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/tokens`,
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
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

const errorBoundaryFallback = (
  <div className="overflow-x-auto">
    <div className="bg-white dark:bg-black-600 drak:border-black-200 border soft-shadow rounded-xl pb-1 ">
      <div className="pl-6 max-w-lg w-full py-5 ">
        <div className="pl-6 max-w-sm leading-7 h-4" />
      </div>
      <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
        <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
          <tr className="h-[57px]">
            <td
              className="px-6 py-4 text-gray-400 text-xs rounded-b-xl"
              colSpan={100}
            >
              <ErrorMessage
                icons={<FaInbox />}
                message={''}
                mutedText="Please try again later"
                reset
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default async function TokensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section>
        <div>
          <div className="container-xxl mx-auto p-5">
            <h1 className="text-lg font-medium dark:text-neargray-10 text-nearblue-600">
              Near Protocol Ecosystem Tokens (NEP-141)
            </h1>
          </div>
        </div>
        <div className="container-xxl mx-auto px-4">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <ErrorBoundary fallback={errorBoundaryFallback}>
                <Suspense fallback={<TokensSkeleton />}>{children}</Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
}
