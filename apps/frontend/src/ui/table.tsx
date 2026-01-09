'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/ui/scroll-area';

const Table = ({ className, ...props }: React.ComponentProps<'table'>) => {
  return (
    <div className="relative w-full" data-slot="table-container">
      <ScrollArea className="w-full">
        <table
          className={cn('text-body-sm w-full caption-bottom', className)}
          data-slot="table"
          {...props}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

const TableHeader = ({
  className,
  ...props
}: React.ComponentProps<'thead'>) => {
  return (
    <thead
      className={cn('bg-muted [&_tr]:border-b', className)}
      data-slot="table-header"
      {...props}
    />
  );
};

const TableBody = ({ className, ...props }: React.ComponentProps<'tbody'>) => {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0', className)}
      data-slot="table-body"
      {...props}
    />
  );
};

const TableFooter = ({
  className,
  ...props
}: React.ComponentProps<'tfoot'>) => {
  return (
    <tfoot
      className={cn('bg-muted/50 border-t [&>tr]:last:border-b-0', className)}
      data-slot="table-footer"
      {...props}
    />
  );
};

const TableRow = ({ className, ...props }: React.ComponentProps<'tr'>) => {
  return (
    <tr
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  );
};

const TableHead = ({ className, ...props }: React.ComponentProps<'th'>) => {
  return (
    <th
      className={cn(
        'text-foreground text-headline-xs h-12 px-4 py-2 text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  );
};

const TableCell = ({ className, ...props }: React.ComponentProps<'td'>) => {
  return (
    <td
      className={cn(
        'px-4 py-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
        className,
      )}
      data-slot="table-cell"
      {...props}
    />
  );
};

const TableCaption = ({
  className,
  ...props
}: React.ComponentProps<'caption'>) => {
  return (
    <caption
      className={cn('text-muted-foreground text-body-sm mt-4', className)}
      data-slot="table-caption"
      {...props}
    />
  );
};

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
