'use client';

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';

import { AccountLink } from '@/components/link';
import {
  MTTokenLink,
  TokenAmount,
  TokenImage,
  TokenLink,
  TokenValue,
} from '@/components/token';
import { useLocale } from '@/hooks/use-locale';

import type { TokenMeta } from './utils';
import {
  parseEventJson,
  parseIntentsDeposits,
  parseIntentsWithdrawals,
} from './utils';

const INTENTS_CONTRACT = 'intents.near';

type Props = {
  logs: unknown[];
  meta: Map<string, TokenMeta>;
};

type TokenEntry = {
  amount: string;
  // full diff key — is the MT token_id within intents.near
  tokenKey: string;
};

type SwapAccount = {
  account_id: string;
  received: TokenEntry[];
  sent: TokenEntry[];
};

const parseIntentsSwapLogs = (logs: unknown[]): SwapAccount[] => {
  const swaps: SwapAccount[] = [];

  for (const log of logs) {
    const event = parseEventJson(log);
    if (!event) continue;
    if (event.standard !== 'dip4' || event.event !== 'token_diff') continue;

    const data = Array.isArray(event.data) ? event.data : [event.data];

    for (const item of data) {
      if (!item || typeof item !== 'object') continue;
      const { account_id, diff } = item as {
        account_id: unknown;
        diff: unknown;
      };
      if (typeof account_id !== 'string') continue;
      if (!diff || typeof diff !== 'object' || Array.isArray(diff)) continue;

      const sent: TokenEntry[] = [];
      const received: TokenEntry[] = [];

      for (const [token, rawAmount] of Object.entries(
        diff as Record<string, unknown>,
      )) {
        if (typeof rawAmount !== 'string') continue;
        try {
          const value = BigInt(rawAmount);
          if (value > 0n) {
            received.push({ amount: rawAmount, tokenKey: token });
          } else if (value < 0n) {
            sent.push({ amount: rawAmount.replace(/^-/, ''), tokenKey: token });
          }
        } catch {
          // skip malformed amounts
        }
      }

      // only show accounts with both sides (actual swap)
      if (sent.length > 0 && received.length > 0) {
        swaps.push({ account_id, received, sent });
      }
    }
  }

  return swaps;
};

const renderTokenEntry = (
  entry: TokenEntry,
  meta: Map<string, TokenMeta>,
  j: number,
) => {
  const tokenMeta = meta.get(entry.tokenKey);
  if (!tokenMeta) return null;
  return (
    <span className="flex items-center gap-1" key={j}>
      <TokenAmount
        amount={entry.amount}
        decimals={tokenMeta.decimals ?? 0}
        hideSign
      />
      <TokenValue
        amount={entry.amount}
        decimals={tokenMeta.decimals}
        price={tokenMeta.price}
      />
      <TokenImage
        alt={tokenMeta.name ?? ''}
        className="m-px size-5 rounded-full border"
        src={tokenMeta.icon ?? ''}
      />
      <MTTokenLink
        contract={INTENTS_CONTRACT}
        decimals={tokenMeta.decimals}
        name={tokenMeta.name}
        symbol={tokenMeta.symbol}
        token={entry.tokenKey}
      />
    </span>
  );
};

export const IntentsSwapEvents = ({ logs, meta }: Props) => {
  const { t } = useLocale('txns');
  const swaps = parseIntentsSwapLogs(logs).filter(
    (swap) =>
      swap.sent.every((e) => meta.has(e.tokenKey)) &&
      swap.received.every((e) => meta.has(e.tokenKey)),
  );
  const withdrawals = parseIntentsWithdrawals(logs).filter((w) =>
    meta.has(w.token),
  );
  const deposits = parseIntentsDeposits(logs).filter((d) => meta.has(d.token));

  if (swaps.length === 0 && withdrawals.length === 0 && deposits.length === 0) {
    return null;
  }

  return (
    <>
      {swaps.map((swap, i) => (
        <span
          className="text-body-sm flex flex-wrap items-center gap-1"
          key={`swap-${i}`}
        >
          <ArrowLeftRight className="text-blue-foreground size-3.5 shrink-0" />
          {t('actions.swap')}
          {swap.sent.map((entry, j) => renderTokenEntry(entry, meta, j))}
          {t('actions.for')}
          {swap.received.map((entry, j) => renderTokenEntry(entry, meta, j))}
          {t('actions.by')}
          <AccountLink
            account={swap.account_id}
            textClassName="max-w-32 sm:max-w-40"
          />
          {t('actions.on')}
          <AccountLink
            account={INTENTS_CONTRACT}
            name="NEAR Intents"
            textClassName="max-w-32 sm:max-w-40"
          />
        </span>
      ))}
      {withdrawals.map((w, i) => {
        const tokenMeta = meta.get(w.token)!;
        return (
          <span
            className="text-body-sm flex flex-wrap items-center gap-1"
            key={`withdraw-${i}`}
          >
            <ArrowUpRight className="text-blue-foreground size-3.5 shrink-0" />
            {t('actions.withdraw')}
            <TokenAmount
              amount={w.amount}
              decimals={tokenMeta.decimals ?? 0}
              hideSign
            />
            <TokenValue
              amount={w.amount}
              decimals={tokenMeta.decimals}
              price={tokenMeta.price}
            />
            <TokenImage
              alt={tokenMeta.name ?? ''}
              className="m-px size-5 rounded-full border"
              src={tokenMeta.icon ?? ''}
            />
            <TokenLink
              contract={w.token}
              name={tokenMeta.name}
              symbol={tokenMeta.symbol}
            />
            {t('actions.to')}
            <AccountLink
              account={w.receiver_id}
              textClassName="max-w-32 sm:max-w-40"
            />
            {t('actions.by')}
            <AccountLink
              account={w.account_id}
              textClassName="max-w-32 sm:max-w-40"
            />
            {t('actions.on')}
            <AccountLink
              account={INTENTS_CONTRACT}
              name="NEAR Intents"
              textClassName="max-w-32 sm:max-w-40"
            />
          </span>
        );
      })}
      {deposits.map((d, i) => (
        <span
          className="text-body-sm flex flex-wrap items-center gap-1"
          key={`deposit-${i}`}
        >
          <ArrowDownLeft className="text-blue-foreground size-3.5 shrink-0" />
          {t('actions.deposit')}
          {renderTokenEntry({ amount: d.amount, tokenKey: d.token }, meta, 0)}
          {t('actions.by')}
          <AccountLink
            account={d.account_id}
            textClassName="max-w-32 sm:max-w-40"
          />
          {t('actions.on')}
          <AccountLink
            account={INTENTS_CONTRACT}
            name="NEAR Intents"
            textClassName="max-w-32 sm:max-w-40"
          />
        </span>
      ))}
    </>
  );
};
