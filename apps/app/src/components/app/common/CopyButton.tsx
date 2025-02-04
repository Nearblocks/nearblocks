import { useEffect, useRef, useState } from 'react';
import Clipboard from 'clipboard';
import CopyIcon from '@/components/app/Icons/CopyIcon';
import Tick from '@/components/app/Icons/Tick';

interface CopyButtonProps {
  textToCopy: string;
}

export function CopyButton({ textToCopy }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    button.setAttribute('data-clipboard-text', textToCopy);

    const clipboard = new Clipboard(button);

    // Handle success
    const handleSuccess = () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    };

    clipboard.on('success', handleSuccess);

    return () => {
      clipboard.destroy();
      button.removeAttribute('data-clipboard-text');
    };
  }, [textToCopy]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="relative group p-1 w-5 h-5 hover:bg-opacity-100"
      aria-label="Copy address"
    >
      {isCopied ? (
        <>
          <Tick className="fill-current text-green-500 dark:text-green-250 h-4 w-4 -mt-0.5" />
          <span className="absolute bg-black/90 text-white text-xs px-3 py-2 -left-full -top-9 rounded-lg z-20 whitespace-nowrap">
            Copied!
          </span>
        </>
      ) : (
        <CopyIcon className="fill-current text-gray-500 dark:text-gray-250 group-hover:text-green-500 dark:group-hover:text-green-250 h-4 w-4 -mt-0.5" />
      )}
    </button>
  );
}
