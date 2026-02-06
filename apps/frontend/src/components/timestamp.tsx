'use client';

import { LuClock, LuHourglass } from 'react-icons/lu';

import { ageFormat, dateFormat, toMs } from '@/lib/format';
import { usePreferences } from '@/stores/preferences';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  ns: null | string | undefined;
};

export const TimestampToggle = () => {
  const hasHydrated = usePreferences((s) => s.hasHydrated);
  const timestampMode = usePreferences((s) => s.timestampMode);
  const toggleTimestampMode = usePreferences((s) => s.toggleTimestampMode);

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
              Age <LuClock className="size-3.5" />
            </>
          ) : (
            <>
              Date Time (UTC) <LuHourglass className="size-3" />
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
  const hasHydrated = usePreferences((s) => s.hasHydrated);
  const timestampMode = usePreferences((s) => s.timestampMode);

  if (!ns) return null;
  if (!hasHydrated) return <Skeleton className="w-30" />;

  const ms = toMs(ns);

  return timestampMode === 'age'
    ? ageFormat(ms)
    : dateFormat(ms, 'YYYY-MM-DD HH:mm:ss');
};

export const LongDate = ({ ns }: Props) => {
  const hasHydrated = usePreferences((s) => s.hasHydrated);
  const utcMode = usePreferences((s) => s.utcMode);
  const toggleUTCMode = usePreferences((s) => s.toggleUTCMode);

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
