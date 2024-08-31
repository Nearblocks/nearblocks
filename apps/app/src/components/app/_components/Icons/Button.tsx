import { Tooltip } from '@reach/tooltip';
import { useEffect, useRef, useState } from 'react';
import CopyIcon from '../Icons/CopyIcon';
import QrCode from '../common/QrCode';
import Clipboard from 'clipboard';
import QRCodeIcon from '../Icons/QRCodeIcon';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import CloseCircle from '../Icons/CloseCircle';

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
          label="Copy account ID to clipboard"
          className="absolute h-auto max-w-[6rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
        >
          <span className="relative">
            {showTooltip && (
              <span className="absolute bg-black bg-opacity-90 z-30 -left-full -top-9 text-xs text-white break-normal px-3 py-2">
                Copied!
              </span>
            )}
            <button
              ref={ref}
              type="button"
              className="bg-green-500 dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
            >
              <CopyIcon className="fill-current -z-50 text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
            </button>
          </span>
        </Tooltip>
        <Tooltip
          label="Click to view QR Code"
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
        >
          <button
            type="button"
            onClick={onToggle}
            className="bg-green-500  dark:bg-black-200 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7"
          >
            <QRCodeIcon className="fill-current text-green-500 dark:text-green-250 group-hover:text-white h-4 w-4" />
          </button>
        </Tooltip>
      </span>
      <DialogOverlay
        isOpen={isOpen}
        onDismiss={onToggle}
        className="fixed bg-black bg-opacity-10 inset-0 z-30 flex items-center justify-center"
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
            <QrCode value={address} width={160} height={160} />
          </div>
        </DialogContent>
      </DialogOverlay>
    </>
  );
};

export default Buttons;
