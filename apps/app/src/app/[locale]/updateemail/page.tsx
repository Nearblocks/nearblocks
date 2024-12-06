import { Metadata } from 'next';

import EmailUpdate from '@/components/app/EmailUpdate';
import { request } from '@/hooks/app/useAuth';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Update Email | NearBlocks';

  const metaDescription = 'Nearblocks Account Email Update';

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

export default async function UpdateEmail({ searchParams }: Props) {
  let status: number;
  let token: null | string = null;
  let role: null | string = null;
  let username: null | string = null;

  const { code, email } = await searchParams;

  try {
    const resp = await request.post(`/profile/update-email`, {
      code: code,
      email: email,
    });
    if (
      resp?.data?.meta?.token &&
      resp?.data?.data?.role &&
      resp?.data?.data?.username
    ) {
      token = resp?.data?.meta?.token;
      role = resp?.data?.data?.role[0].name;
      username = resp?.data?.data?.username;
    }
    status = resp?.status;
  } catch (error: any) {
    status = error?.response?.status;
  }

  return (
    <EmailUpdate
      authToken={token}
      authUsername={username}
      authUserRole={role}
      status={status}
    />
  );
}
