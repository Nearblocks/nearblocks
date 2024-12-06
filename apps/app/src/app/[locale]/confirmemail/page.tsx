import { Metadata } from 'next';

import ConfirmEmailClient from '@/components/app/ConfirmEmail';
import { request } from '@/hooks/app/useAuth';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Confirmation Email | NearBlocks';

  const metaDescription =
    'Confirmation email from Nearblocks to verify your account.';

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

export default async function ConfirmMail({ searchParams }: Props) {
  let status: number;
  let token: null | string = null;
  let role: null | string = null;
  let username: null | string = null;
  const { code, email } = await searchParams;
  try {
    const res = await request.post(`/verify`, { code, email });
    if (
      res?.data?.meta?.token &&
      res?.data?.data?.role &&
      res?.data?.data?.username
    ) {
      token = res?.data?.meta?.token;
      role = res?.data?.data?.role[0]?.name || null;
      username = res?.data?.data?.username;
    }
    status = res?.status;
  } catch (error: any) {
    status = error?.response?.status ?? null;
  }

  return (
    <ConfirmEmailClient
      authToken={token}
      authUsername={username}
      authUserRole={role}
      status={status}
    />
  );
}
