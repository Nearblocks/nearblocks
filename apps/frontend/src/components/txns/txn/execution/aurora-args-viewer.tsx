'use client';

import { useState } from 'react';

import { Copy } from '@/components/copy';
import { ToggleGroup } from '@/components/toggle-group';
import { safeStringify } from '@/lib/json';
import { Button } from '@/ui/button';

import { CodeViewer } from './code-viewer';
import type { AuroraViewFormat } from './types';
import {
  decodeRlpExecuteTransaction,
  decodeSubmitTransaction,
  decodeSubmitWithArgsTransaction,
} from './utils';

type Props = {
  auroraExplorerUrl: string;
  methodName: string;
  rawArgsBase64: string;
  rlpHash: null | string;
};

export const AuroraArgsViewer = ({
  auroraExplorerUrl,
  methodName,
  rawArgsBase64,
  rlpHash,
}: Props) => {
  const [format, setFormat] = useState<AuroraViewFormat>('rlp');

  const isSubmit = methodName === 'submit' || methodName === 'submit_with_args';

  const rawData: null | Record<string, unknown> = isSubmit
    ? { tx_bytes_b64: rawArgsBase64 }
    : (() => {
        try {
          const decoded = atob(rawArgsBase64);
          return JSON.parse(decoded) as Record<string, unknown>;
        } catch {
          return { tx_bytes_b64: rawArgsBase64 };
        }
      })();

  const rlpDecoded = (() => {
    if (methodName === 'submit') {
      const parsed = decodeSubmitTransaction(rawArgsBase64);
      return parsed ? { tx_bytes_b64: parsed } : null;
    }
    if (methodName === 'submit_with_args') {
      const parsed = decodeSubmitWithArgsTransaction(rawArgsBase64);
      return parsed ? { tx_bytes_b64: parsed } : null;
    }
    if (methodName === 'rlp_execute' && rawData) {
      return decodeRlpExecuteTransaction(rawData);
    }
    return null;
  })();

  const displayData = format === 'rlp' ? rlpDecoded ?? rawData : rawData;

  const tableData = (() => {
    if (!rlpDecoded) return null;
    const inner = rlpDecoded.tx_bytes_b64;
    if (inner && typeof inner === 'object') {
      return inner as Record<string, unknown>;
    }
    return rlpDecoded;
  })();

  const code = displayData
    ? safeStringify(displayData, { indentation: 2 })
    : '';

  return (
    <div className="flex flex-col gap-2">
      {rlpHash && (
        <div className="text-body-sm flex items-center gap-1">
          <span className="text-muted-foreground">Aurora Tx:</span>
          <a
            className="text-primary break-all hover:underline"
            href={`${auroraExplorerUrl}/tx/${rlpHash}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {rlpHash}
          </a>
          <Copy
            className="text-muted-foreground shrink-0"
            size="icon-xs"
            text={rlpHash}
          />
        </div>
      )}
      {format === 'table' && tableData ? (
        <div className="scroll-overlay max-h-50 overflow-auto rounded border">
          <table className="text-body-sm w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b px-3 py-1.5 text-left font-medium whitespace-nowrap">
                  Name
                </th>
                <th className="border-b px-3 py-1.5 text-left font-medium">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tableData).map(([key, value]) => (
                <tr key={key}>
                  <td className="border-b px-3 py-1.5 align-top font-medium whitespace-nowrap">
                    {key}
                  </td>
                  <td className="border-b px-3 py-1.5 break-all">
                    {key === 'hash' ? (
                      <a
                        className="text-primary hover:underline"
                        href={`${auroraExplorerUrl}/tx/${value}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {String(value)}
                      </a>
                    ) : typeof value === 'object' && value !== null ? (
                      <pre className="text-body-sm whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      String(value)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        code && <CodeViewer code={code} />
      )}
      <ToggleGroup className="flex max-w-fit">
        <Button
          className="border-0"
          onClick={() => setFormat('default')}
          size="xs"
          variant={format === 'default' ? 'secondary' : 'outline'}
        >
          Default
        </Button>
        <Button
          className="border-0"
          onClick={() => setFormat('rlp')}
          size="xs"
          variant={format === 'rlp' ? 'secondary' : 'outline'}
        >
          RLP Decoded
        </Button>
        <Button
          className="border-0"
          onClick={() => setFormat('table')}
          size="xs"
          variant={format === 'table' ? 'secondary' : 'outline'}
        >
          Table
        </Button>
      </ToggleGroup>
    </div>
  );
};
