'use client';

import { RiQuestionLine } from '@remixicon/react';

import type { TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { ReceiptAction } from './action';
import { ReceiptInspectRows } from './inspect';
import { ReceiptOutputRows } from './output';

type Props = {
  loading?: boolean;
  receipt?: TxnReceipt;
};

export const ReceiptBlock = ({ loading = false, receipt }: Props) => {
  const { t } = useLocale('txns');

  return (
    <div className="mx-3 scroll-mt-11" id={receipt?.receipt_id}>
      <ReceiptInspectRows loading={loading} receipt={receipt} showPublicKey />
      <Separator />
      <List pairsPerRow={1}>
        <ListItem>
          <ListLeft className="min-w-60">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('receipt.actionsTip')}</TooltipContent>
              </Tooltip>
              {t('receipt.actions')}
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={
                <div className="flex flex-col">
                  <Skeleton className="mb-1 h-6 w-30" />
                  <Skeleton className="h-17.5 w-full" />
                </div>
              }
              loading={!receipt || loading}
            >
              {() => (
                <div className="flex flex-col gap-3">
                  {(receipt!.actions[0]?.action === ActionKind.DELEGATE_ACTION
                    ? [receipt!.actions[0]]
                    : receipt!.actions
                  ).map((action, i) => (
                    <ReceiptAction
                      action={action}
                      index={i}
                      key={i}
                      receipt={receipt!}
                    />
                  ))}
                </div>
              )}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
      </List>
      <Separator />
      <ReceiptOutputRows loading={loading} receipt={receipt} />
    </div>
  );
};
