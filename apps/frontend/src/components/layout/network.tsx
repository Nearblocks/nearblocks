'use client';

import { useConfig } from '@/hooks/use-config';
import { Near } from '@/icons/near';
import { Button } from '@/ui/button';

export const NetworkSwitcher = () => {
  const config = useConfig();
  const url =
    config.NEXT_PUBLIC_NETWORK_ID === 'mainnet'
      ? config.NEXT_PUBLIC_TESTNET_URL
      : config.NEXT_PUBLIC_MAINNET_URL;

  return (
    <Button asChild size="icon-xs" title="Switch Network" variant="secondary">
      <a href={url} rel="noopener noreferrer" target="_blank">
        <Near />
      </a>
    </Button>
  );
};
