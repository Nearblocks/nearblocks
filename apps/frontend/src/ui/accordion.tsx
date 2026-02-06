'use client';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import * as React from 'react';
import { LuChevronDown } from 'react-icons/lu';

import { cn } from '@/lib/utils';

const Accordion = ({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) => {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
};

const AccordionItem = ({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) => {
  return (
    <AccordionPrimitive.Item
      className={cn('rounded border', className)}
      data-slot="accordion-item"
      {...props}
    />
  );
};

const AccordionTrigger = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 text-body-sm flex flex-1 items-start justify-between gap-4 rounded-md px-3 py-2 text-left transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className,
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <LuChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
};

const AccordionContent = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) => {
  return (
    <AccordionPrimitive.Content
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down text-body-sm overflow-hidden"
      data-slot="accordion-content"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
};

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
