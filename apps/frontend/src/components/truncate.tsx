'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { Copy } from './copy';

export type TruncateProps = {
  /** Optional composition: <TruncateText />, <TruncateCopy />, etc. */
  children?: React.ReactNode;
  /** Wrapper className (applies to the outer container). */
  className?: string;
};

export const Truncate = ({ children, className }: TruncateProps) => {
  return (
    <span className={cn('pointer-events-auto flex items-center', className)}>
      {children}
    </span>
  );
};

export type TruncateTextProps = {
  className?: string;
  text: string;
  /** ClassName for tooltip content container. */
  tooltipClassName?: string;
};

export const TruncateText = ({
  className,
  text,
  tooltipClassName,
}: TruncateTextProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-block max-w-30 truncate', className)}>
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent
        className={cn('max-w-50 wrap-break-word', tooltipClassName)}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

export type TruncateCopyProps = {
  className?: string;
  /** Hide this copy button (useful when rendering conditionally). */
  hidden?: boolean;
  text: string;
};

export const TruncateCopy = ({
  className,
  hidden,
  text,
}: TruncateCopyProps) => {
  if (hidden) return null;

  return (
    <Copy className={cn('text-muted-foreground', className)} text={text} />
  );
};
