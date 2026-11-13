'use client';

import { Menu } from 'lucide-react';

import { useLocale } from '@/hooks/use-locale';
import { Dayjs } from '@/lib/dayjs';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

import type { ExportAction } from './time-series-export';

export type RangeKey = (typeof RANGES)[number]['key'];

type Props = {
  /** Where the menu renders; must be inside the element shown full screen. */
  container: HTMLElement | null;
  fullscreen: boolean;
  onExport: (action: ExportAction) => void;
  onRange: (key: RangeKey) => void;
  range: null | RangeKey;
};

// The Highcharts Stock default buttons; labels stay untranslated like theirs.
export const RANGES = [
  { key: '1m', label: '1M', months: 1 },
  { key: '3m', label: '3M', months: 3 },
  { key: '6m', label: '6M', months: 6 },
  { key: 'ytd', label: 'YTD', months: 0 },
  { key: '1y', label: '1Y', months: 12 },
  { key: 'all', label: 'ALL', months: 0 },
] as const;

/** Start of the window a range button selects, ending at `last`. */
export const rangeStart = (key: RangeKey, first: number, last: number) => {
  if (key === 'all') return first;
  const end = Dayjs.utc(last);
  const start =
    key === 'ytd'
      ? end.startOf('year')
      : end.subtract(RANGES.find((r) => r.key === key)?.months ?? 0, 'month');
  return Math.max(first, start.valueOf());
};

export const TimeSeriesControls = ({
  container,
  fullscreen,
  onExport,
  onRange,
  range,
}: Props) => {
  const { t } = useLocale('charts');

  return (
    <div className="flex justify-end gap-2">
      {RANGES.map(({ key, label }) => (
        <button
          aria-pressed={range === key}
          className="h-7 w-8 cursor-pointer rounded-lg bg-secondary text-headline-xs text-foreground aria-pressed:bg-accent aria-pressed:font-bold"
          key={key}
          onClick={() => onRange(key)}
          type="button"
        >
          {label}
        </button>
      ))}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={t('export.menu')}
            className="text-muted-foreground"
            size="icon-xs"
            variant="ghost"
          >
            <Menu className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          container={fullscreen ? container : undefined}
        >
          <DropdownMenuItem onSelect={() => onExport('fullscreen')}>
            {fullscreen ? t('export.exitFullscreen') : t('export.fullscreen')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExport('print')}>
            {t('export.print')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onExport('png')}>
            {t('export.png')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExport('jpeg')}>
            {t('export.jpeg')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExport('svg')}>
            {t('export.svg')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
