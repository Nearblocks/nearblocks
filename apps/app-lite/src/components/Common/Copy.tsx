import { useState } from 'react';

import Check from '@/components/Icons/Check';
import CopyIcon from '@/components/Icons/Copy';

export type CopyProps = {
  buttonClassName?: string;
  className?: string;
  text: string;
};

const Copy = ({
  buttonClassName = 'ml-1',
  className = 'text-primary w-4',
  text,
}: CopyProps) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button className={buttonClassName} onClick={onCopy} type="button">
      {copied ? (
        <Check className={className} />
      ) : (
        <CopyIcon className={className} />
      )}
    </button>
  );
};

export default Copy;
