import type { Metadata } from 'next';
import { Geist_Mono, Roboto } from 'next/font/google';
import { cookies } from 'next/headers';

import { Layout } from '@/components/layout';
import { defaultTheme, getRuntimeConfig } from '@/lib/config';
import type { Locale } from '@/locales/config';
import { getDictionary, hasLocale, translator } from '@/locales/dictionaries';
import { ConfigProvider } from '@/providers/config';
import { LocaleProvider } from '@/providers/locale';
import { Toaster } from '@/ui/sonner';

import '../globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '700'],
});

const geist = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist',
});

export const generateMetadata = async ({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> => {
  const [{ lang }, config] = await Promise.all([params, getRuntimeConfig()]);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'layout');

  return {
    alternates: {
      canonical: '/',
    },
    description: t('meta.description'),
    icons: {
      apple: '/apple-touch-icon.png',
      icon: [
        { type: 'image/svg+xml', url: '/icon.svg' },
        { sizes: '32x32', url: '/favicon.ico' },
      ],
    },
    manifest: '/manifest.webmanifest',
    metadataBase: new URL(config.siteUrl),
    title: {
      default:
        config.network === 'testnet'
          ? `TESTNET | ${t('meta.title')}`
          : t('meta.title'),
      template: config.metaTemplate,
    },
  };
};

const RootLayout = async ({ children, params }: LayoutProps<'/[lang]'>) => {
  const [{ lang }, cookieStore] = await Promise.all([params, cookies()]);
  const locale = hasLocale(lang) ? (lang as Locale) : 'en';
  const dictionary = await getDictionary(locale, ['layout']);
  const theme = cookieStore.get('theme')?.value ?? defaultTheme;
  const config = getRuntimeConfig();

  return (
    <html
      className={`${
        theme === 'dark' ? 'dark highcharts-dark' : 'highcharts-light'
      } scroll-smooth`}
      lang={locale}
      suppressHydrationWarning
    >
      <body
        className={`bg-background text-foreground flex min-h-dvh flex-col font-sans ${roboto.variable} ${geist.variable} overflow-x-hidden wrap-anywhere`}
      >
        <ConfigProvider config={config}>
          <LocaleProvider dictionary={dictionary} locale={locale}>
            <Layout>{children}</Layout>
          </LocaleProvider>
          <Toaster />
        </ConfigProvider>
      </body>
    </html>
  );
};

export default RootLayout;
