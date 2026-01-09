'use client';

import { VariantProps } from 'class-variance-authority';
import { useState } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';

import { Button, buttonVariants } from '@/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  className?: string;
  size?: VariantProps<typeof buttonVariants>['size'];
  text: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
};

export const Copy = ({
  className,
  size = 'icon-xs',
  text,
  variant = 'ghost',
}: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={className}
          onClick={onCopy}
          size={size}
          variant={variant}
        >
          {isCopied ? <LuCheck /> : <LuCopy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isCopied ? 'Copied' : 'Copy to Clipboard'}
      </TooltipContent>
    </Tooltip>
  );
};
