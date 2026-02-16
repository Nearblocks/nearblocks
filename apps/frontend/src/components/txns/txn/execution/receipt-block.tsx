import { RiQuestionLine } from '@remixicon/react';

import type { TxnReceipt } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { TxnStatus } from '@/components/txn';
import { NearCircle } from '@/icons/near-circle';
import { gasFormat, nearFormat, numberFormat } from '@/lib/format';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { CodeViewer } from './code-viewer';
import { ReceiptAction } from './receipt-action';
import { ReceiptLogs } from './receipt-logs';

type Props = {
  loading?: boolean;
  receipt?: TxnReceipt;
};

export const ReceiptBlock = ({ loading = false, receipt }: Props) => {
  return (
    <div className="mx-3">
      <List pairsPerRow={1}>
        <ListItem>
          <ListLeft className="min-w-60">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Unique identifier (hash) of this receipt
                </TooltipContent>
              </Tooltip>
              Receipt:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-7 w-40" />}
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
                <TooltipContent>The status of the receipt</TooltipContent>
              </Tooltip>
              Status:
            </div>
          </ListLeft>
          <ListRight className="h-13">
            <SkeletonSlot
              fallback={<Skeleton className="h-6 w-40" />}
              loading={!receipt || loading}
            >
              {() => <TxnStatus status={receipt!.outcome.status} />}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
        <ListItem>
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  The number of the block in which the receipt was recorded
                </TooltipContent>
              </Tooltip>
              Block:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-7 w-40" />}
              loading={!receipt || loading}
            >
              {() => (
                <p className="flex items-center gap-1">
                  <Link
                    className="text-link"
                    href={`/blocks/receipt.block.block_height`}
                  >
                    {numberFormat(receipt!.block.block_height)}
                  </Link>
                  <Copy
                    className="text-muted-foreground shrink-0"
                    size="icon-xs"
                    text={receipt!.receipt_id}
                  />
                </p>
              )}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
        <ListItem>
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  The account which issued a receipt
                </TooltipContent>
              </Tooltip>
              From:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-7 w-40" />}
              loading={!receipt || loading}
            >
              {() => (
                <AccountLink
                  account={receipt!.predecessor_account_id}
                  textClassName="max-w-60"
                />
              )}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
        <ListItem>
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  The destination account of the receipt
                </TooltipContent>
              </Tooltip>
              To:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-7 w-40" />}
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
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  The actions performed during receipt processing
                </TooltipContent>
              </Tooltip>
              Actions:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={
                <div className="flex flex-col">
                  <Skeleton className="mb-2 h-7 w-1/4" />
                  <Skeleton className="h-35 w-full" />
                </div>
              }
              loading={!receipt || loading}
            >
              {() => (
                <div className="flex flex-col gap-3">
                  {receipt!.actions.map((action, i) => (
                    <ReceiptAction
                      action={action}
                      key={i}
                      receiptId={receipt!.receipt_id}
                      receiver={receipt!.receiver_account_id}
                      signer={receipt!.predecessor_account_id}
                    />
                  ))}
                </div>
              )}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
        <ListItem>
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Deposit value attached with the receipt
                </TooltipContent>
              </Tooltip>
              Value:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!receipt || loading}
            >
              {() => (
                <span className="flex items-center gap-1">
                  <NearCircle className="size-4" /> {nearFormat(0)}
                </span>
              )}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
        <ListItem>
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Total amount of Gas & Token burnt from this receipt
                </TooltipContent>
              </Tooltip>
              Burnt Gas & Tokens:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!receipt || loading}
            >
              {() => (
                <span className="flex items-center gap-1">
                  {receipt!.outcome.gas_burnt &&
                    `${gasFormat(receipt!.outcome.gas_burnt)} Tgas`}
                  {receipt!.outcome.gas_burnt &&
                    receipt!.outcome.tokens_burnt && (
                      <span className="text-muted-foreground">|</span>
                    )}
                  {receipt!.outcome.tokens_burnt &&
                    nearFormat(receipt!.outcome.tokens_burnt)}{' '}
                  <NearCircle className="size-4" />
                </span>
              )}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
        <ListItem>
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  The result of the receipt execution
                </TooltipContent>
              </Tooltip>
              Result:
            </div>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-12 w-full" />}
              loading={!receipt || loading}
            >
              {() => (
                <CodeViewer
                  className="min-h-12"
                  code={
                    typeof receipt!.outcome.result === 'string'
                      ? receipt!.outcome.result
                      : JSON.stringify(receipt!.outcome.result, null, 2)
                  }
                />
              )}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
        <ListItem>
          <ListLeft className="">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Logs included in the receipt</TooltipContent>
              </Tooltip>
              Logs:
            </div>
          </ListLeft>
          <ListRight>
            <div className="space-y-3">
              <SkeletonSlot
                fallback={<Skeleton className="h-12 w-full" />}
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
    </div>
  );
};
