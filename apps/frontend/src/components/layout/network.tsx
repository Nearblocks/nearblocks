'use client';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Near } from '@/icons/near';
import { Button } from '@/ui/button';

export const NetworkSwitcher = () => {
  const networkId = useConfig((c) => c.config.networkId);
  const mainnetUrl = useConfig((c) => c.config.mainnetUrl);
  const testnetUrl = useConfig((c) => c.config.testnetUrl);
  const { t } = useLocale('layout');
  const url = networkId === 'mainnet' ? testnetUrl : mainnetUrl;

  return (
    <Button
      asChild
      size="icon-xs"
      title={t('header.switchNetwork')}
      variant="secondary"
    >
      <a href={url} rel="noopener noreferrer" target="_blank">
        <Near />
      </a>
    </Button>
  );
};
