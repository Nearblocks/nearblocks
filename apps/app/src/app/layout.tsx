import '@/styles/globals.css';
import '../../public/common.css';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Viewport } from 'next';

interface paramTypes {
  children: React.ReactNode;
  params: { locale: string };
}

export const viewport: Viewport = {
  initialScale: 0,
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
