import { Viewport } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

import '@/styles/globals.css';

import '../../public/common.css';

interface paramTypes {
  children: React.ReactNode;
  params: { locale: string };
}

export const viewport: Viewport = {
  userScalable: false,
  width: 'device-width',
};

export default async function RootLayout({
  children,
  params: { locale },
}: paramTypes) {
  unstable_setRequestLocale(locale);

  return [children];
}

export const revalidate = 5;

export const dynamic = 'force-dynamic';
