'use client';

import { Clock, Hourglass } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';
import { ageFormat, dateFormat, toMs } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  ns: null | string | undefined;
};

export const TimestampToggle = () => {
  const hasHydrated = useSettings((s) => s.hydrated);
  const timestampMode = useSettings((s) => s.timestampMode);
  const toggleTimestampMode = useSettings((s) => s.toggleTimestampMode);

  if (!hasHydrated) return <Skeleton className="w-10" />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="inline-flex cursor-pointer items-center gap-2 uppercase"
          onClick={toggleTimestampMode}
          type="button"
        >
          {timestampMode === 'age' ? (
            <>
              Age <Clock className="size-3.5" />
            </>
          ) : (
            <>
              Date Time (UTC) <Hourglass className="size-3" />
            </>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        Click to show {timestampMode === 'age' ? 'Date time' : 'Age'} format
      </TooltipContent>
    </Tooltip>
  );
};

export const TimestampCell = ({ ns }: Props) => {
  const hasHydrated = useSettings((s) => s.hydrated);
  const timestampMode = useSettings((s) => s.timestampMode);

  if (!ns) return null;
  if (!hasHydrated) return <Skeleton className="w-30" />;

  const ms = toMs(ns);

  return timestampMode === 'age'
    ? ageFormat(ms)
    : dateFormat(ms, 'YYYY-MM-DD HH:mm:ss');
};

export const LongDate = ({ ns }: Props) => {
  const hasHydrated = useSettings((s) => s.hydrated);
  const utcMode = useSettings((s) => s.utcMode);
  const toggleUTCMode = useSettings((s) => s.toggleUTCMode);

  if (!ns || !hasHydrated) return <Skeleton className="w-60" />;

  const ms = toMs(ns);
  const age = ageFormat(ms);
  const date = dateFormat(ms, 'MMM D, YYYY HH:mm:ss.SSS Z', utcMode === 'utc');

  return (
    <>
      {age}{' '}
      <Tooltip>
        <TooltipTrigger className="text-left" onClick={toggleUTCMode}>
          ({date})
        </TooltipTrigger>
        <TooltipContent>
          Click to show {utcMode === 'local' ? 'UTC' : 'Local'} time
        </TooltipContent>
      </Tooltip>
    </>
  );
};
