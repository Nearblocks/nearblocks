import { Metadata } from 'next';

import LostPassword from '@/components/app/LostPassword';
import { networkId } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = `Forgot Password | NearBlocks`;

  const metaDescription = 'Password Recovery in Nearblocks';

  return {
    description: metaDescription,
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default function ForgotPassword() {
  return <LostPassword />;
}
