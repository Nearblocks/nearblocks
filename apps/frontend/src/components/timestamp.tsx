'use client';

import { ChevronDown, Clock, Hourglass } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';
import { ageFormat, dateFormat, toMs } from '@/lib/format';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  ns: null | string | undefined;
};

type LongDateProps = {
  hideAge?: boolean;
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

export const LongDate = ({ hideAge = false, ns }: LongDateProps) => {
  const hasHydrated = useSettings((s) => s.hydrated);
  const utcMode = useSettings((s) => s.utcMode);
  const toggleUTCMode = useSettings((s) => s.toggleUTCMode);

  if (!ns || !hasHydrated) return <Skeleton className="w-60" />;

  const ms = toMs(ns);
  const date = dateFormat(ms, 'MMM D, YYYY HH:mm:ss.SSS Z', utcMode === 'utc');

  return (
    <span className="inline-flex items-center gap-2">
      <span>
        {!hideAge && `${ageFormat(ms)} `}
        {hideAge ? date : `(${date})`}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="xs" variant="outline">
            {utcMode === 'local' ? 'Local' : 'UTC'}
            <ChevronDown className="ml-0.5 size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => utcMode !== 'utc' && toggleUTCMode()}
          >
            UTC
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => utcMode !== 'local' && toggleUTCMode()}
          >
            Local
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
};
