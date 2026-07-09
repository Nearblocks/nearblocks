'use client';

import { ShieldCheck } from 'lucide-react';
import { use } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { Badge } from '@/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  quantumSafePromise: Promise<boolean>;
};

export const QuantumSafeBadge = ({ quantumSafePromise }: Props) => {
  const { t } = useLocale('address');
  const quantumSafe = use(quantumSafePromise);

  if (!quantumSafe) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className="font-medium" variant="purple">
          <ShieldCheck className="size-3" />
          {t('quantumSafe.label')}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-60 wrap-break-word">
        {t('quantumSafe.tooltip')}
      </TooltipContent>
    </Tooltip>
  );
};
