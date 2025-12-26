'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type { Locale } from '@/locales/config';
import { clientTranslator } from '@/locales/translator';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deepMerge = (target: any, source: any): any => {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return target;

  const result = { ...target };
  Object.keys(source).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        target[key] &&
        typeof target[key] === 'object'
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  });

  return result;
};

// Context to store the raw dictionary object for nesting
const DictionaryContext = createContext<BaseDictionary | null>(null);

export const LocaleProvider = ({ children, dictionary, locale }: Props) => {
  const parentDictionary = useContext(DictionaryContext);

  const mergedDictionary = useMemo(() => {
    if (parentDictionary) {
      return deepMerge(parentDictionary, dictionary) as BaseDictionary;
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
