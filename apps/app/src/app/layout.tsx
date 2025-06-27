import { Viewport } from 'next';

import '@/styles/globals.css';

import '../../public/common.css';

interface paramTypes {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  userScalable: false,
};

export default async function RootLayout(props: paramTypes) {
  const { children } = props;

  return [children];
}

export const dynamic = 'force-dynamic';
