'use client';

import { useMemo } from 'react';
import { LuClock, LuHourglass } from 'react-icons/lu';

import { TimeAgo } from '@/components/time-ago';
import { dayjs } from '@/lib/dayjs';
import { toMs } from '@/lib/format';
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

  return (
    <>
      {hasHydrated ? (
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
      ) : (
        <Skeleton className="w-10" />
      )}
    </>
  );
};

export const TimestampCell = ({ ns }: Props) => {
  const hasHydrated = usePreferences((s) => s.hasHydrated);
  const timestampMode = usePreferences((s) => s.timestampMode);

  const content = useMemo(() => {
    if (!hasHydrated) {
      return <Skeleton className="w-30" />;
    }
    if (!ns) return null;

    if (timestampMode === 'age') {
      return <TimeAgo ns={ns} />;
    }

    const ms = toMs(ns);

    return dayjs(ms).utc().format('YYYY-MM-DD HH:mm:ss');
  }, [hasHydrated, ns, timestampMode]);

  return content;
};
