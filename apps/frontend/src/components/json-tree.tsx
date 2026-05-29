'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Copy } from '@/components/copy';

type Json =
  | { [k: string]: Json }
  | boolean
  | Json[]
  | null
  | number
  | string
  | undefined;

const isObject = (v: unknown): v is Record<string, Json> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const Punct = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[var(--prism-punctuation)]">{children}</span>
);

const Primitive = ({ value }: { value: Json }) => {
  if (value === null)
    return <span className="text-[var(--prism-keyword)]">null</span>;
  if (typeof value === 'boolean')
    return <span className="text-[var(--prism-keyword)]">{String(value)}</span>;
  if (typeof value === 'number')
    return <span className="text-[var(--prism-number)]">{value}</span>;
  if (typeof value === 'string')
    return (
      <span className="break-all text-[var(--prism-string)]">
        &quot;{value}&quot;
      </span>
    );
  return null;
};

const MAX_DEPTH = 50;

type NodeProps = {
  depth?: number;
  isLast?: boolean;
  name?: string;
  value: Json;
};

const Node = ({ depth = 0, isLast = true, name, value }: NodeProps) => {
  const [open, setOpen] = useState(true);
  const isArr = Array.isArray(value);
  const isObj = isObject(value);
  const collapsible = isArr || isObj;

  const label = name !== undefined && (
    <>
      <span className="text-[var(--prism-attribute)]">&quot;{name}&quot;</span>
      <Punct>: </Punct>
    </>
  );

  if (collapsible && depth >= MAX_DEPTH) {
    return (
      <div className="leading-relaxed">
        {label}
        <span className="text-muted-foreground/60">
          {isArr ? '[…]' : '{…}'}
        </span>
        {!isLast && <Punct>,</Punct>}
      </div>
    );
  }

  if (!collapsible) {
    // Plain inline flow (not inline-flex) so long strings with break-all
    // wrap naturally after the label without splitting the row visually.
    // Copy is shown only on strings — numbers/booleans/null are rarely
    // worth copying and per-element copy on byte arrays is visual noise.
    const showCopy = typeof value === 'string';
    return (
      <div className="group/node leading-relaxed">
        {label}
        <Primitive value={value} />
        {!isLast && <Punct>,</Punct>}
        {showCopy && (
          <Copy
            className="ml-1 inline-flex size-5 align-middle opacity-0 transition-opacity group-hover/node:opacity-100"
            size="icon-xs"
            text={value as string}
          />
        )}
      </div>
    );
  }

  type Item = { key: string; name: string | undefined; value: Json };
  const items: Item[] = isArr
    ? (value as Json[]).map((v, i) => ({
        key: String(i),
        name: undefined,
        value: v,
      }))
    : Object.entries(value as Record<string, Json>).map(([k, v]) => ({
        key: k,
        name: k,
        value: v,
      }));
  const empty = items.length === 0;
  const open$ = open && !empty;
  const openBracket = isArr ? '[' : '{';
  const closeBracket = isArr ? ']' : '}';

  return (
    <div className="group/node leading-relaxed">
      <span className="inline-flex max-w-full items-center">
        <span
          className="inline-flex cursor-pointer items-center select-none"
          onClick={empty ? undefined : () => setOpen((p) => !p)}
        >
          {!empty && (
            <span className="text-muted-foreground/60 -ml-3.5 inline-flex w-3.5">
              {open$ ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </span>
          )}
          {label}
          <Punct>{openBracket}</Punct>
          {!open$ && (
            <>
              {!empty && (
                <span className="text-muted-foreground/60 mx-1">
                  {isArr
                    ? `${items.length} item${items.length === 1 ? '' : 's'}`
                    : `${items.length} field${items.length === 1 ? '' : 's'}`}
                </span>
              )}
              <Punct>{closeBracket}</Punct>
              {!isLast && <Punct>,</Punct>}
            </>
          )}
        </span>
        {!empty && (
          <Copy
            className="ml-1 size-5 opacity-0 transition-opacity group-hover/node:opacity-100"
            size="icon-xs"
            text={JSON.stringify(value, null, 2)}
          />
        )}
      </span>
      {open$ && (
        <>
          <div className="ml-4">
            {items.map((it, i) => (
              <Node
                depth={depth + 1}
                isLast={i === items.length - 1}
                key={it.key}
                name={it.name}
                value={it.value}
              />
            ))}
          </div>
          <div>
            <Punct>{closeBracket}</Punct>
            {!isLast && <Punct>,</Punct>}
          </div>
        </>
      )}
    </div>
  );
};

type Props = {
  className?: string;
  value: Json;
};

export const JsonTree = ({ className, value }: Props) => (
  <div
    className={`prism-code text-body-sm min-w-0 py-2 pr-4 pl-8 font-mono break-words ${
      className ?? ''
    }`}
  >
    <Node value={value} />
  </div>
);
