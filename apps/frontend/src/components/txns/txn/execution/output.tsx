'use client';

import { RiQuestionLine } from '@remixicon/react';

import type { TxnReceipt } from 'nb-schemas';
import { ExecutionOutcomeStatus } from 'nb-types';

import { Copy } from '@/components/copy';
import { Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { CodeViewer } from './code';
import { ReceiptLogs } from './logs';

const collectReceiptIds = (
  r: TxnReceipt | undefined,
  into = new Set<string>(),
): Set<string> => {
  if (!r) return into;
  if (r.receipt_id) into.add(r.receipt_id);
  for (const child of r.receipts ?? []) collectReceiptIds(child, into);
  return into;
};

type Props = {
  loading?: boolean;
  receipt?: TxnReceipt;
};

export const ReceiptOutputRows = ({ loading = false, receipt }: Props) => {
  const { t } = useLocale('txns');
  const onPageReceiptIds = collectReceiptIds(receipt);

  return (
    <List pairsPerRow={1}>
      <ListItem>
        <ListLeft className="min-w-60">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.resultTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.result')}
          </div>
        </ListLeft>
        <ListRight>
          <div className="w-full">
            <SkeletonSlot
              fallback={<Skeleton className="h-17.5 w-full" />}
              loading={!receipt || loading}
            >
              {() => {
                const result = receipt!.outcome.result;
                const statusKey = receipt!.outcome.status_key;
                const isReceiptIdResult =
                  statusKey === ExecutionOutcomeStatus.SUCCESS_RECEIPT_ID &&
                  typeof result === 'string';

                if (result === undefined || result === null || result === '') {
                  return (
                    <p className="text-muted-foreground py-1">Empty Result</p>
                  );
                }
                if (isReceiptIdResult) {
                  const hasAnchor = onPageReceiptIds.has(result as string);
                  return (
                    <span className="inline-flex items-center gap-1 py-1">
                      {hasAnchor ? (
                        <Link
                          className="text-link font-mono"
                          href={`#${result}`}
                        >
                          {result}
                        </Link>
                      ) : (
                        <span className="font-mono">{result}</span>
                      )}
                      <Copy
                        className="text-muted-foreground"
                        size="icon-xs"
                        text={result as string}
                      />
                    </span>
                  );
                }
                return (
                  <CodeViewer
                    className="min-h-12"
                    code={
                      typeof result === 'string'
                        ? result
                        : JSON.stringify(result, null, 2)
                    }
                  />
                );
              }}
            </SkeletonSlot>
          </div>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft className="min-w-60">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.logsTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.logs')}
          </div>
        </ListLeft>
        <ListRight>
          <div className="w-full space-y-3">
            <SkeletonSlot
              fallback={<Skeleton className="h-17.5 w-full" />}
              loading={!receipt || loading}
            >
              {() => (
                <ReceiptLogs logs={receipt!.outcome!.logs! as unknown[]} />
              )}
            </SkeletonSlot>
          </div>
        </ListRight>
      </ListItem>
    </List>
  );
};
