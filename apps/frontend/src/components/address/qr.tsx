import { LuQrCode } from 'react-icons/lu';

import { QrCode } from '@/components/qr-code';
import { Button } from '@/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  address: string;
};

export const AccountQr = ({ address }: Props) => {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon-xs" variant="ghost">
              <LuQrCode />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>View QR Code</TooltipContent>
      </Tooltip>
      <PopoverContent>
        <QrCode text={address} />
      </PopoverContent>
    </Popover>
  );
};
