export const runtime = 'edge';

import { Metadata } from 'next';

import LostPassword from '@/components/app/LostPassword';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = `Forgot Password | NearBlocks`;

  const metaDescription = 'Password Recovery in Nearblocks';

  return {
    description: metaDescription,
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default function ForgotPassword() {
  return <LostPassword />;
}
