'use client';

import { RiQuestionLine } from '@remixicon/react';

import type { TxnReceipt } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { CodeViewer } from './code';
import { ReceiptLogs } from './logs';

type Props = {
  loading?: boolean;
  receipt?: TxnReceipt;
};

export const ReceiptOutputRows = ({ loading = false, receipt }: Props) => {
  const { t } = useLocale('txns');

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
          <SkeletonSlot
            fallback={<Skeleton className="h-17.5 w-full" />}
            loading={!receipt || loading}
          >
            {() =>
              receipt!.outcome.result ? (
                <CodeViewer
                  className="min-h-12"
                  code={
                    typeof receipt!.outcome.result === 'string'
                      ? receipt!.outcome.result
                      : JSON.stringify(receipt!.outcome.result, null, 2)
                  }
                />
              ) : (
                <p className="text-muted-foreground py-1">Empty Result</p>
              )
            }
          </SkeletonSlot>
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
          <div className="space-y-3">
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
