'use client';

import { CircleUserRound } from 'lucide-react';

import { useLocale } from '@/hooks/use-locale';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  className?: string;
};

export const Wallet = ({ className }: Props) => {
  const { t } = useLocale('layout');
  const account = useWallet((s) => s.account);
  const connect = useWallet((s) => s.connect);
  const disconnect = useWallet((s) => s.disconnect);
  const isInitialized = useWallet((s) => s.isInitialized);

  const handleClick = async () => {
    try {
      if (account) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      className={cn(
        className,
        'text-body-sm text-foreground hover:text-link inline-flex w-26 cursor-pointer items-center gap-1.5 px-2 py-2 transition-colors disabled:opacity-50',
      )}
      disabled={!isInitialized}
      onClick={handleClick}
      title={account ? t('menu.wallet.signOut') : t('menu.wallet.signIn')}
      type="button"
    >
      <CircleUserRound className="size-4 shrink-0" />
      {isInitialized ? (
        <span className="truncate">{account ?? t('menu.wallet.signIn')}</span>
      ) : (
        <Skeleton className="h-4 w-14" />
      )}
    </button>
  );
};
