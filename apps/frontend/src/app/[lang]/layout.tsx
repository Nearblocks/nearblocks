import type { Metadata } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import { Layout } from '@/components/layout';
import { getRuntimeConfig } from '@/lib/config';
import type { Locale } from '@/locales/config';
import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { ConfigProvider } from '@/providers/config';
import { LocaleProvider } from '@/providers/locale';
import { Theme } from '@/types/enums';

import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const geist = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const metadata: Metadata = {
  description:
    'NEAR Blocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: { sizes: 'any', type: 'image/svg+xml', url: '/icon.svg' },
    shortcut: { sizes: '32x32', url: '/favicon.ico' },
  },
  manifest: '/manifest.webmanifest',
  title: 'Near Protocol Explorer | NearBlocks',
};

const RootLayout = async ({ children, params }: LayoutProps<'/[lang]'>) => {
  const [{ lang }, cookieStore] = await Promise.all([params, cookies()]);
  const locale = hasLocale(lang) ? (lang as Locale) : 'en';
  const dictionary = await getDictionary(locale, ['layout']);
  const theme = cookieStore.get('theme')?.value ?? 'light';
  const config = getRuntimeConfig(theme as Theme);

  return (
    <html
      className={theme === 'dark' ? 'dark highcharts-dark' : 'highcharts-light'}
      lang={locale}
      suppressHydrationWarning
    >
      <body
        className={`bg-background text-foreground flex min-h-dvh flex-col font-sans ${inter.variable} ${geist.variable} overflow-x-hidden wrap-anywhere antialiased`}
      >
        <ConfigProvider value={config}>
          <LocaleProvider dictionary={dictionary} locale={locale}>
            <Layout>{children}</Layout>
          </LocaleProvider>
        </ConfigProvider>
      </body>
    </html>
  );
};

export default RootLayout;
