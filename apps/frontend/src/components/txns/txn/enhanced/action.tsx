'use client';

import { RiQuestionLine } from '@remixicon/react';
import { useMemo } from 'react';

import type { ActionReceipt, TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { gasFormat, nearFormat } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Separator } from '@/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { argsRecord } from '../actions/action';
import { ReceiptIcon } from '../actions/icon';
import { ReceiptAction } from '../execution/action';
import { ReceiptInspectRows } from '../execution/inspect';
import { ReceiptOutputRows } from '../execution/output';

type Props = {
  action: ActionReceipt;
  expanded: boolean;
  receipt: TxnReceipt;
  toggle: () => void;
};

type SectionProps = {
  actions: ActionReceipt[];
  receipt: TxnReceipt;
};

const actionVariant = (action: ActionKind) => {
  switch (action) {
    case ActionKind.ADD_KEY:
    case ActionKind.CREATE_ACCOUNT:
    case ActionKind.DETERMINISTIC_STATE_INIT:
      return { bg: 'bg-lime-background', color: 'text-lime-foreground' };
    case ActionKind.FUNCTION_CALL:
      return { bg: 'bg-blue-background', color: 'text-blue-foreground' };
    case ActionKind.STAKE:
    case ActionKind.TRANSFER:
      return { bg: 'bg-amber-background', color: 'text-amber-foreground' };
    case ActionKind.DELEGATE_ACTION:
    case ActionKind.DEPLOY_CONTRACT:
    case ActionKind.DEPLOY_GLOBAL_CONTRACT:
    case ActionKind.DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
    case ActionKind.USE_GLOBAL_CONTRACT:
    case ActionKind.USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID:
      return { bg: 'bg-purple-background', color: 'text-purple-foreground' };
    case ActionKind.DELETE_ACCOUNT:
    case ActionKind.DELETE_KEY:
      return { bg: 'bg-red-background', color: 'text-red-foreground' };
    default:
      return { bg: 'bg-gray-background', color: 'text-gray-foreground' };
  }
};

const getGasAttached = (actions: ActionReceipt[]): string =>
  actions.reduce((acc, action) => {
    if (action.action !== ActionKind.FUNCTION_CALL) return acc;
    if (
      !action.args ||
      typeof action.args !== 'object' ||
      Array.isArray(action.args)
    ) {
      return acc;
    }
    const gas = (action.args as { gas?: number | string }).gas;
    if (gas === undefined || gas === null) return acc;
    return (BigInt(acc) + BigInt(gas)).toString();
  }, '0');

const getDeposit = (actions: ActionReceipt[]): string =>
  actions.reduce((acc, action) => {
    if (
      !action.args ||
      typeof action.args !== 'object' ||
      Array.isArray(action.args)
    ) {
      return acc;
    }
    const deposit = (action.args as { deposit?: string }).deposit ?? '0';
    return (BigInt(acc) + BigInt(deposit)).toString();
  }, '0');

const getRefund = (receipts: TxnReceipt[]): string =>
  receipts
    .filter((r) => r.predecessor_account_id === 'system')
    .reduce(
      (acc, receipt) =>
        (BigInt(acc) + BigInt(getDeposit(receipt.actions))).toString(),
      '0',
    );

const getPreCharged = (receipt: TxnReceipt): string =>
  (
    BigInt(receipt.outcome.tokens_burnt ?? '0') +
    BigInt(getRefund(receipt.receipts))
  ).toString();

const LabelWithTip = ({ label, tip }: { label: string; tip: string }) => (
  <span className="flex items-center gap-1">
    <Tooltip>
      <TooltipTrigger asChild>
        <RiQuestionLine className="size-4" />
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
    {label}
  </span>
);

export const ActionCard = ({ action, expanded, receipt, toggle }: Props) => {
  const actionLabel = useMemo(() => {
    if (action.action === ActionKind.FUNCTION_CALL) {
      const args = argsRecord(action.args);
      if ('method_name' in args) return args.method_name as string;
    }
    return action.action.toLowerCase();
  }, [action]);

  const variant = actionVariant(action.action);

  return (
    <div className="mb-1 inline-block">
      <div
        className={cn(
          'inline-flex max-w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors',
          variant.bg,
          'hover:opacity-90',
        )}
        onClick={toggle}
        role="button"
        tabIndex={0}
      >
        <ReceiptIcon
          action={action.action}
          className={cn('size-3.5', variant.color)}
        />
        <span
          className={cn(
            'text-body-sm max-w-60 truncate font-medium',
            variant.color,
          )}
        >
          {actionLabel}
        </span>
        {receipt.outcome.status === false && (
          <span className="bg-destructive/10 text-destructive rounded px-1.5 py-0.5 text-xs">
            Fail
          </span>
        )}
        <span className={cn('shrink-0', variant.color)}>
          {expanded ? '-' : '+'}
        </span>
      </div>
    </div>
  );
};

export const ReceiptExpandedSection = ({ actions, receipt }: SectionProps) => {
  const { t } = useLocale('txns');
  const gasLimit = getGasAttached(receipt.actions);
  const refund = getRefund(receipt.receipts);
  const preCharged = getPreCharged(receipt);

  return (
    <div className="border-border bg-card mt-1 space-y-3 rounded-lg border p-3">
      {actions.map((action, i) => (
        <ReceiptAction
          action={action}
          index={i}
          key={i}
          onlyArgs
          receipt={receipt}
        />
      ))}

      <Tabs defaultValue="output">
        <TabsList>
          <TabsTrigger value="output">{t('enhanced.output')}</TabsTrigger>
          <TabsTrigger value="inspect">{t('enhanced.inspect')}</TabsTrigger>
        </TabsList>

        <TabsContent value="output">
          <ReceiptOutputRows receipt={receipt} />
        </TabsContent>

        <TabsContent value="inspect">
          <ReceiptInspectRows receipt={receipt} />
          <Separator />
          <List pairsPerRow={1}>
            <ListItem>
              <ListLeft className="min-w-60">
                <LabelWithTip
                  label={t('enhanced.gasLimit')}
                  tip="Maximum amount of gas allocated for the Receipt"
                />
              </ListLeft>
              <ListRight>{`${gasFormat(gasLimit)} Tgas`}</ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>
                <LabelWithTip
                  label="Pre-charged Fee"
                  tip="Fees Pre-charged on Receipt"
                />
              </ListLeft>
              <ListRight>{`${nearFormat(preCharged)} Ⓝ`}</ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>
                <LabelWithTip label="Refund" tip="Refund from the receipt" />
              </ListLeft>
              <ListRight>{`${nearFormat(refund)} Ⓝ`}</ListRight>
            </ListItem>
          </List>
        </TabsContent>
      </Tabs>
    </div>
  );
};
