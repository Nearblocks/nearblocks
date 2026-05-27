'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { apiDocsUrl } from '@/lib/api-docs';

const STORAGE_KEY = 'nb-api-v1v2-deprecation-dismissed';

export const ApiDeprecationBanner = () => {
  const { t } = useLocale('layout');
  const network = useConfig((s) => s.config.network);
  // Start hidden to avoid a hydration mismatch / flash; reveal after we can
  // read the dismissed flag from localStorage on the client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore storage failures (private mode, disabled storage, etc.)
    }
    setVisible(false);
  };

  return (
    <div className="bg-muted text-muted-foreground border-border relative flex items-center justify-center border-b px-10 py-1.5 text-center">
      <p className="text-body-xs">
        {t('banner.apiDeprecation.message')}{' '}
        <a
          className="text-link underline underline-offset-2"
          href={apiDocsUrl(network)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('banner.apiDeprecation.link')}
        </a>
      </p>
      <button
        aria-label={t('banner.apiDeprecation.dismiss')}
        className="absolute right-2 inline-flex cursor-pointer p-0.5 opacity-60 transition-opacity hover:opacity-100"
        onClick={dismiss}
        type="button"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
};
