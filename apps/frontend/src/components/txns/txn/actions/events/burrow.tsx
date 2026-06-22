'use client';

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  HandCoins,
  PiggyBank,
  ShieldMinus,
  ShieldPlus,
  Undo2,
} from 'lucide-react';

import { AccountLink } from '@/components/link';
import { TokenAmount, TokenImage, TokenLink } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';

import type { TokenMeta } from './utils';
import { parseBurrowEvents } from './utils';

const BURROW_CONTRACT = 'contract.main.burrow.near';

// Burrow normalizes every asset amount to at least 18 decimals
// (amount = native * 10^extra_decimals, where extra_decimals = max(0, 18 - native)).
const burrowDecimals = (decimals: null | number) => Math.max(18, decimals ?? 0);

const EVENT_ICON = {
  borrow: HandCoins,
  decrease_collateral: ShieldMinus,
  deposit: ArrowDownToLine,
  deposit_to_reserve: PiggyBank,
  increase_collateral: ShieldPlus,
  repay: Undo2,
  withdraw_succeeded: ArrowUpFromLine,
} as const;

type Props = {
  logs: unknown[];
  meta: Map<string, TokenMeta>;
};

export const BurrowEvents = ({ logs, meta }: Props) => {
  const { t } = useLocale('txns');
  const events = parseBurrowEvents(logs);

  if (events.length === 0) return null;

  const label = (event: string) => {
    switch (event) {
      case 'borrow':
        return t('actions.borrow');
      case 'decrease_collateral':
        return t('actions.decreaseCollateral');
      case 'deposit':
        return t('actions.deposit');
      case 'deposit_to_reserve':
        return t('actions.depositToReserve');
      case 'increase_collateral':
        return t('actions.increaseCollateral');
      case 'repay':
        return t('actions.repay');
      case 'withdraw_succeeded':
        return t('actions.withdraw');
      default:
        return '';
    }
  };

  return (
    <>
      {events.map((event, i) => {
        const tokenMeta = meta.get(event.token_id);
        if (!tokenMeta) return null;

        const Icon =
          EVENT_ICON[event.event as keyof typeof EVENT_ICON] ?? HandCoins;

        return (
          <span
            className="text-body-sm flex flex-wrap items-center gap-1"
            key={i}
          >
            <Icon className="text-blue-foreground size-3.5 shrink-0" />
            {label(event.event)}
            <TokenAmount
              amount={event.amount}
              decimals={burrowDecimals(tokenMeta.decimals)}
              hideSign
            />
            <TokenImage
              alt={tokenMeta.name ?? ''}
              className="m-px size-5 rounded-full border"
              src={tokenMeta.icon ?? ''}
            />
            <TokenLink
              contract={event.token_id}
              name={tokenMeta.name}
              symbol={tokenMeta.symbol}
            />
            {t('actions.by')}
            <AccountLink
              account={event.account_id}
              textClassName="max-w-32 sm:max-w-40"
            />
            {t('actions.on')}
            <AccountLink
              account={BURROW_CONTRACT}
              name="Burrow"
              textClassName="max-w-32 sm:max-w-40"
            />
          </span>
        );
      })}
    </>
  );
};
