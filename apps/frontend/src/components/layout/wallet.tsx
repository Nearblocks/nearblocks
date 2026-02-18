'use client';

import { CircleUserRound } from 'lucide-react';

import { useLocale } from '@/hooks/use-locale';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
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
    <Button
      className={cn(className, 'w-30 flex-row px-2')}
      disabled={!isInitialized}
      onClick={handleClick}
      size="xs"
    >
      <CircleUserRound />
      {isInitialized ? (
        <span className="truncate">{account ?? t('menu.wallet.signIn')}</span>
      ) : (
        <Skeleton className="w-20" />
      )}
    </Button>
  );
};
