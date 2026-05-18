'use client';

import { ArrowUpRight, MessageSquareText } from 'lucide-react';

import { Link } from '@/components/link';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';

export const NewUiBanner = () => {
  const { t } = useLocale('layout');
  const legacyUiUrl = useConfig((state) => state.config.legacyUiUrl);

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
        <Link
          className="text-body-sm hover:bg-muted flex items-center justify-between rounded-md px-2 py-1.5"
          href="/contact?subject=7"
        >
          <span>{t('banner.newUi.feedbackLink')}</span>
          <ArrowUpRight className="text-muted-foreground size-3.5" />
        </Link>
        {legacyUiUrl && (
          <a
            className="text-body-sm hover:bg-muted flex items-center justify-between rounded-md px-2 py-1.5"
            href={legacyUiUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>{t('banner.newUi.legacyLink')}</span>
            <ArrowUpRight className="text-muted-foreground size-3.5" />
          </a>
        )}
      </PopoverContent>
    </Popover>
  );
};
