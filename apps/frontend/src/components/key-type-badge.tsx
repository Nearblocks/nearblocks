'use client';

import { keyAlgorithm } from '@/lib/keys';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  className?: string;
  publicKey: string;
};

export const KeyTypeBadge = ({ className, publicKey }: Props) => {
  const algo = keyAlgorithm(publicKey);

  const badge = (
    <Badge className={cn('font-medium', className)} variant={algo.variant}>
      {algo.label}
    </Badge>
  );

  if (!algo.tooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-60 wrap-break-word">
        {algo.tooltip}
      </TooltipContent>
    </Tooltip>
  );
};
