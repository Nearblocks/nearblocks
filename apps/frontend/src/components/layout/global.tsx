'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { roboto } from '@/fonts';
import { defaultTheme, getRuntimeConfig } from '@/lib/config';
import { defaultLocale, type Locale, supportedLocales } from '@/locales/config';
import { clientTranslator, getDictionary } from '@/locales/dictionaries';
import { ConfigProvider } from '@/providers/config';
import { LocaleProvider } from '@/providers/locale';
import { Theme } from '@/types/enums';
import type { BaseDictionary, DeepPartial, Translator } from '@/types/types';

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
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const config = useMemo(() => getRuntimeConfig(), []);
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

    setTheme((match?.split('=')[1] as Theme) ?? defaultTheme);
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
        className={`flex min-h-dvh flex-col bg-background font-sans text-foreground ${roboto.variable} overflow-x-clip`}
      >
        <ConfigProvider config={config}>
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
