'use client';

import { Check, ChevronDown, ListChecks } from 'lucide-react';

import { Link } from '@/components/link';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

type Props = {
  tid: string;
};

export const Validate = ({ tid }: Props) => {
  const { t } = useLocale('txns');
  const network = useConfig((s) => s.config.network);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="cursor-pointer gap-0.5 px-1.5"
          size="icon-sm"
          variant="outline"
        >
          <ListChecks className="size-4" />
          <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            className="flex items-center gap-2"
            href={`https://nearvalidate.org/txns/${tid}?network=${network}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>{t('validate')}</span>
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-green-400">
              <Check className="size-2.5 text-white" strokeWidth={3} />
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
