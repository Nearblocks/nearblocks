'use client';
import Clipboard from 'clipboard';
import { useEffect, useRef, useState } from 'react';

import {
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from '@/components/ui/dialog';

import CopyIcon from '../Icons/CopyIcon';
import QRCodeIcon from '../Icons/QRCodeIcon';
import QrCode from './QrCode';
import Tooltip from './Tooltip';

interface Props {
  address: string;
  theme?: string;
}

const Buttons = ({ address }: Props) => {
  const ref = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    const clip = new Clipboard(ref.current, {
      text() {
        return address || '';
      },
    });

    clip.on('success', () => {
      setShowTooltip((t) => !t);

      setTimeout(() => setShowTooltip((t) => !t), 1500);
    });

    return () => clip.destroy();
  }, [address]);

  return (
    <>
      <span className="inline-flex mr-1.5 h-7">
        <Tooltip
          className="whitespace-nowrap ml-20 mt-3 max-w-[200px]"
          position={'bottom'}
          tooltip="Copy account ID to clipboard"
        >
          <span className="relative">
            {showTooltip && (
              <span className="absolute bg-black bg-opacity-90 z-30 -left-full -top-9 text-xs text-white break-normal px-3 py-2">
                Copied!
              </span>
            )}
            <button
              className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
              ref={ref}
              type="button"
            >
              <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
            </button>
          </span>
        </Tooltip>
      </span>
      <DialogRoot placement={'center'} size="xs">
        <DialogTrigger asChild>
          <button>
            <Tooltip
              className="whitespace-nowrap ml-16 max-w-[200px]"
              position={'bottom'}
              tooltip="Click to view QR Code"
            >
              <div className="bg-green-500 flex dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7">
                <QRCodeIcon className="fill-current text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
              </div>
            </Tooltip>
          </button>
        </DialogTrigger>

        <DialogContent className="dark:bg-black-600">
          <div className="flex items-center justify-between rounded-t-2xl bg-gray-100 px-3 py-4 dark:bg-black-200 dark:text-neargray-10">
            <div className="flex items-center text-xs break-all">{address}</div>
          </div>
          <div className="flex justify-center">
            <QrCode height={160} value={address} width={160} />
          </div>
          <DialogCloseTrigger className="text-gray-500 fill-current" />
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default Buttons;
