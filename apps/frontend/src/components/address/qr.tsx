'use client';

import { QrCodeIcon } from 'lucide-react';

import { QrCode } from '@/components/qr-code';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  address: string;
};

export const AccountQr = ({ address }: Props) => {
  const { t } = useLocale('address');

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <QrCodeIcon />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('qr')}</TooltipContent>
      </Tooltip>
      <PopoverContent>
        <QrCode text={address} />
      </PopoverContent>
    </Popover>
  );
};
