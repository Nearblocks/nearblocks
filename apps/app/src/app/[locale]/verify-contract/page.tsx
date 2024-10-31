import Verifier from '@/components/app/Address/Contract/Verifier';
import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';

const network = process.env.NEXT_PUBLIC_NETWORK_ID || 'testnet';

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = `${
    network === 'testnet' ? 'TESTNET ' : ''
  }Verify Contract | Nearblocks`;
  const metaDescription = 'Verify a smart contract on the blockchain.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
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
      canonical: `${appUrl}/verify-contract`,
    },
  };
}

export default async function VerifyContract({
  searchParams: { accountId, selectedVerifier },
}: {
  searchParams: { accountId: string; selectedVerifier: string };
}) {
  return (
    <>
      <div className="h-80"></div>
      <div className="container mx-auto px-3 md:px-14 flex flex-col items-center mt-[-300px]">
        <div className="md:flex items-center justify-center container mx-auto px-3">
          <h1 className="text-xl text-nearblue-600 dark:text-neargray-10 px-2 pt-5 pb-2 w-full text-center">
            Verify & Publish Contract Source Code
          </h1>
        </div>
        <div className="w-full max-w-3xl items-center mt-8 space-y-6">
          <Verifier
            accountId={accountId}
            selectedVerifier={selectedVerifier}
            network={network}
          />
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
