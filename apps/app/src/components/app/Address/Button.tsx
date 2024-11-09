'use client';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import { Tooltip } from '@reach/tooltip';
import Clipboard from 'clipboard';
import { useEffect, useRef, useState } from 'react';

import QrCode from '../common/QrCode';
import CloseCircle from '../Icons/CloseCircle';
import CopyIcon from '../Icons/CopyIcon';
import QRCodeIcon from '../Icons/QRCodeIcon';

interface Props {
  address: string;
  theme?: string;
}

const Buttons = ({ address }: Props) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
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

  const onToggle = () => setIsOpen((open) => !open);

  return (
    <>
      <span className="inline-flex space-x-2 h-7">
        <Tooltip
          className="absolute h-auto max-w-[6rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          label="Copy account ID to clipboard"
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
        <Tooltip
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          label="Click to view QR Code"
        >
          <button
            className="bg-green-500  dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
            onClick={onToggle}
            type="button"
          >
            <QRCodeIcon className="fill-current text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
          </button>
        </Tooltip>
      </span>
      <DialogOverlay
        className="fixed bg-black bg-opacity-10 inset-0 z-30 flex items-center justify-center"
        isOpen={isOpen}
        onDismiss={onToggle}
      >
        <DialogContent
          aria-label="Qr Code"
          className="max-w-xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden dark:bg-black-600"
        >
          <div className="flex items-center justify-between bg-gray-100 px-3 py-4 dark:bg-black-200 dark:text-neargray-10">
            <h4 className="flex items-center text-xs break-all">{address}</h4>
            <button className="text-gray-500 fill-current" onClick={onToggle}>
              <CloseCircle />
            </button>
          </div>
          <div className="p-4">
            <QrCode height={160} value={address} width={160} />
          </div>
        </DialogContent>
      </DialogOverlay>
    </>
  );
};

export default Buttons;
