import Buttons from '@/components/app/Address/Button';
import Delegators from '@/components/app/NodeExplorer/Delegators';
import DelegatorSkeleton from '@/components/app/skeleton/node-explorer/Delegator';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { Suspense } from 'react';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params: { id },
}: {
  params: { id: string };
}): Promise<Metadata> {
  const metaTitle = `${network === 'testnet' ? 'TESTNET ' : ''}${
    id ? `${id}: ` : ''
  } delegators | NearBlocks`;
  const metaDescription = id
    ? `Node Validator ${id} (${id}) Delegators Listing`
    : '';

  const ogImageUrl = `${ogUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: metaTitle,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/node-explorer/${id}`,
    },
  };
}

export default async function Delegator({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <div className="container relative mx-auto p-3">
      <div className="md:flex justify-between">
        {!id ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <div className="md:flex-wrap">
            <div className="break-words py-4 px-2">
              <span className="py-5 text-xl text-gray-700 leading-8 dark:text-neargray-10 mr-1">
                <span className="whitespace-nowrap">Near Validator:&nbsp;</span>
                {id && (
                  <span className="text-center items-center">
                    <span className="text-green-500 dark:text-green-250">
                      @<span className="font-semibold">{id}</span>
                    </span>
                    <span className="ml-2">
                      <Buttons address={id} />
                    </span>
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
      <div>
        <Suspense fallback={<DelegatorSkeleton />}>
          <Delegators accountId={id} />
        </Suspense>
      </div>
    </div>
  );
}
