'use client';

import { Inter } from 'next/font/google';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { getRuntimeConfig } from '@/lib/config';
import { defaultLocale, type Locale, supportedLocales } from '@/locales/config';
import { clientTranslator, getDictionary } from '@/locales/dictionaries';
import { ConfigProvider } from '@/providers/config';
import { LocaleProvider } from '@/providers/locale';
import { Theme } from '@/types/enums';
import type { BaseDictionary, DeepPartial, Translator } from '@/types/types';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

type Props = {
  children: (props: {
    t: Translator<BaseDictionary['layout']>;
  }) => React.ReactNode;
  head: React.ReactNode;
};

export const GlobalLayout = ({ children, head }: Props) => {
  const { lang } = useParams();
  const locale: Locale =
    typeof lang === 'string' && supportedLocales.includes(lang as Locale)
      ? (lang as Locale)
      : defaultLocale;

  const [dictionary, setDictionary] = useState<DeepPartial<BaseDictionary>>({});
  const [theme, setTheme] = useState<Theme>('light');
  const config = useMemo(() => getRuntimeConfig(theme), [theme]);
  const layoutDictionary = useMemo(
    () => (dictionary.layout ?? {}) as DeepPartial<BaseDictionary['layout']>,
    [dictionary],
  );
  const t = useMemo(
    () =>
      clientTranslator(locale, layoutDictionary) as Translator<
        BaseDictionary['layout']
      >,
    [locale, layoutDictionary],
  );

  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('theme='));

    setTheme((match?.split('=')[1] as Theme) ?? 'light');
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const dict = await getDictionary(locale, ['layout']);
        if (!cancelled) setDictionary(dict);
      } catch (e) {
        if (!cancelled) setDictionary({});
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <html
      className={theme === 'dark' ? 'dark' : ''}
      lang={locale}
      suppressHydrationWarning
    >
      {head}
      <body
        className={`bg-background text-foreground flex min-h-dvh flex-col font-sans ${inter.variable} overflow-x-hidden antialiased`}
      >
        <ConfigProvider value={config}>
          <LocaleProvider dictionary={dictionary} locale={locale}>
            <Header />
            {children({ t })}
            <Footer />
          </LocaleProvider>
        </ConfigProvider>
      </body>
    </html>
  );
};
