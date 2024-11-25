export const runtime = 'edge';

import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile';
import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import Login from '@/components/app/Login';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = `Login | NearBlocks`;

  const metaDescription = 'Login to NearBlocks Account.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/login`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [
        {
          alt: metaTitle,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: metaTitle,
    },
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

interface Props {
  searchParams: Promise<{
    id?: string;
    interval?: string;
  }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const token = (await cookies()).get('token')?.value;
  const role = (await cookies()).get('role')?.value;
  const user = (await cookies()).get('user')?.value;
  const { id, interval } = await searchParams;

  if (token && role && user && (!id || !interval)) {
    redirect('/user/overview');
  }
  const turnstileSiteAuth = async (tokens: string) => {
    'use server';
    const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
    const TURNSTILE_VERIFY_URL =
      'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    if (!TURNSTILE_SECRET_KEY || !tokens) {
      console.error('Turnstile secret key or captcha token is missing');
      return null;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', TURNSTILE_SECRET_KEY);
      formData.append('response', tokens);

      const verificationResponse = await fetch(TURNSTILE_VERIFY_URL, {
        body: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });
      const data =
        (await verificationResponse.json()) as TurnstileServerValidationResponse;
      if (data.success) {
        console.error(data);
      }
      return true;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  return (
    <Login id={id} interval={interval} turnstileSiteAuth={turnstileSiteAuth} />
  );
}
