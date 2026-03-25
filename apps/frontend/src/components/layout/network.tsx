'use client';

import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Near } from '@/icons/near';
import { Button } from '@/ui/button';

export const NetworkSwitcher = () => {
  const network = useConfig((c) => c.config.network);
  const mainnetUrl = useConfig((c) => c.config.mainnetUrl);
  const testnetUrl = useConfig((c) => c.config.testnetUrl);
  const { t } = useLocale('layout');
  const url = network === 'mainnet' ? testnetUrl : mainnetUrl;

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
