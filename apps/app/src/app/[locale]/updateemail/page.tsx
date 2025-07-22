import { Metadata } from 'next';

import EmailUpdate from '@/components/app/EmailUpdate';
import { request } from '@/hooks/app/useAuth';
import { networkId, userAuthURL } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Update Email | NearBlocks';

  const metaDescription = 'Nearblocks Account Email Update';

  return {
    description: metaDescription,
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

type Props = {
  searchParams: Promise<{
    code?: string;
    email?: string;
  }>;
};

export default async function UpdateEmail({ searchParams }: Props) {
  const { code, email } = await searchParams;

  let status: number;
  let token: undefined | string = undefined;
  try {
    const resp = await request(userAuthURL).patch(`users/me/email`, {
      code: code,
      email: email,
    });
    const respToken = resp?.data?.token;
    token = respToken;
    status = resp?.status;
  } catch (error: any) {
    status = error?.response?.status;
  }

  return <EmailUpdate authToken={token} status={status} />;
}
