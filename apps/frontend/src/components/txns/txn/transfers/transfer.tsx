'use client';

import { Flame, Pickaxe, Send } from 'lucide-react';
import { ReactNode } from 'react';

import { AccountLink } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';

type Props = {
  affected: string;
  cause: string;
  children?: ReactNode;
  involved: null | string;
};

type IconProps = {
  type: 'burn' | 'mint' | 'transfer';
};

export const TransferSummary = ({
  affected,
  cause,
  children,
  involved,
}: Props) => {
  const { t } = useLocale('txns');
  const isMint = cause === 'MINT';
  const isBurn = cause === 'BURN';
  const type = isMint ? 'mint' : isBurn ? 'burn' : 'transfer';

  return (
    <>
      <TransferIcon type={type} />
      {children}
      {isMint && (
        <>
          <span>{t('transfer.for')}</span>
          <AccountLink account={affected} textClassName="max-w-36" />
        </>
      )}
      {isBurn && (
        <>
          <span>{t('transfer.from')}</span>
          <AccountLink account={affected} textClassName="max-w-36" />
        </>
      )}
      {!isMint && !isBurn && (
        <>
          <span>{t('transfer.from')}</span>
          <AccountLink account={involved} textClassName="max-w-36" />
          <span>{t('transfer.to')}</span>
          <AccountLink account={affected} textClassName="max-w-36" />
        </>
      )}
    </>
  );
};

export const TransferIcon = ({ type }: IconProps) => {
  const { t } = useLocale('txns');
  return (
    <>
      {type === 'mint' ? (
        <Pickaxe className="text-lime-foreground size-3" />
      ) : type === 'burn' ? (
        <Flame className="text-red-foreground size-3" />
      ) : (
        <Send className="text-blue-foreground size-3" />
      )}
      <span>
        {type === 'mint'
          ? t('transfer.mint')
          : type === 'burn'
          ? t('transfer.burn')
          : t('transfer.transfer')}
      </span>
    </>
  );
};
