import { Metadata } from 'next';
import ConfirmEmailClient from '@/components/app/ConfirmEmail';
import { request } from '@/hooks/app/useAuth';
import { userAuthURL } from '@/utils/app/config';

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

type Props = {
  searchParams: Promise<{
    code?: string;
    email?: string;
  }>;
};

export default async function ConfirmMail({ searchParams }: Props) {
  const { code, email } = await searchParams;

  let status: number;
  let token: undefined | string = undefined;

  try {
    const res = await request(userAuthURL).post('/verify', {
      email: email,
      code: code,
    });

    const respToken = res?.data?.token;
    token = respToken;
    status = res?.status;
  } catch (error: any) {
    status = error?.response?.status ?? null;
  }

  return <ConfirmEmailClient authToken={token} status={status} />;
}
