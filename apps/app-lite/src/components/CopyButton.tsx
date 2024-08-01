import React, { useState } from 'react';

import Check from './Icons/Check';
import Copy from './Icons/Copy';

interface CopyButtonProps {
  buttonClassName: string;
  className: string;
  url: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  buttonClassName,
  className,
  url,
}) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard
      .writeText(`https://lite.nearblocks.io/?rpcUrl=${url}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error('Failed to copy text: ', err));
  };

  return (
    <button className={buttonClassName} onClick={onCopy}>
      {copied ? (
        <Check className={className} />
      ) : (
        <Copy className={className} />
      )}
    </button>
  );
};

export default CopyButton;
