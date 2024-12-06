import { Metadata } from 'next';
import { headers } from 'next/headers';

import Verifier from '@/components/app/Address/Contract/Verifier';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID || 'testnet';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = `${
    network === 'testnet' ? 'TESTNET ' : ''
  }Verify Contract | Nearblocks`;
  const metaDescription = 'Verify a smart contract on the blockchain.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/verify-contract`,
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

export default async function VerifyContract(props: {
  searchParams: Promise<{ accountId: string; selectedVerifier: string }>;
}) {
  const searchParams = await props.searchParams;

  const { accountId, selectedVerifier } = searchParams;

  return (
    <>
      <div className="h-80"></div>
      <div className="container-xxl mx-auto px-5 md:px-14 flex flex-col items-center mt-[-300px]">
        <div className="md:flex items-center justify-center container-xxl mx-auto px-5">
          <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 pt-5 pb-2 w-full text-center">
            Verify & Publish Contract Source Code
          </h1>
        </div>
        <div className="w-full max-w-3xl items-center mt-8 space-y-6">
          <Verifier
            accountId={accountId}
            network={network}
            selectedVerifier={selectedVerifier}
          />
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
