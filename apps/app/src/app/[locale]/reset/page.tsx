export const runtime = 'edge';

import { Metadata } from 'next';

import Reset from '@/components/app/Reset';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Password Reset | NearBlocks';

  const metaDescription = 'Password Reset on Nearblocks Account ';

  return {
    description: metaDescription,
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

interface Props {
  searchParams: Promise<{
    code?: string;
    email?: string;
  }>;
}

export default async function ResetPassword({ searchParams }: Props) {
  const { code, email } = await searchParams;
  return <Reset code={code} email={email} />;
}
