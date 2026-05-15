'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Link } from '@/components/link';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Alert, AlertDescription } from '@/ui/alert';
import { Button } from '@/ui/button';

const BANNER_DISMISSED_KEY = 'new-ui-banner-dismissed';

export const NewUiBanner = () => {
  const { t } = useLocale('layout');
  const legacyUiUrl = useConfig((state) => state.config.legacyUiUrl);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!legacyUiUrl) {
      setDismissed(true);
      return;
    }

    setDismissed(localStorage.getItem(BANNER_DISMISSED_KEY) === '1');
  }, [legacyUiUrl]);

  if (!legacyUiUrl || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <Alert className="bg-teal-background border-0 py-2 pr-2 pl-3">
      <AlertDescription className="text-teal-foreground flex items-center justify-between gap-2">
        <div className="flex grow flex-wrap items-center justify-center gap-x-1 gap-y-1">
          <span className="text-center">{t('banner.newUi.message')}</span>
          <Link
            className="font-medium underline underline-offset-2"
            href={legacyUiUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('banner.newUi.legacyLink')}
          </Link>
          <span>·</span>
          <Link
            className="font-medium underline underline-offset-2"
            href="/contact?subject=7"
          >
            {t('banner.newUi.feedbackLink')}
          </Link>
        </div>
        <Button
          aria-label={t('banner.newUi.dismiss')}
          className="text-teal-foreground"
          onClick={handleDismiss}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <X />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
