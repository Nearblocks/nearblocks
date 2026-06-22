'use client';

import { ArrowLeftRight } from 'lucide-react';

import { AccountLink } from '@/components/link';
import { TokenAmount, TokenImage, TokenLink } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';

import type { TokenMeta } from './utils';
import { parseRheaSwapLogs } from './utils';

type Props = {
  logs: unknown[];
  meta: Map<string, TokenMeta>;
};

export const RheaSwapEvents = ({ logs, meta }: Props) => {
  const { t } = useLocale('txns');
  const rows = parseRheaSwapLogs(logs);

  if (rows.length === 0) return null;

  return (
    <>
      {rows.map((row, i) => {
        const metaIn = meta.get(row.contractIn);
        const metaOut = meta.get(row.contractOut);
        if (!metaIn || !metaOut) return null;

        return (
          <span
            className="text-body-sm flex flex-wrap items-center gap-1"
            key={i}
          >
            <ArrowLeftRight className="text-blue-foreground size-3.5 shrink-0" />
            {t('actions.swap')}
            <TokenAmount
              amount={row.amountIn}
              decimals={metaIn.decimals ?? 0}
              hideSign
            />
            <TokenImage
              alt={metaIn.name ?? ''}
              className="m-px size-5 rounded-full border"
              src={metaIn.icon ?? ''}
            />
            <TokenLink
              contract={row.contractIn}
              name={metaIn.name}
              symbol={metaIn.symbol}
            />
            {t('actions.for')}
            <TokenAmount
              amount={row.amountOut}
              decimals={metaOut.decimals ?? 0}
              hideSign
            />
            <TokenImage
              alt={metaOut.name ?? ''}
              className="m-px size-5 rounded-full border"
              src={metaOut.icon ?? ''}
            />
            <TokenLink
              contract={row.contractOut}
              name={metaOut.name}
              symbol={metaOut.symbol}
            />
            {t('actions.on')}
            <AccountLink
              account="v2.ref-finance.near"
              name={t('actions.rheaFinance')}
              textClassName="max-w-32 sm:max-w-40"
            />
          </span>
        );
      })}
    </>
  );
};
