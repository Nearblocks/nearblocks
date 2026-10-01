'use client';

import { RiCloseLine } from '@remixicon/react';
import { useMemo, useState } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { buildMethodDoc, generateSampleArgs, MethodDoc } from '@/lib/contract';
import { ContractAbiSchema } from '@/types/types';
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
  args?: string;
  doc?: MethodDoc;
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
      const definitions = schema.body.root_schema?.definitions;
      return schema.body.functions
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((func) => ({
          args: generateSampleArgs(func, definitions),
          doc: buildMethodDoc(func),
          kind: func.kind,
          name: func.name,
        }));
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
        <div className="overflow-hidden rounded-lg border border-border">
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
        <span className="text-body-xs text-muted-foreground">
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
        <p className="py-6 text-center text-body-sm text-muted-foreground">
          {t('contract.methods.methodEmpty')}
        </p>
      )}

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.value ?? 'all'}>
            {group.value && (
              <h3 className="mb-2 ml-1 text-body-xs font-medium text-muted-foreground">
                {group.value}
              </h3>
            )}
            <Accordion
              className="overflow-hidden rounded-lg border border-border"
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
                  <AccordionTrigger className="h-10 items-center rounded-none px-3 py-0 hover:bg-muted/50 hover:no-underline data-[state=open]:bg-muted/50 [&>svg]:translate-y-0">
                    <span className="min-w-0 truncate font-mono">
                      {entry.name}
                    </span>
                    {entry.kind !== 'unknown' && (
                      <Badge
                        className="ml-auto"
                        variant={entry.kind === 'view' ? 'teal' : 'amber'}
                      >
                        {entry.kind}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border px-3 pt-3">
                    <MethodPanel
                      args={entry.args}
                      doc={entry.doc}
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
