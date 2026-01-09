'use client';

import { merge } from 'es-toolkit/object';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { Locale } from '@/locales/config';
import { clientTranslator } from '@/locales/dictionaries';
import type { BaseDictionary } from '@/types/types';
import type { DeepPartial, Dictionary, Translator } from '@/types/types';

type Props = {
  children: ReactNode;
  dictionary: DeepPartial<BaseDictionary>;
  locale: Locale;
};

type ContextValue = {
  locale: Locale;
  t: Translator<Dictionary>;
};

export const LocaleContext = createContext<ContextValue | null>(null);

export const DictionaryContext = createContext<BaseDictionary | null>(null);

export const LocaleProvider = ({ children, dictionary, locale }: Props) => {
  const parentDictionary = useContext(DictionaryContext);

  const mergedDictionary = useMemo(() => {
    if (parentDictionary) {
      return merge(parentDictionary, dictionary) as BaseDictionary;
    }

    return dictionary as BaseDictionary;
  }, [parentDictionary, dictionary]);

  const t = useMemo(
    () => clientTranslator(locale, mergedDictionary) as Translator<Dictionary>,
    [locale, mergedDictionary],
  );

  return (
    <DictionaryContext.Provider value={mergedDictionary}>
      <LocaleContext.Provider value={{ locale, t }}>
        {children}
      </LocaleContext.Provider>
    </DictionaryContext.Provider>
  );
};
