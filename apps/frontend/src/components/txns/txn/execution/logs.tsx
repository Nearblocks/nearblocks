'use client';

import { useContext, useState } from 'react';

import { parseJson } from '@/lib/json';
import { Button } from '@/ui/button';

import { CodeViewer } from './code';
import { RpcContext } from './context';
import { findRawOutcome } from './utils';

type Props = {
  logs: unknown[];
  receiptId: string;
};

const VIEWS = [
  { label: 'Formatted', value: 'formatted' },
  { label: 'Raw', value: 'raw' },
] as const;

const unicodeUnescape = (raw: string): string =>
  raw
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/\\'/g, "'");

const beautify = (raw: string): string => {
  const trimmed = unicodeUnescape(raw).trim();

  try {
    return JSON.stringify(parseJson(trimmed), null, 2);
  } catch {}

  try {
    return JSON.stringify(
      parseJson(JSON.parse(`"${trimmed}"`) as string),
      null,
      2,
    );
  } catch {}

  const unescaped = trimmed
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');

  try {
    return JSON.stringify(parseJson(unescaped), null, 2);
  } catch {
    return unescaped;
  }
};

export const ReceiptLogs = ({ logs, receiptId }: Props) => {
  const { enableRpc, rpcData, rpcLoading } = useContext(RpcContext);
  const [view, setView] =
    useState<(typeof VIEWS)[number]['value']>('formatted');

  if (logs.length === 0) {
    return <p className="py-1 text-muted-foreground">No Logs</p>;
  }

  const combined = logs
    .map((log) => {
      const text = String(log);
      const eventPrefix = 'EVENT_JSON:';
      return text.startsWith(eventPrefix)
        ? beautify(text.slice(eventPrefix.length))
        : beautify(text);
    })
    .join('\n\n');

  const rawLogs = findRawOutcome(rpcData, receiptId)?.logs;
  const rawCode = rawLogs
    ? JSON.stringify(rawLogs, null, 2)
    : rpcLoading
      ? 'Loading...'
      : 'No data';

  const onClick = (value: (typeof VIEWS)[number]['value']) => {
    setView(value);
    if (value === 'raw' && !rpcData) enableRpc();
  };

  return (
    <CodeViewer
      className="min-h-12"
      code={view === 'raw' ? rawCode : combined}
      language="json"
      toolbar={VIEWS.map(({ label, value }) => (
        <Button
          className="cursor-pointer border-0"
          key={value}
          onClick={() => onClick(value)}
          size="xs"
          variant={view === value ? 'secondary' : 'outline'}
        >
          {label}
        </Button>
      ))}
      wrap
    />
  );
};
