'use client';

import { useMemo, useState } from 'react';

import type { ActionReceipt, TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { Button } from '@/ui/button';

import { Action, argsRecord } from '../actions/action';
import { ReceiptIcon } from '../actions/icon';
import { AuroraArgsViewer } from './aurora';
import { CodeViewer } from './code';
import { deepUnescape, isAuroraAction } from './utils';

type Encoding = 'base64' | 'hex' | 'json' | 'utf8';

const ENCODINGS: { label: string; value: Encoding }[] = [
  { label: 'JSON', value: 'json' },
  { label: 'UTF-8', value: 'utf8' },
  { label: 'Hex', value: 'hex' },
  { label: 'Base64', value: 'base64' },
];

const base64ToBytes = (b64: string): null | Uint8Array => {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
};

const utf8ToBytes = (text: string): Uint8Array =>
  new TextEncoder().encode(text);

const bytesToUtf8 = (bytes: Uint8Array): string =>
  new TextDecoder('utf-8', { fatal: false }).decode(bytes);

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const bytesToBase64 = (bytes: Uint8Array): string => {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const encodeArgs = (
  encoding: Encoding,
  argsBase64: string | undefined,
  decoded: Record<string, unknown> | undefined,
  hasArgs: boolean,
): string => {
  try {
    const bytes = argsBase64
      ? base64ToBytes(argsBase64)
      : hasArgs && decoded
      ? utf8ToBytes(JSON.stringify(deepUnescape(decoded)))
      : null;

    if (encoding === 'json') {
      if (hasArgs && decoded) {
        return JSON.stringify(deepUnescape(decoded), null, 2);
      }
      if (bytes) {
        const text = bytesToUtf8(bytes);
        try {
          return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          return text;
        }
      }
      return '';
    }
    if (!bytes) return '<invalid encoding>';
    if (encoding === 'utf8') return bytesToUtf8(bytes);
    if (encoding === 'hex') return bytesToHex(bytes);
    return bytesToBase64(bytes);
  } catch {
    return '<unable to decode args>';
  }
};

type Props = {
  action: ActionReceipt;
  onlyArgs?: boolean;
  receipt: TxnReceipt;
};

export const ReceiptAction = ({ action, onlyArgs = false, receipt }: Props) => {
  const [encoding, setEncoding] = useState<Encoding>('json');

  const { args, argsBase64, hasArgs, method } = useMemo(() => {
    const args = argsRecord(action.args);
    let method: string | undefined =
      typeof action.method === 'string' ? action.method : undefined;
    let hasArgs = Object.keys(args).length > 0;
    let argsJson: Record<string, unknown> | undefined;
    let argsBase64: string | undefined;

    if (action.action === ActionKind.FUNCTION_CALL) {
      if (Object.keys(args).length > 0) {
        if (!method && 'method_name' in args) {
          method = args.method_name as string;
        }
        argsBase64 =
          typeof args.args_base64 === 'string'
            ? (args.args_base64 as string)
            : undefined;
        argsJson = argsRecord(args.args_json);
        hasArgs = Object.keys(argsJson).length > 0;
      }
    }

    return { args: argsJson ?? args, argsBase64, hasArgs, method };
  }, [action]);

  const isAurora = isAuroraAction(method, receipt.receiver_account_id);
  const showEncodingToggle = !!method && (!!argsBase64 || hasArgs);
  const displayCode = showEncodingToggle
    ? encodeArgs(encoding, argsBase64, args, hasArgs)
    : hasArgs
    ? JSON.stringify(deepUnescape(args), null, 2)
    : argsBase64;

  const codeBlock =
    isAurora && argsBase64 ? (
      <AuroraArgsViewer argsBase64={argsBase64} method={method!} />
    ) : (
      displayCode && (
        <CodeViewer
          className="min-h-17"
          code={displayCode}
          language={encoding === 'json' ? 'json' : 'plain'}
          showByteSize
          toolbar={
            showEncodingToggle && (
              <>
                {ENCODINGS.map(({ label, value }) => (
                  <Button
                    className="border-0"
                    key={value}
                    onClick={() => setEncoding(value)}
                    size="xs"
                    variant={encoding === value ? 'secondary' : 'outline'}
                  >
                    {label}
                  </Button>
                ))}
              </>
            )
          }
          tree={encoding === 'json'}
          wrap={encoding !== 'json'}
        />
      )
    );

  if (onlyArgs) {
    return <>{codeBlock}</>;
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-1">
        <ReceiptIcon action={action.action} className="size-3.5" />
        <Action
          action={action}
          full={false}
          receiver={receipt.receiver_account_id}
          signer={receipt.predecessor_account_id}
        />
      </div>
      {codeBlock}
    </div>
  );
};
