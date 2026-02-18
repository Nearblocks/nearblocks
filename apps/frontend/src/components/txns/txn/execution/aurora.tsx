'use client';

import { RiCollapseDiagonalLine, RiExpandDiagonalLine } from '@remixicon/react';
import { useState } from 'react';

import { Copy } from '@/components/copy';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { ToggleGroup } from '@/components/toggle-group';
import { safeStringify } from '@/lib/json';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { CodeViewer } from './code';
import type { AuroraViewFormat } from './utils';
import { decodeRlpExecute, decodeSubmit, decodeSubmitWithArgs } from './utils';

type Props = {
  argsBase64: string;
  method: string;
};

type TableProps = {
  data: Record<string, unknown>;
};

export const TableView = ({ data }: TableProps) => {
  return (
    <List pairsPerRow={1}>
      {Object.entries(data).map(([key, value]) => (
        <ListItem key={key}>
          <ListLeft className="min-w-40 pl-3">{key}</ListLeft>
          <ListRight className="break-all">
            {typeof value === 'object' && value !== null ? (
              <TableView data={value as Record<string, unknown>} />
            ) : (
              String(value)
            )}
          </ListRight>
        </ListItem>
      ))}
    </List>
  );
};

export const AuroraArgsViewer = ({ argsBase64, method }: Props) => {
  const [format, setFormat] = useState<AuroraViewFormat>('rlp');
  const [isFullHeight, setIsFullHeight] = useState(false);

  const isSubmit = method === 'submit' || method === 'submit_with_args';

  const rawData: null | Record<string, unknown> | string = isSubmit
    ? argsBase64
    : (() => {
        try {
          const decoded = atob(argsBase64);
          return JSON.parse(decoded) as Record<string, unknown>;
        } catch {
          return argsBase64;
        }
      })();

  const rlpDecoded = (() => {
    if (method === 'submit') {
      return decodeSubmit(argsBase64) ?? null;
    }
    if (method === 'submit_with_args') {
      return decodeSubmitWithArgs(argsBase64) ?? null;
    }
    if (method === 'rlp_execute' && rawData && typeof rawData === 'object') {
      return decodeRlpExecute(rawData);
    }
    return null;
  })();

  const displayData = format === 'rlp' ? rlpDecoded ?? rawData : rawData;
  const code = displayData
    ? safeStringify(displayData, { indentation: 2 })
    : '';

  const tableData = (() => {
    if (!rlpDecoded || typeof rlpDecoded !== 'object') return null;
    return rlpDecoded as Record<string, unknown>;
  })();

  return (
    <div className="flex flex-col gap-2">
      {format === 'table' && tableData ? (
        <div className="relative rounded border">
          <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5">
            <ToggleGroup>
              <Copy className="text-muted-foreground" text={code} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="text-muted-foreground"
                    onClick={() => setIsFullHeight((p) => !p)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    {isFullHeight ? (
                      <RiCollapseDiagonalLine className="size-3.5" />
                    ) : (
                      <RiExpandDiagonalLine className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullHeight ? 'Collapse' : 'Expand'}
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </div>
          <div
            className={cn(
              'scroll-overlay min-h-35 overflow-auto',
              !isFullHeight && 'max-h-35',
            )}
          >
            <TableView data={tableData} />
          </div>
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
