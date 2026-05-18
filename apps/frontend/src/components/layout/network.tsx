'use client';

import { Check } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Near } from '@/icons/near';
import { Button } from '@/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';

type NetworkItemProps = {
  active: boolean;
  href: string;
  label: string;
};

const NetworkItem = ({ active, href, label }: NetworkItemProps) => (
  <PopoverPrimitive.Close asChild>
    <a
      className="focus:bg-muted hover:bg-muted text-body-sm flex items-center gap-2 rounded-sm px-2 py-1.5 outline-hidden select-none"
      href={href}
      rel="noopener noreferrer"
    >
      <span className="flex-1">{label}</span>
      {active && <Check className="text-muted-foreground size-4" />}
    </a>
  </PopoverPrimitive.Close>
);

export const NetworkSwitcher = () => {
  const network = useConfig((c) => c.config.network);
  const mainnetUrl = useConfig((c) => c.config.mainnetUrl);
  const testnetUrl = useConfig((c) => c.config.testnetUrl);
  const { t } = useLocale('layout');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon-md"
          title={t('header.switchNetwork')}
          variant="secondary"
        >
          <Near />
          <span className="sr-only">{t('header.switchNetwork')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-36 p-1">
        <NetworkItem
          active={network === 'mainnet'}
          href={mainnetUrl}
          label="Mainnet"
        />
        <NetworkItem
          active={network === 'testnet'}
          href={testnetUrl}
          label="Testnet"
        />
      </PopoverContent>
    </Popover>
  );
};
