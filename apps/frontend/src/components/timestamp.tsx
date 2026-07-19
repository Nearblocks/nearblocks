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

// Timestamp display modes are client preferences (persisted store), but
// waiting for store hydration meant a skeleton flash and table column
// reflow on every document load. Instead, render the store defaults
// ('age' / 'utc') — identical on the server and the pre-hydration client
// render, so hydration is clean — and only users who changed a preference
// get a post-hydration swap.
export const TimestampToggle = () => {
  const hasHydrated = useSettings((s) => s.hydrated);
  const timestampMode = useSettings((s) => s.timestampMode);
  const toggleTimestampMode = useSettings((s) => s.toggleTimestampMode);

  const mode = hasHydrated ? timestampMode : 'age';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="inline-flex cursor-pointer items-center gap-2 uppercase"
          onClick={toggleTimestampMode}
          type="button"
        >
          {mode === 'age' ? (
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
        Click to show {mode === 'age' ? 'Date time' : 'Age'} format
      </TooltipContent>
    </Tooltip>
  );
};

export const TimestampCell = ({ ns }: Props) => {
  const hasHydrated = useSettings((s) => s.hydrated);
  const timestampMode = useSettings((s) => s.timestampMode);

  if (!ns) return null;

  const mode = hasHydrated ? timestampMode : 'age';
  const ms = toMs(ns);

  // suppressHydrationWarning: the age string can drift between the server
  // render and hydration (e.g. "a few seconds ago" → "a minute ago").
  return (
    <span suppressHydrationWarning>
      {mode === 'age' ? ageFormat(ms) : dateFormat(ms, 'YYYY-MM-DD HH:mm:ss')}
    </span>
  );
};

export const LongDate = ({ hideAge = false, ns }: LongDateProps) => {
  const hasHydrated = useSettings((s) => s.hydrated);
  const utcMode = useSettings((s) => s.utcMode);
  const toggleUTCMode = useSettings((s) => s.toggleUTCMode);

  if (!ns)
    return (
      <span className="flex h-7 items-center">
        <Skeleton className="w-60" />
      </span>
    );

  const mode = hasHydrated ? utcMode : 'utc';
  const ms = toMs(ns);
  const date = dateFormat(ms, 'MMM D, YYYY HH:mm:ss Z', mode === 'utc');

  return (
    <span>
      <span suppressHydrationWarning>
        {!hideAge && `${ageFormat(ms)} `}
        {hideAge ? date : `(${date})`}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="ml-1 inline-flex align-middle"
            size="xs"
            variant="outline"
          >
            {mode === 'local' ? 'Local' : 'UTC'}
            <ChevronDown className="ml-0.5 size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => mode !== 'utc' && toggleUTCMode()}>
            UTC
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => mode !== 'local' && toggleUTCMode()}>
            Local
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
};
