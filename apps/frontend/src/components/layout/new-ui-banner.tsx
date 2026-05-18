'use client';

import { ArrowUpRight, MessageSquareText } from 'lucide-react';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';

// The Formbricks SDK has no "show survey by id" API — surveys are
// fired by Action codes configured in the Formbricks dashboard.
// In the dashboard, create an Action with this code, then link it to
// survey id `cmpb5wrl8448lvv01fx5acdw0` (or whichever survey).
const FEEDBACK_ACTION = 'beta_feedback';

// TODO: remove these hardcoded fallbacks once the env vars are
// configured in deployment. They exist so the dev server works
// without touching .env locally.
const FALLBACK_LEGACY_URL_TESTNET = 'https://legacy-testnet.nearblocks.io';
const FALLBACK_LEGACY_URL_MAINNET = 'https://legacy.nearblocks.io';

export const NewUiBanner = () => {
  const { t } = useLocale('layout');
  const legacyUiUrl = useConfig((state) => state.config.legacyUiUrl);
  const network = useConfig((state) => state.config.network);
  const resolvedLegacyUrl =
    legacyUiUrl ??
    (network === 'mainnet'
      ? FALLBACK_LEGACY_URL_MAINNET
      : FALLBACK_LEGACY_URL_TESTNET);

  const onFeedback = async () => {
    if (typeof window !== 'undefined' && window.formbricks) {
      try {
        console.log('[formbricks] tracking action:', FEEDBACK_ACTION);
        await window.formbricks.track(FEEDBACK_ACTION);
        console.log('[formbricks] track complete');
        return;
      } catch (err) {
        console.warn('[formbricks] track failed', err);
      }
    } else {
      console.warn('[formbricks] window.formbricks not available');
    }
    window.location.href = '/contact?subject=7';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 fixed right-4 bottom-4 z-50 size-10 cursor-pointer rounded-full shadow-lg"
          size="icon"
          variant="default"
        >
          <MessageSquareText className="size-4" />
          <span className="sr-only">{t('banner.newUi.feedbackLink')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 p-2"
        side="top"
        sideOffset={8}
      >
        <p className="text-muted-foreground text-body-xs px-2 pt-1 pb-2">
          {t('banner.newUi.message')}
        </p>
        <button
          className="text-body-sm hover:bg-muted flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left"
          data-formbricks-feedback
          onClick={onFeedback}
          type="button"
        >
          <span>{t('banner.newUi.feedbackLink')}</span>
          <ArrowUpRight className="text-muted-foreground size-3.5" />
        </button>
        <a
          className="text-body-sm hover:bg-muted flex items-center justify-between rounded-md px-2 py-1.5"
          href={resolvedLegacyUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>{t('banner.newUi.legacyLink')}</span>
          <ArrowUpRight className="text-muted-foreground size-3.5" />
        </a>
      </PopoverContent>
    </Popover>
  );
};
