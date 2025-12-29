import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import { Layout } from '@/components/layout';
import { getRuntimeConfig } from '@/lib/config';
import type { Locale } from '@/locales/config';
import { getDictionary } from '@/locales/dictionaries';
import { ConfigProvider } from '@/providers/config';
import { LocaleProvider } from '@/providers/locale';
import type { LayoutProps } from '@/types/types';

import '../globals.css';

type Props = LayoutProps<{ lang: string }>;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  description:
    'NEAR Blocks is the leading blockchain explorer dedicated to the NEAR ecosystem. Powered by NEAR Protocol.',
  title: 'Near Protocol Explorer | NearBlocks',
};

const RootLayout = async ({ children, params }: Props) => {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'light';
  const config = getRuntimeConfig(theme);
  const { lang } = await params;
  const locale = lang as Locale;

  const dictionary = await getDictionary(locale, ['layout']);

  return (
    <html
      className={theme === 'dark' ? 'dark highcharts-dark' : 'highcharts-light'}
      lang={locale}
      suppressHydrationWarning
    >
      <body
        className={`bg-background text-foreground font-sans ${inter.variable} overflow-x-hidden antialiased`}
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
