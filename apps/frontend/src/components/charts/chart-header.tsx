'use client';

import { RiQuestionLine } from '@remixicon/react';
import { ChartLine } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import { EmptyBox } from '@/components/empty';
import { useLocale } from '@/hooks/use-locale';
import { CardHeader } from '@/ui/card';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type HeaderProps = {
  description: string;
  logView: boolean;
  setLogView: Dispatch<SetStateAction<boolean>>;
};

// Rendered inside a fixed-height chart slot when stats resolve null/empty so
// an empty dataset shows a "no data" state instead of a bare Highcharts frame.
// Copy matches the (untranslated) `fts.analytics.noData` string; the charts
// dictionaries have no equivalent key.
export const ChartEmpty = () => {
  return (
    <div className="flex h-full">
      <EmptyBox description="No data available" icon={<ChartLine />} />
    </div>
  );
};

export const ChartHeader = ({
  description,
  logView,
  setLogView,
}: HeaderProps) => {
  const { t } = useLocale('charts');
  return (
    <CardHeader className="flex-wrap gap-2 border-b">
      <p className="text-body-sm text-muted-foreground">{description}</p>
      <span className="flex items-center gap-2 leading-6 whitespace-nowrap">
        <Switch
          checked={logView}
          id="log-switch"
          onCheckedChange={setLogView}
        />
        <Label className="text-body-xs" htmlFor="log-switch">
          {t('logView')}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <RiQuestionLine className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="px-2.5 py-1">
            {t('logViewTip')}
          </TooltipContent>
        </Tooltip>
      </span>
    </CardHeader>
  );
};
