'use client';

import { RiQuestionLine } from '@remixicon/react';
import { Key } from 'lucide-react';
import { useContext, useMemo } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { LongDate } from '@/components/timestamp';
import { TxnStatus } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { gasFormat, nearFiatFormat, nearFormat, numberFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { RpcContext } from './context';

type Props = {
  loading?: boolean;
  receipt?: TxnReceipt;
  showPublicKey?: boolean;
};

export const ReceiptInspectRows = ({
  loading = false,
  receipt,
  showPublicKey = false,
}: Props) => {
  const { t } = useLocale('txns');
  const { nearPrice } = useContext(RpcContext);

  const deposit = useMemo(() => {
    return receipt?.actions
      .reduce((sum, action) => {
        const d = (action.args as { deposit?: string })?.deposit;
        return sum + BigInt(d ?? '0');
      }, BigInt(0))
      .toString();
  }, [receipt]);

  return (
    <List pairsPerRow={1}>
      <ListItem>
        <ListLeft className="min-w-60">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.receiptTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.receipt')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="h-7 w-60" />}
            loading={!receipt || loading}
          >
            {() => (
              <span className="flex items-center gap-1 break-all">
                {receipt!.receipt_id}
                <Copy
                  className="text-muted-foreground shrink-0"
                  size="icon-xs"
                  text={receipt!.receipt_id}
                />
              </span>
            )}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft className="h-13">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.statusTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.status')}
          </div>
        </ListLeft>
        <ListRight className="h-13">
          <SkeletonSlot
            fallback={<Skeleton className="h-6 w-20" />}
            loading={!receipt || loading}
          >
            {() => <TxnStatus status={receipt!.outcome.status} />}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.blockTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.block')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="h-7 w-25" />}
            loading={!receipt || loading}
          >
            {() => (
              <p className="flex items-center gap-1">
                <Link
                  className="text-link"
                  href={`/blocks/${receipt!.block.block_height}`}
                >
                  {numberFormat(receipt!.block.block_height)}
                </Link>
                <Copy
                  className="text-muted-foreground shrink-0"
                  size="icon-xs"
                  text={String(receipt!.block.block_height)}
                />
              </p>
            )}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.timestampTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.timestamp')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="h-6 w-60" />}
            loading={!receipt || loading}
          >
            {() => <LongDate hideAge ns={receipt!.block.block_timestamp} />}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.fromTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.from')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="h-7 w-40" />}
            loading={!receipt || loading}
          >
            {() => (
              <p className="flex items-center gap-1">
                <AccountLink
                  account={receipt!.predecessor_account_id}
                  textClassName="max-w-60"
                />
                {showPublicKey && (
                  <span className="text-muted-foreground flex items-center">
                    (
                    <Key className="mx-1 size-3.5" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          className="text-link inline max-w-40 truncate"
                          href={`/address/${
                            receipt!.predecessor_account_id
                          }/keys`}
                        >
                          {receipt!.public_key}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{receipt!.public_key}</TooltipContent>
                    </Tooltip>
                    <Copy text={receipt!.public_key} />)
                  </span>
                )}
              </p>
            )}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.toTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.to')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="h-7 w-30" />}
            loading={!receipt || loading}
          >
            {() => (
              <AccountLink
                account={receipt!.receiver_account_id}
                textClassName="max-w-60"
              />
            )}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('receipt.valueTip')}</TooltipContent>
            </Tooltip>
            {t('receipt.value')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="w-20" />}
            loading={!receipt || loading}
          >
            {() => (
              <span className="flex items-center gap-1">
                {nearFormat(deposit)} Ⓝ
                {nearPrice && (
                  <span className="text-muted-foreground">
                    ({nearFiatFormat(deposit, nearPrice)})
                  </span>
                )}
              </span>
            )}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('enhanced.burntGasTip')}</TooltipContent>
            </Tooltip>
            {t('enhanced.burntGas')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="w-30" />}
            loading={!receipt || loading}
          >
            {() => (
              <span className="flex items-center gap-1">
                {receipt!.outcome.gas_burnt &&
                  `${gasFormat(receipt!.outcome.gas_burnt)} Tgas`}
              </span>
            )}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
      <ListItem>
        <ListLeft>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <RiQuestionLine className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{t('enhanced.burntTokensTip')}</TooltipContent>
            </Tooltip>
            {t('enhanced.burntTokens')}
          </div>
        </ListLeft>
        <ListRight>
          <SkeletonSlot
            fallback={<Skeleton className="w-30" />}
            loading={!receipt || loading}
          >
            {() => (
              <span className="flex items-center gap-1">
                {receipt!.outcome.tokens_burnt &&
                  nearFormat(receipt!.outcome.tokens_burnt)}{' '}
                <NearCircle className="size-4" />
              </span>
            )}
          </SkeletonSlot>
        </ListRight>
      </ListItem>
    </List>
  );
};
