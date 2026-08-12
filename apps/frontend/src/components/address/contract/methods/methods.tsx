'use client';

import { RiCloseLine } from '@remixicon/react';
import { useMemo, useState } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { ContractAbiSchema, ContractSchemaFunction } from '@/types/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/accordion';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/ui/input-group';
import { Skeleton } from '@/ui/skeleton';

import { Info } from './info';
import { MethodPanel } from './panel';

export type Props = {
  loading?: boolean;
  methods?: string[];
  schema?: ContractAbiSchema;
};

type Entry = {
  func?: ContractSchemaFunction;
  kind: 'call' | 'unknown' | 'view';
  name: string;
};

export const MethodsForm = ({
  loading = false,
  methods = [],
  schema,
}: Props) => {
  const { t } = useLocale('address');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string[]>([]);

  const hasSchema = !!schema;

  const entries = useMemo<Entry[]>(() => {
    if (schema) {
      return schema.body.functions
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((func) => ({ func, kind: func.kind, name: func.name }));
    }

    return methods
      .toSorted((a, b) => a.localeCompare(b))
      .map((name) => ({ kind: 'unknown' as const, name }));
  }, [methods, schema]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => entry.name.toLowerCase().includes(q));
  }, [entries, query]);

  const groups = useMemo(() => {
    if (!hasSchema) {
      return [{ items: filtered, value: null }];
    }

    const viewItems = filtered.filter((entry) => entry.kind === 'view');
    const callItems = filtered.filter((entry) => entry.kind === 'call');

    const result: { items: Entry[]; value: null | string }[] = [];
    if (viewItems.length > 0) {
      result.push({
        items: viewItems,
        value: t('contract.methods.viewMethods'),
      });
    }
    if (callItems.length > 0) {
      result.push({
        items: callItems,
        value: t('contract.methods.callMethods'),
      });
    }
    return result;
  }, [filtered, hasSchema, t]);

  if (loading) {
    return (
      <>
        <Info hasSchema={false} loading />
        <div className="border-border overflow-hidden rounded-lg border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              className="flex h-10 items-center border-b px-3 last:border-b-0"
              key={i}
            >
              <Skeleton className="w-full" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Info hasSchema={hasSchema} loading={false} />
      <div className="mb-3 flex items-center gap-3">
        <InputGroup className="max-w-xs">
          <InputGroupInput
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('contract.methods.methodSearch')}
            value={query}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={t('contract.methods.clearSearch')}
                className="rounded-md"
                onClick={() => setQuery('')}
                size="icon-xs"
              >
                <RiCloseLine className="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <span className="text-muted-foreground text-body-xs">
          {t('contract.methods.methodCount', { count: entries.length })}
        </span>
        {open.length > 0 && (
          <Button
            className="ml-auto"
            onClick={() => setOpen([])}
            size="sm"
            type="button"
            variant="outline"
          >
            {t('contract.methods.collapseAll')}
          </Button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-body-sm py-6 text-center">
          {t('contract.methods.methodEmpty')}
        </p>
      )}

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.value ?? 'all'}>
            {group.value && (
              <h3 className="text-muted-foreground text-body-xs mb-2 ml-1 font-medium">
                {group.value}
              </h3>
            )}
            <Accordion
              className="border-border overflow-hidden rounded-lg border"
              onValueChange={setOpen}
              type="multiple"
              value={open}
            >
              {group.items.map((entry) => (
                <AccordionItem
                  className="rounded-none border-0 border-b last:border-b-0"
                  key={entry.name}
                  value={entry.name}
                >
                  <AccordionTrigger className="hover:bg-muted/50 data-[state=open]:bg-muted/50 h-10 items-center rounded-none px-3 py-0 hover:no-underline [&>svg]:translate-y-0">
                    <span className="font-mono">{entry.name}</span>
                    {entry.kind !== 'unknown' && (
                      <Badge
                        className="ml-auto"
                        variant={entry.kind === 'view' ? 'teal' : 'amber'}
                      >
                        {entry.kind}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="border-border border-t px-3 pt-3">
                    <MethodPanel
                      func={entry.func}
                      hasSchema={hasSchema}
                      kind={entry.kind}
                      name={entry.name}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </>
  );
};
