'use client';

import { LuCircleUserRound } from 'react-icons/lu';

import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { useWalletStore } from '@/stores/wallet';
import { Button } from '@/ui/button';

type Props = {
  className?: string;
};

export const Wallet = ({ className }: Props) => {
  const { t } = useLocale('layout');
  const account = useWalletStore((s) => s.account);
  const connect = useWalletStore((s) => s.connect);
  const disconnect = useWalletStore((s) => s.disconnect);

  const handleClick = async () => {
    try {
      if (account) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      className={cn(className, 'w-30 flex-row px-2')}
      onClick={handleClick}
      size="xs"
    >
      <LuCircleUserRound />
      <span className="truncate">{account ?? t('menu.wallet.signIn')}</span>
    </Button>
  );
};
