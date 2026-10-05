import React, { useState } from 'react';

import Check from './Icons/Check';
import Copy from './Icons/Copy';

interface CopyButtonProps {
  buttonClassName: string;
  className: string;
  text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  buttonClassName,
  className,
  text,
}) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard
      .writeText(text)
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
