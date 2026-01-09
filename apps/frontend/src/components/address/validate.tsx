'use client';

import { LuCircleCheckBig } from 'react-icons/lu';

import { Link } from '@/components/link';
import { useConfig } from '@/hooks/use-config';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';

type Props = {
  address: string;
};

export const Validate = ({ address }: Props) => {
  const networkId = useConfig((s) => s.networkId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-xs" variant="secondary">
          <LuCircleCheckBig className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link
            href={`https://nearvalidate.org/address/${address}?network=${networkId}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            Validate Account
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
