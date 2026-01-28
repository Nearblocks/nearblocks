'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { Copy } from './copy';

export type TruncateProps = {
  children?: React.ReactNode;
  className?: string;
};

export type TruncateTextProps = {
  className?: string;
  text: string;
  tooltipClassName?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export type TruncateCopyProps = {
  className?: string;
  hidden?: boolean;
  text: string;
};

export const Truncate = ({ children, className }: TruncateProps) => {
  return (
    <span className={cn('pointer-events-auto flex items-center', className)}>
      {children}
    </span>
  );
};

export const TruncateText = ({
  className,
  text,
  tooltipClassName,
  ...props
}: TruncateTextProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn('inline-block max-w-30 truncate', className)}
          {...props}
        >
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
