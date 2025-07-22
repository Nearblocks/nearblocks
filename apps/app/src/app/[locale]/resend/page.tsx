import { Metadata } from 'next';

import Resend from '@/components/app/Resend';
import { networkId } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Resend Email | NearBlocks';

  const metaDescription =
    'Resend verification email for your Nearblocks account.';
  return {
    description: metaDescription,
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

interface Props {
  searchParams: Promise<{
    type?: string;
  }>;
}

export default async function ResendEmail({ searchParams }: Props) {
  const { type } = await searchParams;
  return <Resend type={type} />;
}
