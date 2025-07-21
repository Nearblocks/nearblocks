import { Metadata } from 'next';

import Reset from '@/components/app/Reset';
import { networkId } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Password Reset | NearBlocks';

  const metaDescription = 'Password Reset on Nearblocks Account ';

  return {
    description: metaDescription,
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
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
